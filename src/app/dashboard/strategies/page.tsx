"use client";

import { useEffect, useState } from "react";

export default function StrategiesPage() {
  const [agents, setAgents] = useState<{ id: string; name: string; strategy: string; pnl: string; tvl: string }[]>([]);
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
        <h1 className="font-display font-semibold text-2xl tracking-[-0.015em]">Strategies</h1>
        <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-ink-soft mt-0.5">
          Strategy marketplace
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-border p-8 animate-pulse">
              <div className="h-5 bg-surface-alt rounded w-1/2 mb-4" />
              <div className="h-4 bg-surface-alt rounded w-full mb-2" />
              <div className="h-4 bg-surface-alt rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-white border border-dashed border-muted p-20 text-center">
          <div className="text-5xl mb-4 text-muted">⊡</div>
          <h3 className="font-display font-semibold text-xl mb-2">No strategies yet</h3>
          <p className="font-mono text-[0.58rem] text-ink-soft">Deploy an agent to see its strategy here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {agents.map((a) => (
            <div key={a.id} className="bg-white border border-border p-6 hover:border-ink/15 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-semibold text-lg">{a.name || "Strategy"}</h3>
                  <p className="font-mono text-[0.48rem] text-ink-soft tracking-[0.15em] uppercase">ERC-8004 #{a.id}</p>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <div className="font-mono text-[0.7rem] font-medium">{a.tvl}</div>
                    <div className="font-mono text-[0.45rem] text-ink-soft">TVL</div>
                  </div>
                  <div>
                    <div className={`font-mono text-[0.7rem] font-medium ${parseFloat(a.pnl) >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>{a.pnl}</div>
                    <div className="font-mono text-[0.45rem] text-ink-soft">PnL</div>
                  </div>
                </div>
              </div>
              <p className="font-mono text-[0.56rem] text-ink-soft leading-relaxed tracking-[0.04em]">{a.strategy}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
