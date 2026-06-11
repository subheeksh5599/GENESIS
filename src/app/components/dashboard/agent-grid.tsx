"use client";

import { motion } from "framer-motion";

interface Agent {
  id: string;
  name: string;
  strategy: string;
  protocols: string[];
  tvl: string;
  pnl: string;
  pnlUp: boolean;
  deployed: string;
  status: "live" | "paused" | "draft";
}

const MOCK_AGENTS: Agent[] = [
  {
    id: "8471",
    name: "Mantle Yield Vault",
    strategy: "mETH staking + Agni LP compounding",
    protocols: ["mETH", "Agni", "Merchant Moe"],
    tvl: "$1.4M",
    pnl: "+18.2%",
    pnlUp: true,
    deployed: "2h ago",
    status: "live",
  },
  {
    id: "6234",
    name: "Stable Flow Optimizer",
    strategy: "USDY yield routing + cross-DEX arb",
    protocols: ["USDY", "Agni"],
    tvl: "$892K",
    pnl: "+12.7%",
    pnlUp: true,
    deployed: "1d ago",
    status: "live",
  },
  {
    id: "5012",
    name: "Delta Neutral Hedge",
    strategy: "mETH long + perp short hedge",
    protocols: ["mETH", "Merchant Moe"],
    tvl: "$3.2M",
    pnl: "+24.1%",
    pnlUp: true,
    deployed: "3d ago",
    status: "live",
  },
  {
    id: "3987",
    name: "Liquidity Depth Scanner",
    strategy: "Concentrated LP rebalancing bot",
    protocols: ["Agni", "Merchant Moe"],
    tvl: "$456K",
    pnl: "-2.3%",
    pnlUp: false,
    deployed: "5d ago",
    status: "paused",
  },
  {
    id: "2156",
    name: "Cross-Protocol Harvest",
    strategy: "Auto-compound across 4 yield sources",
    protocols: ["mETH", "USDY", "Agni"],
    tvl: "$1.8M",
    pnl: "+31.5%",
    pnlUp: true,
    deployed: "1w ago",
    status: "live",
  },
  {
    id: "1093",
    name: "Volatility Arbitrage V2",
    strategy: "IV mispricing capture on Mantle",
    protocols: ["Merchant Moe"],
    tvl: "$678K",
    pnl: "+9.8%",
    pnlUp: true,
    deployed: "2w ago",
    status: "live",
  },
];

const STATUS_COLORS: Record<string, string> = {
  live: "bg-[#4ade80]",
  paused: "bg-[#fbbf24]",
  draft: "bg-muted",
};

export function AgentGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {MOCK_AGENTS.map((agent, i) => (
        <motion.div
          key={agent.id}
          className="bg-white border border-border p-6 hover:border-ink/15 transition-colors duration-300 cursor-pointer group"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 * i, duration: 0.5, ease: "easeOut" }}
          whileHover={{ y: -2 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-lg leading-tight mb-1 group-hover:text-accent transition-colors">
                {agent.name}
              </h3>
              <div className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-ink-soft">
                ERC-8004 #{agent.id}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[agent.status]}`} />
              <span className="font-mono text-[0.48rem] tracking-[0.15em] uppercase text-ink-soft">
                {agent.status}
              </span>
            </div>
          </div>

          {/* Strategy */}
          <p className="font-mono text-[0.58rem] leading-[1.7] text-ink-soft mb-4 tracking-[0.04em]">
            {agent.strategy}
          </p>

          {/* Protocols */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {agent.protocols.map((p) => (
              <span
                key={p}
                className="font-mono text-[0.48rem] tracking-[0.1em] px-2 py-0.5 bg-surface-alt border border-border text-ink-soft"
              >
                {p}
              </span>
            ))}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <div className="font-mono text-[0.7rem] font-medium">{agent.tvl}</div>
              <div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft">
                TVL
              </div>
            </div>
            <div>
              <div
                className={`font-mono text-[0.7rem] font-medium ${
                  agent.pnlUp ? "text-[#4ade80]" : "text-[#f87171]"
                }`}
              >
                {agent.pnl}
              </div>
              <div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft">
                PnL (30d)
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
            <span className="font-mono text-[0.48rem] tracking-[0.1em] text-muted">
              {agent.deployed}
            </span>
            <span className="font-mono text-[0.48rem] tracking-[0.12em] text-ink-soft opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-accent">
              View →
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
