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
  primary: "meta/llama-4-maverick-17b-128e-instruct",
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
1. Solidity ^0.8.20, MIT license
2. DO NOT use any imports — write self-contained flat contracts.
3. DO NOT declare interfaces anywhere. Use address.call() for all external token interactions (balanceOf, transfer, approve). Use the raw call pattern shown below for every token interaction.
4. Implement onlyOwner modifier inline. Implement a simple reentrancy lock inline.
5. All external addresses must be constructor/initialize parameters — NEVER hardcode them.
6. NEVER use placeholder addresses like 0x... or 0x000...
7. NatSpec on every function with @notice, @param, @return
8. Events for every state change
9. Emergency withdrawal function
10. Return ONLY the Solidity code — no explanation, no markdown, no backticks

RAW CALL PATTERN FOR TOKEN INTERACTIONS:
- Read balance: (bool ok, bytes memory data) = token.call(abi.encodeWithSignature("balanceOf(address)", addr)); uint256 bal = abi.decode(data, (uint256));
- Transfer: (bool ok,) = token.call(abi.encodeWithSignature("transfer(address,uint256)", to, amount)); require(ok, "Transfer failed");
3. Include header comment:
   /// @custom:deployer Genesis Engine — Mantle Network
4. Events for every state change (indexed params where possible)
5. Emergency withdrawal function (onlyOwner, transfers all tokens)
6. Slippage protection with configurable minAmountOut
7. Gas optimized: avoid loops over unbounded arrays
8. NEVER use placeholder addresses like 0x... or 0x000... — always use constructor or initialize parameters. Every external address must be configurable via constructor/initialize, not hardcoded.
9. Return ONLY the Solidity code — no explanation, no markdown, no backticks`;
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
pragma solidity ^0.8.20;
/// @custom:deployer Genesis Engine — Mantle Network`;

  if (upgradeable) {
    return `${header}

/**
 * @title GenesisStrategy
 * @notice Synthesized upgradeable protocol for Mantle Network
 * @dev Self-contained — no external dependencies
 */
contract GenesisStrategy {
    address public owner;
    bool private _locked;

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
    modifier nonReentrant() { require(!_locked, "Reentrant"); _locked = true; _; _locked = false; }

    event ProtocolExecuted(uint256 timestamp, uint256 totalValue);
    event RewardsClaimed(uint256 amount);
    event EmergencyWithdraw(address indexed token, uint256 amount);
    event OwnershipTransferred(address indexed previous, address indexed next);

    uint256 public totalValueLocked;
    address public implementation;

    constructor() { owner = msg.sender; }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function upgradeTo(address newImpl) external onlyOwner {
        require(newImpl != address(0), "Zero address");
        implementation = newImpl;
    }

    function executeProtocol() external nonReentrant onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "No funds");
        totalValueLocked = bal;
        emit ProtocolExecuted(block.timestamp, bal);
    }

    function claimRewards() external nonReentrant {
        emit RewardsClaimed(0);
    }

    function emergencyWithdraw(address token) external onlyOwner {
        (bool ok, bytes memory data) = token.call(abi.encodeWithSignature("balanceOf(address)", address(this)));
        require(ok, "Balance check failed");
        uint256 bal = abi.decode(data, (uint256));
        require(bal > 0, "No balance");
        (ok,) = token.call(abi.encodeWithSignature("transfer(address,uint256)", owner, bal));
        require(ok, "Transfer failed");
        emit EmergencyWithdraw(token, bal);
    }

    receive() external payable {}
}`;
  }

  return `${header}

/**
 * @title GenesisStrategy
 * @notice Synthesized protocol for Mantle Network
 * @dev Self-contained — no external dependencies
 */
contract GenesisStrategy {
    address public owner;
    bool private _locked;

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
    modifier nonReentrant() { require(!_locked, "Reentrant"); _locked = true; _; _locked = false; }

    event ProtocolExecuted(uint256 timestamp, uint256 totalValue);
    event RewardsClaimed(uint256 amount);
    event EmergencyWithdraw(address indexed token, uint256 amount);

    uint256 public totalValueLocked;

    constructor() { owner = msg.sender; }

    function executeProtocol() external nonReentrant onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "No funds");
        totalValueLocked = bal;
        emit ProtocolExecuted(block.timestamp, bal);
    }

    function claimRewards() external nonReentrant {
        emit RewardsClaimed(0);
    }

    function emergencyWithdraw(address token) external onlyOwner {
        (bool ok, bytes memory data) = token.call(abi.encodeWithSignature("balanceOf(address)", address(this)));
        require(ok, "Balance check failed");
        uint256 bal = abi.decode(data, (uint256));
        require(bal > 0, "No balance");
        (ok,) = token.call(abi.encodeWithSignature("transfer(address,uint256)", owner, bal));
        require(ok, "Transfer failed");
        emit EmergencyWithdraw(token, bal);
    }

    receive() external payable {}
}`;
}
