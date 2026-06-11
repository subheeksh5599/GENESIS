"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Activity {
  type: "deploy" | "verify" | "rebalance" | "claim" | "mint";
  agent: string;
  id: string;
  detail: string;
  time: string;
  txHash?: string;
  contractAddress?: string;
}

const ICONS: Record<string, string> = {
  deploy: "⊕",
  verify: "✓",
  rebalance: "⇄",
  claim: "$",
  mint: "⬡",
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

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/agents");
        const data = await res.json();
        const agents = data.agents || [];

        const mapped: Activity[] = agents.map((a: Record<string, string>) => ({
          type: "deploy" as const,
          agent: a.name || "Strategy Contract",
          id: a.id,
          detail: `Deployed to Mantle • ${(a.txHash || "").slice(0, 10)}...`,
          time: timeAgo(a.createdAt),
          txHash: a.txHash,
          contractAddress: a.contractAddress,
        }));
        setActivities(mapped.slice(0, 8));
      } catch {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-border p-6 animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-5 h-5 bg-surface-alt rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-surface-alt rounded w-3/4" />
              <div className="h-2 bg-surface-alt rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white border border-dashed border-muted p-10 text-center">
        <div className="text-2xl mb-2 text-muted">—</div>
        <p className="font-mono text-[0.52rem] text-muted tracking-[0.08em]">
          Deploy an agent to see activity
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border">
      <div className="px-6 py-5 border-b border-border">
        <h3 className="font-display font-semibold text-base">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border">
        {activities.map((a, i) => (
          <motion.div
            key={i}
            className="px-6 py-4 flex gap-4 items-start hover:bg-surface-alt transition-colors cursor-pointer"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
            onClick={() => {
              if (a.txHash) {
                window.open(`https://explorer.sepolia.mantle.xyz/tx/${a.txHash}`, "_blank");
              }
            }}
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
