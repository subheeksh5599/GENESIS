"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { loadWalletHistory, setActiveWallet, getActiveWallet } from "@/app/lib/wallet-history";

interface Agent {
  id: string;
  name: string;
  strategy: string;
  protocols: string[];
  contractAddress: string;
  deployerAddress: string;
  txHash: string;
  createdAt: string;
  status: string;
  tvl: string;
  pnl: string;
  verified?: boolean;
}

interface WalletEntry { pk: string; addr: string; createdAt: number }

export default function HistoryPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [activeAddr, setActiveAddr] = useState<string>("");

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => setAgents(d.agents || []))
      .finally(() => setLoading(false));

    setWallets(loadWalletHistory());
    const active = getActiveWallet();
    if (active) setActiveAddr(active.addr);
  }, []);

  const toggleKey = (addr: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(addr)) next.delete(addr);
      else next.add(addr);
      return next;
    });
  };

  const useWallet = (addr: string) => {
    setActiveWallet(addr);
    setActiveAddr(addr);
  };

  const agentsForWallet = (addr: string) =>
    agents.filter((a) => a.deployerAddress?.toLowerCase() === addr.toLowerCase());

  const copyKey = (pk: string) => navigator.clipboard.writeText(pk);

  if (loading) {
    return <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="bg-white border border-border p-5 animate-pulse"><div className="h-4 bg-surface-alt rounded w-1/3"/></div>)}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-semibold text-2xl tracking-[-0.015em]">History</h1>
        <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-ink-soft mt-0.5">
          {wallets.length} wallets · {agents.length} executions
        </p>
      </div>

      {wallets.length === 0 && agents.length === 0 ? (
        <div className="bg-white border border-dashed border-muted p-20 text-center">
          <div className="text-5xl mb-4 text-muted">↗</div>
          <h3 className="font-display font-semibold text-xl mb-2">No history yet</h3>
          <p className="font-mono text-[0.58rem] text-ink-soft">Connect a wallet and synthesize a protocol.</p>
        </div>
      ) : (
        wallets.map((w) => {
          const walletAgents = agentsForWallet(w.addr);
          const isActive = w.addr.toLowerCase() === activeAddr.toLowerCase();

          return (
            <motion.div
              key={w.addr}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-border overflow-hidden"
            >
              {/* Wallet header */}
              <div className={`p-5 flex items-center justify-between ${isActive ? "border-l-2 border-l-[#4ade80] bg-[#f0fdf4]/30" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    {isActive && <span className="font-mono text-[0.48rem] text-[#4ade80] tracking-[0.1em] font-medium">ACTIVE</span>}
                    <span className="font-mono text-[0.54rem] text-ink font-medium truncate">{w.addr.slice(0,10)}...{w.addr.slice(-8)}</span>
                    <span className="font-mono text-[0.44rem] text-muted">{new Date(w.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="font-mono text-[0.46rem] text-ink-soft">
                    {walletAgents.length} contract{walletAgents.length !== 1 ? "s" : ""} deployed
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleKey(w.addr)}
                    className="font-mono text-[0.46rem] text-accent hover:underline tracking-[0.06em]"
                  >
                    {visibleKeys.has(w.addr) ? "HIDE KEY" : "SHOW KEY"}
                  </button>
                  <button
                    onClick={() => copyKey(w.pk)}
                    className="font-mono text-[0.44rem] text-muted hover:text-ink transition-colors tracking-[0.06em]"
                  >
                    COPY
                  </button>
                  {!isActive && (
                    <button
                      onClick={() => useWallet(w.addr)}
                      className="font-mono text-[0.46rem] bg-ink text-white px-3 py-1.5 tracking-[0.06em] hover:bg-accent transition-colors"
                    >
                      USE
                    </button>
                  )}
                </div>
              </div>

              {/* Revealed private key */}
              {visibleKeys.has(w.addr) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-5 pb-4"
                >
                  <div className="font-mono text-[0.5rem] text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] p-3 break-all leading-relaxed">
                    {w.pk}
                  </div>
                </motion.div>
              )}

              {/* Deployed contracts */}
              {walletAgents.length > 0 && (
                <div className="border-t border-border divide-y divide-border">
                  {walletAgents.map((a) => (
                    <div key={a.id} className="px-5 py-3 flex items-center justify-between hover:bg-surface-alt transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.status === "live" ? "bg-[#4ade80]" : "bg-[#fbbf24]"}`} />
                        <div className="min-w-0">
                          <div className="font-mono text-[0.52rem] text-ink truncate">{a.name || "Strategy"} <span className="text-ink-soft">#{a.id}</span></div>
                          <div className="font-mono text-[0.44rem] text-muted truncate">{a.contractAddress.slice(0,12)}...{a.contractAddress.slice(-6)}</div>
                        </div>
                        {a.verified && <span className="font-mono text-[0.4rem] bg-[#4ade80]/10 text-[#4ade80] px-1.5 py-0.5 shrink-0">VERIFIED</span>}
                      </div>
                      <div className="flex items-center gap-4 shrink-0 font-mono text-[0.46rem]">
                        <span>{a.tvl}</span>
                        <span className={parseFloat(a.pnl) >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}>{a.pnl}</span>
                        <a href={`https://explorer.sepolia.mantle.xyz/address/${a.contractAddress}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Explorer →</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })
      )}
    </div>
  );
}
