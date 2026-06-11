"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DeveloperPanel } from "@/app/components/dashboard/developer-panel";

interface Agent {
  id: string;
  name: string;
  strategy: string;
  protocols: string[];
  contractAddress: string;
  txHash: string;
  abi?: Record<string, unknown>[];
  source?: string;
  verified?: boolean;
  createdAt: string;
  status: string;
  tvl: string;
  pnl: string;
}

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/agents?id=${id}`)
      .then((r) => r.json())
      .then((d) => setAgent(d.agent || null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-surface-alt rounded w-1/3" />
        <div className="h-4 bg-surface-alt rounded w-1/2" />
        <div className="h-64 bg-surface-alt rounded" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display font-semibold text-2xl mb-2">Protocol not found</h2>
        <p className="font-mono text-[0.58rem] text-ink-soft">This protocol doesn&apos;t exist or was removed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className={`w-2 h-2 rounded-full ${agent.status === "live" ? "bg-[#4ade80]" : agent.status === "paused" ? "bg-[#fbbf24]" : "bg-[#f87171]"}`} />
          <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-ink-soft">ERC-8004 #{agent.id}</span>
          {agent.verified && (
            <span className="font-mono text-[0.48rem] bg-[#4ade80]/10 text-[#4ade80] px-2 py-0.5 tracking-[0.1em] uppercase">
              Verified
            </span>
          )}
        </div>
        <h1 className="font-display font-semibold text-2xl tracking-[-0.015em]">
          {agent.name || "Strategy Contract"}
        </h1>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { v: agent.tvl, l: "Total Value Locked" },
          { v: agent.pnl, l: "PnL (30d)", c: parseFloat(agent.pnl) >= 0 ? "text-[#4ade80]" : "text-[#f87171]" },
          { v: new Date(agent.createdAt).toLocaleDateString(), l: "Deployed" },
        ].map((s) => (
          <div key={s.l} className="bg-white border border-border p-5">
            <div className={`font-display font-semibold text-xl ${s.c || ""}`}>{s.v}</div>
            <div className="font-mono text-[0.48rem] tracking-[0.12em] uppercase text-ink-soft mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Strategy */}
      <div className="bg-white border border-border p-6">
        <h3 className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-ink-soft mb-3">Strategy</h3>
        <p className="font-mono text-[0.58rem] leading-relaxed text-ink">{agent.strategy}</p>
      </div>

      {/* Protocols */}
      {agent.protocols.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {agent.protocols.map((p) => (
            <span key={p} className="font-mono text-[0.5rem] tracking-[0.1em] px-3 py-1 bg-surface-alt border border-border text-ink-soft">
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Developer Integration */}
      <div className="bg-white border border-border p-8">
        <DeveloperPanel
          contractAddress={agent.contractAddress}
          txHash={agent.txHash}
          abi={agent.abi}
          source={agent.source}
          verified={agent.verified}
        />
      </div>
    </div>
  );
}
