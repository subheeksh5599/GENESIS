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

const MODELS = {
  primary: "nvidia/llama-3.1-nemotron-ultra-253b-v1",
  fast: "meta/llama-4-maverick-17b-128e-instruct",
  deep: "deepseek-ai/deepseek-r1",
} as const;

const MODEL = process.env.NVIDIA_MODEL || MODELS.primary;

function systemPrompt(upgradeable: boolean): string {
  const proxy = upgradeable
    ? `
CONTRACT PATTERN: UUPS Upgradeable Proxy
- Use @openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol
- Use @openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol
- Use initialize(address _owner) instead of constructor
- Include _authorizeUpgrade function (onlyOwner)
- Import all SafeERC20, ReentrancyGuard from @openzeppelin/contracts-upgradeable
- Storage follows upgradeable pattern (no immutable variables, no constructors)
`
    : `
CONTRACT PATTERN: Standard (immutable, constructor-based)
- Use constructor with Ownable(msg.sender)
- Use immutable for addresses where possible
- Standard OpenZeppelin imports (non-upgradeable)
`;

  return `You are an expert Solidity smart contract engineer for DeFi on Mantle Network (Ethereum L2, chain ID 5003 testnet).

Generate a COMPLETE, production-ready Solidity contract from a natural language strategy description.

Mantle protocols:
- mETH Protocol (0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa): liquid ETH staking
- Agni Finance: concentrated liquidity DEX
- Merchant Moe: Liquidity Book AMM
- USDY: Ondo yield-bearing stablecoin
- Fluxion: lending/borrowing

${proxy}

REQUIREMENTS:
1. Solidity 0.8.26, MIT license
2. NatSpec on every function with @notice, @param, @return
3. Include header comment:
   /// @custom:deployer Genesis Engine — Mantle Network
4. Events for every state change (indexed params where possible)
5. Emergency withdrawal function (onlyOwner, transfers all tokens)
6. Slippage protection with configurable minAmountOut
7. Gas optimized: avoid loops over unbounded arrays
8. Return ONLY the Solidity code — no explanation, no markdown, no backticks`;
}

export async function generateSolidity(
  strategyDescription: string,
  upgradeable = true,
): Promise<string> {
  const client = getClient();
  if (!client) {
    return generateTemplateContract(strategyDescription, upgradeable);
  }

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt(upgradeable) },
        {
          role: "user",
          content: `Generate a Solidity contract for this DeFi strategy on Mantle:\n\n${strategyDescription}\n\nReturn only the Solidity code.`,
        },
      ],
      temperature: 0.2,
      max_tokens: 4096,
      top_p: 0.95,
    });

    const code = response.choices[0]?.message?.content || "";
    return extractContractCode(code);
  } catch {
    return generateTemplateContract(strategyDescription, upgradeable);
  }
}

function extractContractCode(raw: string): string {
  let code = raw.replace(/^```solidity\s*/gm, "").replace(/^```\s*/gm, "");
  const pragmaIdx = code.indexOf("pragma solidity");
  if (pragmaIdx === -1) return code.trim();
  code = code.slice(pragmaIdx);
  const end = findMatchingClose(code);
  return end === -1 ? code.trim() : code.slice(0, end + 1).trim();
}

function findMatchingClose(code: string): number {
  let depth = 0;
  let started = false;
  for (let i = 0; i < code.length; i++) {
    if (code.slice(i, i + 8) === "contract") started = true;
    if (code[i] === "{") depth++;
    if (code[i] === "}") {
      depth--;
      if (depth === 0 && started) return i;
    }
  }
  return -1;
}

function generateTemplateContract(desc: string, upgradeable: boolean): string {
  const header = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
/// @custom:deployer Genesis Engine — Mantle Network`;

  if (upgradeable) {
    return `${header}

import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title GenesisStrategy
 * @notice Auto-generated upgradeable DeFi strategy for Mantle
 * @dev ${desc.slice(0, 80).replace(/\n/g, " ")}...
 */
contract GenesisStrategy is UUPSUpgradeable, ReentrancyGuardUpgradeable, OwnableUpgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    event StrategyExecuted(uint256 timestamp, uint256 totalValue);
    event RewardsClaimed(uint256 amount);
    event EmergencyWithdraw(address indexed token, uint256 amount);

    uint256 public totalValueLocked;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address _owner) public initializer {
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Ownable_init(_owner);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function executeStrategy() external nonReentrant onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "No funds");
        totalValueLocked = bal;
        emit StrategyExecuted(block.timestamp, bal);
    }

    function claimRewards() external nonReentrant {
        emit RewardsClaimed(0);
    }

    function emergencyWithdraw(address token) external onlyOwner {
        uint256 bal = IERC20Upgradeable(token).balanceOf(address(this));
        require(bal > 0, "No balance");
        IERC20Upgradeable(token).safeTransfer(owner(), bal);
        emit EmergencyWithdraw(token, bal);
    }

    receive() external payable {}
}`;
  }

  return `${header}

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GenesisStrategy is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    event StrategyExecuted(uint256 timestamp, uint256 totalValue);
    event RewardsClaimed(uint256 amount);
    event EmergencyWithdraw(address indexed token, uint256 amount);

    uint256 public totalValueLocked;

    constructor() Ownable(msg.sender) {}

    function executeStrategy() external nonReentrant onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "No funds");
        totalValueLocked = bal;
        emit StrategyExecuted(block.timestamp, bal);
    }

    function claimRewards() external nonReentrant {
        emit RewardsClaimed(0);
    }

    function emergencyWithdraw(address token) external onlyOwner {
        uint256 bal = IERC20(token).balanceOf(address(this));
        require(bal > 0, "No balance");
        IERC20(token).safeTransfer(owner(), bal);
        emit EmergencyWithdraw(token, bal);
    }

    receive() external payable {}
}`;
}
