"use client";

import { motion } from "framer-motion";

const ACTIVITIES = [
  {
    type: "deploy",
    agent: "Mantle Yield Vault",
    id: "8471",
    detail: "Deployed to Mantle • 0x7a3f...b29c",
    time: "2m ago",
  },
  {
    type: "verify",
    agent: "Stable Flow Optimizer",
    id: "6234",
    detail: "Halmos verification passed • 47/47 tests",
    time: "14m ago",
  },
  {
    type: "rebalance",
    agent: "Delta Neutral Hedge",
    id: "5012",
    detail: "Rebalanced 12.4 mETH → Agni LP",
    time: "48m ago",
  },
  {
    type: "claim",
    agent: "Cross-Protocol Harvest",
    id: "2156",
    detail: "Claimed $4,281 in rewards",
    time: "1h ago",
  },
  {
    type: "mint",
    agent: "Volatility Arbitrage V2",
    id: "1093",
    detail: "ERC-8004 identity minted • #1093",
    time: "2h ago",
  },
  {
    type: "deploy",
    agent: "Liquidity Depth Scanner",
    id: "3987",
    detail: "Paused • stop-loss triggered at -15%",
    time: "3h ago",
  },
];

const ICONS: Record<string, string> = {
  deploy: "⊕",
  verify: "✓",
  rebalance: "⇄",
  claim: "$",
  mint: "⬡",
};

export function ActivityFeed() {
  return (
    <div className="bg-white border border-border">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <h3 className="font-display font-semibold text-base">Recent Activity</h3>
        <span className="font-mono text-[0.48rem] tracking-[0.15em] uppercase text-muted cursor-pointer hover:text-ink transition-colors">
          View all
        </span>
      </div>
      <div className="divide-y divide-border">
        {ACTIVITIES.map((a, i) => (
          <motion.div
            key={i}
            className="px-6 py-4 flex gap-4 items-start hover:bg-surface-alt transition-colors cursor-pointer"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
          >
            <span className="text-[0.85rem] text-ink-soft mt-0.5">{ICONS[a.type]}</span>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[0.56rem] font-medium text-ink truncate">
                {a.agent}
              </div>
              <div className="font-mono text-[0.5rem] text-ink-soft tracking-[0.04em] mt-0.5">
                {a.detail}
              </div>
            </div>
            <span className="font-mono text-[0.46rem] text-muted tracking-[0.1em] shrink-0 mt-0.5">
              {a.time}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
