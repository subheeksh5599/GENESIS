"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Agent {
  id: string;
  name: string;
  strategy: string;
  protocols: string[];
  contractAddress: string;
  txHash: string;
  createdAt: string;
  status: string;
  tvl: string;
  pnl: string;
}

export default function HistoryPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => setAgents(d.agents || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-semibold text-2xl tracking-[-0.015em]">History</h1>
        <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-ink-soft mt-0.5">
          {agents.length} total deployments
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-border p-5 animate-pulse">
              <div className="h-4 bg-surface-alt rounded w-1/3 mb-3" />
              <div className="h-3 bg-surface-alt rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-white border border-dashed border-muted p-20 text-center">
          <div className="text-5xl mb-4 text-muted">↗</div>
          <h3 className="font-display font-semibold text-xl mb-2">No history yet</h3>
          <p className="font-mono text-[0.58rem] text-ink-soft">Deploy an agent to see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((a, i) => (
            <motion.div
              key={a.id}
              className="bg-white border border-border p-5 hover:border-ink/15 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`w-2 h-2 rounded-full ${a.status === "live" ? "bg-[#4ade80]" : a.status === "paused" ? "bg-[#fbbf24]" : "bg-[#f87171]"}`} />
                    <h3 className="font-display font-semibold text-base truncate">{a.name || "Strategy Contract"}</h3>
                    <span className="font-mono text-[0.48rem] text-ink-soft tracking-[0.1em] uppercase shrink-0">#{a.id}</span>
                  </div>
                  <p className="font-mono text-[0.54rem] text-ink-soft leading-relaxed tracking-[0.04em] line-clamp-2 mb-3">{a.strategy}</p>
                  <div className="flex flex-wrap items-center gap-3 font-mono text-[0.46rem] text-muted tracking-[0.08em]">
                    <span>{new Date(a.createdAt).toLocaleString()}</span>
                    <span>·</span>
                    <span>{a.tvl} TVL</span>
                    <span>·</span>
                    <span className={parseFloat(a.pnl) >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}>{a.pnl}</span>
                    {a.protocols.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{a.protocols.join(", ")}</span>
                      </>
                    )}
                  </div>
                </div>
                <a
                  href={`https://explorer.sepolia.mantle.xyz/address/${a.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[0.48rem] text-accent hover:underline tracking-[0.06em] shrink-0 mt-1"
                >
                  View on Explorer →
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
