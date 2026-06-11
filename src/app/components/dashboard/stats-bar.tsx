"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Stats {
  total: number;
  live: number;
  tvl: string;
  balance?: string;
  needsFaucet?: boolean;
  faucetUrl?: string;
  walletAddress?: string;
}

export function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [agentsRes, balanceRes] = await Promise.all([
          fetch("/api/agents"),
          fetch("/api/balance"),
        ]);
        const agentsData = await agentsRes.json();
        const balanceData = await balanceRes.json();

        setStats({
          total: agentsData.stats.total,
          live: agentsData.stats.live,
          tvl: agentsData.stats.tvl,
          balance: balanceData.balance,
          needsFaucet: balanceData.needsFaucet,
          faucetUrl: balanceData.faucetUrl,
          walletAddress: balanceData.address,
        });
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const items = [
    {
      value: loading ? "..." : stats?.total.toLocaleString() ?? "0",
      label: "Contracts Deployed",
    },
    {
      value: stats?.tvl ?? "$0",
      label: "Total Value Locked",
    },
    { value: loading ? "..." : `${stats?.live ?? 0}`, label: "Active Agents" },
    {
      value: loading ? "..." : stats?.needsFaucet ? "Low" : stats?.balance ? `${parseFloat(stats.balance).toFixed(3)} MNT` : "0 MNT",
      label: "Deployer Balance",
      faucet: stats?.needsFaucet,
      faucetUrl: stats?.faucetUrl,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((s, i) => (
        <motion.div
          key={i}
          className="bg-white border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 * i, duration: 0.5, ease: "easeOut" }}
        >
          <div
            className={`font-display font-semibold text-[1.8rem] leading-none mb-2 ${
              s.faucet ? "text-[#fbbf24]" : ""
            }`}
          >
            {s.value}
          </div>
          <div className="font-mono text-[0.52rem] tracking-[0.18em] uppercase text-ink-soft mb-1">
            {s.label}
          </div>
          {s.faucet && s.faucetUrl && (
            <a
              href={s.faucetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[0.48rem] text-accent hover:underline tracking-[0.08em]"
            >
              Get testnet MNT →
            </a>
          )}
        </motion.div>
      ))}
    </div>
  );
}
