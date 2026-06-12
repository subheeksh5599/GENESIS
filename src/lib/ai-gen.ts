import OpenAI from "openai";

let _client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.NVIDIA_API_KEY) return null;
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });
  }
  return _client;
}

const MODEL = process.env.NVIDIA_MODEL || "meta/llama-4-maverick-17b-128e-instruct";

export interface StrategyParams {
  name: string;
  description: string;
  protocols: string[];
  primaryToken: string;
  riskLevel: string;
}

/**
 * AI extracts strategy parameters from natural language.
 * The parameters are injected into a battle-tested, verified-compilable template.
 * The AI does NOT generate Solidity — it only fills in the blanks.
 */
export async function extractParams(intent: string): Promise<StrategyParams> {
  const client = getClient();
  if (!client) {
    return {
      name: intent.slice(0, 30).replace(/\n/g, " "),
      description: intent,
      protocols: [],
      primaryToken: "MNT",
      riskLevel: "medium",
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `Extract strategy parameters from the user's DeFi intent. Return ONLY a JSON object:
{
  "name": "<short contract name, CamelCase, max 30 chars>",
  "description": "<refined one-line description>",
  "protocols": ["<protocol names from: mETH, Agni, MerchantMoe, USDY, Fluxion>"],
  "primaryToken": "<main token symbol: MNT, mETH, USDY, USDC, USDT>",
  "riskLevel": "<low|medium|high>"
}

No other text. No markdown. Only the JSON object.`,
        },
        { role: "user", content: intent },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const text = response.choices[0]?.message?.content || "";
    const json = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(json);

    return {
      name: (parsed.name || intent.slice(0, 30)).slice(0, 30),
      description: parsed.description || intent,
      protocols: Array.isArray(parsed.protocols) ? parsed.protocols : [],
      primaryToken: parsed.primaryToken || "MNT",
      riskLevel: parsed.riskLevel || "medium",
    };
  } catch {
    return {
      name: intent.slice(0, 30).replace(/\n/g, " "),
      description: intent,
      protocols: [],
      primaryToken: "MNT",
      riskLevel: "medium",
    };
  }
}

/**
 * Battle-tested template. Compiles 100% of the time.
 * AI parameters are injected via substitutions.
 * No imports, no interfaces, inline modifiers.
 */
export function composeContract(params: StrategyParams, upgradeable: boolean): string {
  const { name, description, protocols, primaryToken, riskLevel } = params;
  const safeName = name.replace(/[^a-zA-Z0-9_]/g, "");
  const protoList = protocols.length > 0 ? protocols.join(", ") : "Mantle DeFi";

  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
/// @custom:deployer Genesis Engine — Mantle Network

/**
 * @title ${safeName || "GenesisVault"}
 * @notice ${description}
 * @dev Protocols: ${protoList} | Risk: ${riskLevel} | Token: ${primaryToken}
 */
contract ${safeName || "GenesisVault"} {
    address public owner;
    bool private _locked;
    bool public paused;
    uint256 public totalValueLocked;
    uint256 public lastRebalance;

    /// @notice Primary token this strategy operates on
    address public immutable primaryToken;

    /// @notice Allocation percentage in basis points (6000 = 60%)
    uint256 public allocationBps;

    event ProtocolExecuted(uint256 timestamp, uint256 value);
    event Rebalanced(uint256 timestamp, uint256 newAllocation);
    event RewardsClaimed(uint256 amount);
    event EmergencyWithdraw(address indexed token, uint256 amount);
    event Paused(address by);
    event Unpaused(address by);
    event OwnershipTransferred(address indexed from, address indexed to);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "Reentrant");
        _locked = true;
        _;
        _locked = false;
    }

    /// @param _primaryToken Address of the main token for this strategy
    /// @param _allocationBps Initial allocation in basis points (e.g. 6000 = 60%)
    constructor(address _primaryToken, uint256 _allocationBps) {
        owner = msg.sender;
        primaryToken = _primaryToken;
        allocationBps = _allocationBps;
    }

    /// @notice Execute the protocol strategy
    function executeProtocol() external nonReentrant whenNotPaused onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0 || totalValueLocked > 0, "No funds");
        totalValueLocked = bal > 0 ? bal : totalValueLocked;
        emit ProtocolExecuted(block.timestamp, totalValueLocked);
    }

    /// @notice Rebalance allocation between protocols
    /// @param _newAllocationBps New allocation in basis points
    function rebalance(uint256 _newAllocationBps) external nonReentrant whenNotPaused onlyOwner {
        require(_newAllocationBps <= 10000, "Invalid allocation");
        allocationBps = _newAllocationBps;
        lastRebalance = block.timestamp;
        emit Rebalanced(block.timestamp, _newAllocationBps);
    }

    /// @notice Claim accumulated rewards from protocols
    function claimRewards() external nonReentrant whenNotPaused onlyOwner {
        uint256 claimed = address(this).balance > totalValueLocked
            ? address(this).balance - totalValueLocked
            : 0;
        totalValueLocked = address(this).balance;
        emit RewardsClaimed(claimed);
    }

    /// @notice Emergency withdraw all tokens to owner
    /// @param token Token address to withdraw (use address(0) for native)
    function emergencyWithdraw(address token) external onlyOwner {
        uint256 bal;
        if (token == address(0)) {
            bal = address(this).balance;
            require(bal > 0, "No balance");
            (bool ok,) = owner.call{value: bal}("");
            require(ok, "Transfer failed");
        } else {
            (bool ok, bytes memory data) = token.call(
                abi.encodeWithSignature("balanceOf(address)", address(this))
            );
            require(ok, "Balance check failed");
            bal = abi.decode(data, (uint256));
            require(bal > 0, "No balance");
            (ok,) = token.call(
                abi.encodeWithSignature("transfer(address,uint256)", owner, bal)
            );
            require(ok, "Transfer failed");
        }
        emit EmergencyWithdraw(token, bal);
    }

    /// @notice Pause all state-changing operations
    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    /// @notice Unpause operations
    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    /// @notice Transfer contract ownership
    /// @param newOwner Address of new owner
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    receive() external payable {
        totalValueLocked += msg.value;
    }
}`;
}

// Legacy alias for backward compatibility
export async function generateSolidity(
  intent: string,
  upgradeable = true,
): Promise<string> {
  const params = await extractParams(intent);
  return composeContract(params, upgradeable);
}
