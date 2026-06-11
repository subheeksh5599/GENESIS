"use client";

import { useEffect, useState } from "react";

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

export default function AgentsPage() {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl tracking-[-0.015em]">Protocols</h1>
          <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-ink-soft mt-0.5">
            {agents.length} synthesized on Mantle
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-border p-6 animate-pulse">
              <div className="h-5 bg-surface-alt rounded w-3/4 mb-4" />
              <div className="h-4 bg-surface-alt rounded w-full mb-2" />
              <div className="h-4 bg-surface-alt rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-white border border-dashed border-muted p-20 text-center">
          <div className="text-5xl mb-4 text-muted">⬡</div>
          <h3 className="font-display font-semibold text-xl mb-2">No protocols yet</h3>
          <p className="font-mono text-[0.58rem] text-ink-soft">Synthesize your first protocol from the Synthesize tab.</p>
        </div>
      ) : (
        <div className="bg-white border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border font-mono text-[0.5rem] tracking-[0.15em] uppercase text-ink-soft text-left">
                  <th className="px-6 py-4 font-medium">Agent</th>
                  <th className="px-6 py-4 font-medium">Strategy</th>
                  <th className="px-6 py-4 font-medium">Protocols</th>
                  <th className="px-6 py-4 font-medium">TVL</th>
                  <th className="px-6 py-4 font-medium">PnL</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Contract</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {agents.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-alt transition-colors font-mono text-[0.56rem]">
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink">{a.name || "Strategy"}</div>
                      <div className="text-[0.46rem] text-ink-soft">#{a.id}</div>
                    </td>
                    <td className="px-6 py-4 text-ink-soft max-w-[200px] truncate">{a.strategy}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {a.protocols.map((p) => (
                          <span key={p} className="text-[0.45rem] px-1.5 py-0.5 bg-surface-alt border border-border">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{a.tvl}</td>
                    <td className={`px-6 py-4 font-medium ${parseFloat(a.pnl) >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>{a.pnl}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 ${a.status === "live" ? "text-[#4ade80]" : "text-[#fbbf24]"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${a.status === "live" ? "bg-[#4ade80]" : "bg-[#fbbf24]"}`} />
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://explorer.sepolia.mantle.xyz/address/${a.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        {a.contractAddress.slice(0, 8)}...
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
