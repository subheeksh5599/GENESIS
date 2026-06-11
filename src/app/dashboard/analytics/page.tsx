"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<{ total: number; live: number; tvl: string; agents: { id: string; name: string; pnl: string; tvl: string; createdAt: string }[] }>({ total: 0, live: 0, tvl: "$0", agents: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => setStats(d.stats ? { ...d.stats, agents: d.agents || [] } : { total: 0, live: 0, tvl: "$0", agents: d.agents || [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="font-display font-semibold text-2xl">Analytics</h1>
        <div className="grid grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-border p-6 animate-pulse">
              <div className="h-4 bg-surface-alt rounded w-1/2 mb-3" />
              <div className="h-8 bg-surface-alt rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-semibold text-2xl tracking-[-0.015em]">Analytics</h1>
        <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-ink-soft mt-0.5">
          Mantle Network
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {[
          { val: stats.total.toLocaleString(), label: "Total Executions" },
          { val: stats.live.toString(), label: "Live Protocols" },
          { val: stats.tvl, label: "Total Value Locked" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border p-6">
            <div className="font-mono text-[0.5rem] tracking-[0.15em] uppercase text-ink-soft mb-2">{s.label}</div>
            <div className="font-display font-semibold text-2xl">{s.val}</div>
          </div>
        ))}
      </div>

      {/* PnL chart */}
      <div className="bg-white border border-border p-8">
        <h3 className="font-display font-semibold text-lg mb-6">Agent Performance</h3>
        <div className="space-y-4">
          {stats.agents.slice(0, 8).map((a) => {
            const pnlVal = parseFloat(a.pnl);
            const width = Math.min(Math.abs(pnlVal) * 3, 100);
            return (
              <div key={a.id} className="flex items-center gap-4">
                <div className="w-32 font-mono text-[0.55rem] text-ink-soft truncate">{a.name || `#${a.id}`}</div>
                <div className="flex-1 h-6 bg-surface-alt relative">
                  <div
                    className={`h-full absolute top-0 left-0 ${pnlVal >= 0 ? "bg-[#4ade80]/20" : "bg-[#f87171]/20"}`}
                    style={{ width: `${width}%` }}
                  >
                    <div className={`h-full w-full ${pnlVal >= 0 ? "bg-[#4ade80]/40" : "bg-[#f87171]/40"}`} />
                  </div>
                </div>
                <div className={`font-mono text-[0.58rem] w-16 text-right ${pnlVal >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>
                  {a.pnl}
                </div>
              </div>
            );
          })}
          {stats.agents.length === 0 && (
            <p className="font-mono text-[0.55rem] text-muted text-center py-8">Execute protocols to see performance data</p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-border p-8">
        <h3 className="font-display font-semibold text-lg mb-6">Deployment Timeline</h3>
        <div className="space-y-3">
          {stats.agents.slice(0, 10).map((a, i) => (
            <div key={a.id} className="flex items-center gap-4 font-mono text-[0.52rem]">
              <span className="text-muted w-16 text-right">{new Date(a.createdAt).toLocaleDateString()}</span>
              <span className="w-2 h-2 rounded-full bg-ink/20" />
              <span className="text-ink-soft truncate">{a.name || `Agent #${a.id}`}</span>
            </div>
          ))}
          {stats.agents.length === 0 && (
            <p className="font-mono text-[0.55rem] text-muted text-center py-8">No executions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
