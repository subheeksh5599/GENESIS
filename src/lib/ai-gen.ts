import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

const SYSTEM_PROMPT = `You are an expert Solidity smart contract engineer specializing in DeFi strategies on the Mantle Network (an Ethereum L2 with ZK proofs).

When given a natural language description of a DeFi strategy, generate a COMPLETE, production-ready Solidity contract.

Mantle Network details:
- Chain ID: 5003 (testnet)
- Native token: MNT
- RPC: https://rpc.sepolia.mantle.xyz
- Explorer: https://explorer.sepolia.mantle.xyz

Available protocols on Mantle:
- mETH Protocol (liquid ETH staking/restaking)
- Agni Finance (DEX, concentrated liquidity AMM)
- Merchant Moe (DEX, Liquidity Book AMM)
- USDY (Ondo yield-bearing stablecoin)
- Fluxion (lending protocol)

Requirements for the generated contract:
1. Solidity 0.8.26, MIT license
2. Uses OpenZeppelin libraries (SafeERC20, ReentrancyGuard, Ownable)
3. Include NatSpec comments
4. Include events for all state changes
5. Implement proper access control
6. Handle edge cases (slippage, minimum outputs)
7. Use interfaces for external protocol interaction
8. Include emergency withdrawal function
9. Gas optimized
10. Return ONLY the Solidity code, no explanation, no markdown wrapping

Structure the contract with:
- Constructor that accepts initial parameters
- Core strategy execution function
- Reward claiming/compounding
- Withdrawal function
- Emergency pause/shutdown
- View functions for TVL, allocation percentages

If the description mentions specific protocols (mETH, Agni, Merchant Moe, USDY), use appropriate interfaces for those protocols.`;

export async function generateSolidity(strategyDescription: string): Promise<string> {
  const client = getClient();
  if (!client) {
    return generateTemplateContract(strategyDescription);
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Generate a Solidity smart contract for this DeFi strategy:\n\n${strategyDescription}` },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const code = response.choices[0]?.message?.content || "";
  return extractContractCode(code);
}

function extractContractCode(raw: string): string {
  const pragmaIdx = raw.indexOf("pragma solidity");
  if (pragmaIdx === -1) return raw;
  const code = raw.slice(pragmaIdx);
  const closingBrace = findMatchingClose(code);
  if (closingBrace === -1) return code;
  return code.slice(0, closingBrace + 1);
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
 * @dev Strategy: ${desc.slice(0, 80)}...
 */
contract GenesisStrategy is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    event StrategyExecuted(uint256 timestamp, uint256 totalValue);
    event RewardsClaimed(uint256 amount);
    event EmergencyWithdraw(address token, uint256 amount);

    address public immutable mETH;
    uint256 public totalValueLocked;

    constructor(address _mETH) Ownable(msg.sender) {
        mETH = _mETH;
    }

    function executeStrategy() external nonReentrant onlyOwner {
        // AI-generated strategy logic would go here
        // This is a template fallback when OpenAI API is not configured
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");
        totalValueLocked = balance;
        emit StrategyExecuted(block.timestamp, balance);
    }

    function claimRewards() external nonReentrant {
        // Claim and compound rewards
        uint256 claimed = 0;
        emit RewardsClaimed(claimed);
    }

    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransfer(owner(), balance);
        emit EmergencyWithdraw(token, balance);
    }

    receive() external payable {}
}`;
}
