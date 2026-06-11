export default function DocsPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display font-semibold text-2xl tracking-[-0.015em]">Documentation</h1>
        <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-ink-soft mt-0.5">
          Genesis Engine
        </p>
      </div>

      {[
        {
          title: "How it works",
          items: [
            "Describe your DeFi strategy in natural language — the AI understands protocols, allocations, and risk parameters.",
            "The engine generates a complete Solidity smart contract using NVIDIA NIM (Llama Nemotron Ultra 253B).",
            "solc compiles the contract locally. Halmos symbolic execution can verify correctness.",
            "The contract deploys to Mantle Sepolia Testnet via viem wallet. An ERC-8004 agent identity is assigned.",
          ],
        },
        {
          title: "Protocols",
          items: [
            "mETH Protocol — Liquid ETH staking and restaking on Mantle",
            "Agni Finance — Concentrated liquidity DEX",
            "Merchant Moe — Liquidity Book AMM",
            "USDY — Ondo yield-bearing stablecoin",
          ],
        },
        {
          title: "Requirements",
          items: [
            "NVIDIA API key for AI contract generation",
            "Mantle Sepolia testnet MNT for gas (get from faucet.testnet.mantle.xyz)",
            "A funded deployer wallet (private key in .env.local)",
            "Node.js 22+ with Next.js 16",
          ],
        },
        {
          title: "Security",
          items: [
            "Private key stored server-side only — never exposed to client",
            "AI-generated contracts include ReentrancyGuard, SafeERC20, emergency withdrawal",
            "Slippage protection and minimum output validation on all swaps",
            "Formal verification pass recommended before mainnet deployment",
          ],
        },
      ].map((section) => (
        <div key={section.title} className="bg-white border border-border p-8">
          <h2 className="font-display font-semibold text-lg mb-4">{section.title}</h2>
          <ul className="space-y-3">
            {section.items.map((item, i) => (
              <li key={i} className="font-mono text-[0.58rem] text-ink-soft leading-relaxed tracking-[0.04em] flex gap-3">
                <span className="text-accent shrink-0 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
