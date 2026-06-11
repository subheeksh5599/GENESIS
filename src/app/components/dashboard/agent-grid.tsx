"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Agent {
  id: string;
  name: string;
  strategy: string;
  protocols: string[];
  contractAddress: string;
  txHash: string;
  createdAt: string;
  status: "live" | "paused" | "failed";
  pnl: string;
  tvl: string;
}

const STATUS_COLORS: Record<string, string> = {
  live: "bg-[#4ade80]",
  paused: "bg-[#fbbf24]",
  failed: "bg-[#f87171]",
};

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function AgentGrid() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      setAgents(data.agents || []);
    } catch {
      // no data yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-border p-6 animate-pulse">
            <div className="h-5 bg-surface-alt rounded w-3/4 mb-4" />
            <div className="h-4 bg-surface-alt rounded w-full mb-3" />
            <div className="h-4 bg-surface-alt rounded w-2/3 mb-4" />
            <div className="flex gap-2 mb-4">
              <div className="h-5 bg-surface-alt rounded w-16" />
              <div className="h-5 bg-surface-alt rounded w-16" />
            </div>
            <div className="h-8 bg-surface-alt rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <motion.div
        className="bg-white border border-dashed border-muted p-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-4xl mb-4 text-muted">⊕</div>
        <h3 className="font-display font-semibold text-xl mb-2">No protocols deployed</h3>
        <p className="font-mono text-[0.58rem] text-ink-soft tracking-[0.06em]">
          Click &ldquo;Synthesize Protocol&rdquo; to create your first verified protocol on Mantle.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {agents.map((agent, i) => (
        <motion.div
          key={agent.id}
          className="bg-white border border-border p-6 hover:border-ink/15 transition-colors duration-300 cursor-pointer group"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 * i, duration: 0.5, ease: "easeOut" }}
          whileHover={{ y: -2 }}
          onClick={() => router.push(`/dashboard/agents/${agent.id}`)}
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-lg leading-tight mb-1 group-hover:text-accent transition-colors">
                {agent.name || "Strategy Contract"}
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

          <p className="font-mono text-[0.58rem] leading-[1.7] text-ink-soft mb-4 tracking-[0.04em] line-clamp-2">
            {agent.strategy}
          </p>

          {agent.protocols.length > 0 && (
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
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <div className="font-mono text-[0.7rem] font-medium">{agent.tvl}</div>
              <div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft">
                TVL
              </div>
            </div>
            <div>
              <div className={`font-mono text-[0.7rem] font-medium ${parseFloat(agent.pnl) >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>
                {agent.pnl}
              </div>
              <div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft">
                PnL
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
            <a
              href={`https://explorer.sepolia.mantle.xyz/address/${agent.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[0.46rem] tracking-[0.1em] text-muted hover:text-ink transition-colors truncate max-w-[160px]"
            >
              {agent.contractAddress.slice(0, 10)}...
            </a>
            <span className="font-mono text-[0.48rem] tracking-[0.1em] text-ink-soft opacity-0 group-hover:opacity-100 transition-opacity">
              {timeAgo(agent.createdAt)}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
