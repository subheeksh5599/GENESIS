"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const STORAGE_KEY = "genesis_wallet";

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
  const [showKey, setShowKey] = useState(false);
  const [wallet, setWallet] = useState<{ pk: string; addr: string } | null>(null);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => setAgents(d.agents || []))
      .finally(() => setLoading(false));

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setWallet(JSON.parse(raw));
    } catch { /* no wallet */ }
  }, []);

  const copyKey = () => {
    if (wallet) navigator.clipboard.writeText(wallet.pk);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-semibold text-2xl tracking-[-0.015em]">History</h1>
        <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-ink-soft mt-0.5">
          {agents.length} deployments
        </p>
      </div>

      {/* Wallet key info */}
      {wallet && (
        <div className="bg-white border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base">Wallet</h2>
            <button
              onClick={() => setShowKey(!showKey)}
              className="font-mono text-[0.46rem] text-accent hover:underline tracking-[0.06em]"
            >
              {showKey ? "HIDE KEY" : "SHOW KEY"}
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft mb-1">Address</div>
              <div className="font-mono text-[0.5rem] text-ink bg-surface-alt border border-border p-2.5 break-all">{wallet.addr}</div>
            </div>
            {showKey && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft mb-1 flex items-center justify-between">
                  Private Key
                  <button onClick={copyKey} className="font-mono text-[0.4rem] text-accent hover:underline">Copy</button>
                </div>
                <div className="font-mono text-[0.48rem] text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] p-2.5 break-all">{wallet.pk}</div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Deployments */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-border p-5 animate-pulse">
              <div className="h-4 bg-surface-alt rounded w-1/3 mb-3" />
              <div className="h-3 bg-surface-alt rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-white border border-dashed border-muted p-20 text-center">
          <div className="text-5xl mb-4 text-muted">↗</div>
          <h3 className="font-display font-semibold text-xl mb-2">No deployments yet</h3>
          <p className="font-mono text-[0.58rem] text-ink-soft">Deploy an agent to see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((a, i) => (
            <motion.div
              key={a.id}
              className="bg-white border border-border p-6 hover:border-ink/15 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`w-2 h-2 rounded-full ${a.status === "live" ? "bg-[#4ade80]" : a.status === "paused" ? "bg-[#fbbf24]" : "bg-[#f87171]"}`} />
                    <h3 className="font-display font-semibold text-base truncate">{a.name || "Strategy"}</h3>
                    <span className="font-mono text-[0.48rem] text-ink-soft tracking-[0.1em]">#{a.id}</span>
                  </div>
                  <p className="font-mono text-[0.54rem] text-ink-soft leading-relaxed line-clamp-2 mb-3">{a.strategy}</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[0.46rem] text-muted tracking-[0.06em]">
                    <span>{new Date(a.createdAt).toLocaleString()}</span>
                    <span>{a.tvl}</span>
                    <span className={parseFloat(a.pnl) >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}>{a.pnl}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0 text-right">
                  <a href={`https://explorer.sepolia.mantle.xyz/address/${a.contractAddress}`} target="_blank" rel="noopener noreferrer" className="font-mono text-[0.5rem] text-accent hover:underline tracking-[0.05em]">
                    {a.contractAddress.slice(0, 10)}...{a.contractAddress.slice(-6)} →
                  </a>
                  <a href={`https://explorer.sepolia.mantle.xyz/tx/${a.txHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-[0.46rem] text-muted hover:text-ink transition-colors tracking-[0.04em]">
                    TX: {a.txHash.slice(0, 10)}...
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
