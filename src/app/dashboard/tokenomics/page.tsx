"use client";

import { motion } from "framer-motion";

export default function TokenomicsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display font-semibold text-2xl tracking-[-0.015em]">Business Model</h1>
        <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-ink-soft mt-0.5">
          Coming soon · Roadmap
        </p>
      </div>

      {/* Upcoming banner */}
      <div className="bg-[#f0fdf4] border border-[#4ade80]/30 p-5 flex items-center gap-3">
        <span className="text-lg">◆</span>
        <div>
          <div className="font-mono text-[0.52rem] text-[#166534] font-medium">Upcoming Feature</div>
          <p className="font-mono text-[0.48rem] text-[#15803d]/70">
            Tokenomics, revenue model, and go-to-market strategy will be implemented post-hackathon. This page represents the planned business architecture.
          </p>
        </div>
      </div>

      {/* Revenue model */}
      <div className="bg-white border border-border p-8">
        <h2 className="font-display font-semibold text-lg mb-6">Revenue Streams</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { title: "Deployment Fees", value: "0.1%", desc: "Fee on TVL deposited into AI-generated strategies. Charged only on profitable positions.", color: "text-accent" },
            { title: "Strategy Marketplace", value: "5%", desc: "Creator royalty when other users clone and deploy a top-performing agent's strategy.", color: "text-ink" },
            { title: "Pro Tier", value: "$99/mo", desc: "Advanced agents, priority security review, custom protocol integrations, team dashboards.", color: "text-ink" },
          ].map((r) => (
            <motion.div key={r.title} className="border border-border p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft mb-2">{r.title}</div>
              <div className={`font-display font-semibold text-2xl ${r.color} mb-2`}>{r.value}</div>
              <p className="font-mono text-[0.52rem] text-ink-soft leading-relaxed">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tokenomics */}
      <div className="bg-white border border-border p-8">
        <h2 className="font-display font-semibold text-lg mb-6">$GENESIS Token</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            {[
              { label: "Total Supply", value: "100,000,000 $GENESIS" },
              { label: "Community & Ecosystem", value: "40% — Staking rewards, grants, liquidity mining" },
              { label: "Protocol Treasury", value: "25% — Governed by token holders, funds development" },
              { label: "Team & Advisors", value: "15% — 4-year linear vesting, 1-year cliff" },
              { label: "Early Backers", value: "12% — 2-year linear vesting" },
              { label: "Airdrop & Incentives", value: "8% — Retroactive rewards for early deployers" },
            ].map((t) => (
              <div key={t.label}>
                <div className="font-mono text-[0.48rem] tracking-[0.12em] uppercase text-ink-soft mb-1">{t.label}</div>
                <div className="font-mono text-[0.58rem] font-medium">{t.value}</div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="bg-surface-alt border border-border p-5">
              <div className="font-mono text-[0.48rem] tracking-[0.12em] uppercase text-ink-soft mb-3">Token Utility</div>
              <ul className="space-y-3">
                {[
                  "Fee discount — pay deployment fees in $GENESIS at 50% off",
                  "Governance — vote on protocol upgrades, fee parameters, treasury allocation",
                  "Staking — earn yield from protocol revenue (30% of fees → stakers)",
                  "Boost — stake to increase agent visibility in strategy marketplace",
                  "Gas sponsorship — stake to sponsor gas-free deployments for new users",
                ].map((u, i) => (
                  <li key={i} className="font-mono text-[0.54rem] text-ink-soft flex gap-2">
                    <span className="text-accent">•</span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* GTM */}
      <div className="bg-white border border-border p-8">
        <h2 className="font-display font-semibold text-lg mb-6">Go-to-Market</h2>
        <div className="space-y-4">
          {[
            { phase: "Phase 1 — Launch", timeline: "Turing Test Hackathon → Month 1", actions: "Deploy on Mantle mainnet. Target Mantle ecosystem DAOs and DeFi protocols. Open-source the security review agent. Publish Paschov catalog as a community standard." },
            { phase: "Phase 2 — Growth", timeline: "Months 2-6", actions: "Integrate with Byreal Skills CLI for agentic wallet execution. Partner with Nansen for on-chain strategy analytics. Launch $GENESIS token on Mantle. Activate liquidity mining for strategy creators." },
            { phase: "Phase 3 — Scale", timeline: "Months 6-12", actions: "Multi-chain expansion (Base, Arbitrum). Institutional compliance layer for regulated DeFi. White-label solution for protocol DAOs to offer AI-generated vaults to their users." },
          ].map((p) => (
            <div key={p.phase} className="border border-border p-5">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-display font-semibold text-base">{p.phase}</span>
                <span className="font-mono text-[0.46rem] text-muted tracking-[0.1em] uppercase">{p.timeline}</span>
              </div>
              <p className="font-mono text-[0.54rem] text-ink-soft leading-relaxed">{p.actions}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive moat */}
      <div className="bg-white border border-border p-8">
        <h2 className="font-display font-semibold text-lg mb-6">Competitive Moat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { title: "Paschov Catalog", desc: "Proprietary 20-pattern vulnerability framework. Becomes more accurate with every deployment. Network effect: more agents → better review → safer contracts → more agents." },
            { title: "Mantle-First", desc: "Deep integration with Mantle's ZK infrastructure, mETH, USDY, and partner protocols. Not a generic multi-chain tool — optimized for Mantle's unique DeFi surface." },
            { title: "ERC-8004 Identity", desc: "Every agent has a permanent on-chain reputation. Strategy performance and security history are publicly verifiable. Creates a trust layer competitors cannot replicate." },
            { title: "Strategy Marketplace", desc: "Two-sided marketplace: creators earn royalties, deployers get battle-tested strategies. Flywheel: performance data → better strategies → more users → more data." },
          ].map((m) => (
            <div key={m.title} className="border border-border p-5">
              <h3 className="font-mono text-[0.55rem] font-medium mb-2">{m.title}</h3>
              <p className="font-mono text-[0.5rem] text-ink-soft leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
