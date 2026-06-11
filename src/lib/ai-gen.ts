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

// NVIDIA NIM models — ordered by capability for Solidity generation
const MODELS = {
  primary: "nvidia/llama-3.1-nemotron-ultra-253b-v1",     // strongest reasoning + code
  fast: "meta/llama-4-maverick-17b-128e-instruct",         // good balance
  deep: "deepseek-ai/deepseek-r1",                          // deep reasoning (slower)
} as const;

const MODEL = process.env.NVIDIA_MODEL || MODELS.primary;

const SYSTEM_PROMPT = `You are an expert Solidity smart contract engineer specializing in DeFi strategies on the Mantle Network (an Ethereum L2 with ZK proofs).

When given a natural language description of a DeFi strategy, generate a COMPLETE, production-ready Solidity contract.

Mantle Network (chain ID 5003 testnet):
- Native token: MNT
- RPC: https://rpc.sepolia.mantle.xyz

Protocols on Mantle:
- mETH Protocol: liquid ETH staking/restaking — mETH contract at 0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa
- Agni Finance: concentrated liquidity DEX — swap, add liquidity, collect fees
- Merchant Moe: Liquidity Book AMM — swap, add liquidity
- USDY: Ondo yield-bearing stablecoin
- Fluxion: lending/borrowing protocol

Contract requirements:
1. Solidity 0.8.26, MIT license
2. Use OpenZeppelin (SafeERC20, ReentrancyGuard, Ownable)
3. NatSpec comments on all functions
4. Events for every state change
5. Emergency withdrawal function
6. Slippage protection with configurable min amounts
7. Gas optimized: avoid loops over unbounded arrays, use immutable where possible
8. Return ONLY the Solidity code — no explanation, no markdown fences, no commentary

Structure the contract with: constructor, core execution, reward claim/compound, emergency withdraw, view functions for TVL and allocation.`;

export async function generateSolidity(strategyDescription: string): Promise<string> {
  const client = getClient();
  if (!client) {
    return generateTemplateContract(strategyDescription);
  }

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate a Solidity smart contract for this DeFi strategy on Mantle Network:\n\n${strategyDescription}\n\nReturn only the Solidity code, no explanation.`,
        },
      ],
      temperature: 0.2,
      max_tokens: 4096,
      top_p: 0.95,
    });

    const code = response.choices[0]?.message?.content || "";
    return extractContractCode(code);
  } catch {
    return generateTemplateContract(strategyDescription);
  }
}

function extractContractCode(raw: string): string {
  // Strip markdown code fences
  let code = raw.replace(/^```solidity\s*/gm, "").replace(/^```\s*/gm, "");
  const pragmaIdx = code.indexOf("pragma solidity");
  if (pragmaIdx === -1) return code.trim();
  code = code.slice(pragmaIdx);
  const closingBrace = findMatchingClose(code);
  if (closingBrace === -1) return code.trim();
  return code.slice(0, closingBrace + 1).trim();
}

function findMatchingClose(code: string): number {
  let depth = 0;
  let inContract = false;
  for (let i = 0; i < code.length; i++) {
    if (code.slice(i, i + 8) === "contract" && !inContract) inContract = true;
    if (code[i] === "{") depth++;
    if (code[i] === "}") {
      depth--;
      if (depth === 0 && inContract) return i;
    }
  }
  return -1;
}

function generateTemplateContract(desc: string): string {
  return `// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GenesisStrategy
 * @notice Auto-generated DeFi strategy for Mantle Network
 * @dev ${desc.slice(0, 80).replace(/\n/g, " ")}...
 */
contract GenesisStrategy is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    event StrategyExecuted(uint256 timestamp, uint256 totalValue);
    event RewardsClaimed(uint256 amount);
    event EmergencyWithdraw(address indexed token, uint256 amount);

    address public immutable mETH;
    uint256 public totalValueLocked;

    constructor(address _mETH) Ownable(msg.sender) {
        require(_mETH != address(0), "Zero address");
        mETH = _mETH;
    }

    function executeStrategy() external nonReentrant onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to deploy");
        totalValueLocked = balance;
        emit StrategyExecuted(block.timestamp, balance);
    }

    function claimRewards() external nonReentrant {
        uint256 claimed = 0;
        emit RewardsClaimed(claimed);
    }

    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        IERC20(token).safeTransfer(owner(), balance);
        emit EmergencyWithdraw(token, balance);
    }

    receive() external payable {}
}`;
}
