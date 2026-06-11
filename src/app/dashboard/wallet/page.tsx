"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadWalletHistory, addWallet, removeWallet, setActiveWallet, getActiveWallet } from "@/app/lib/wallet-history";

const FAUCET_URL = "https://faucet.testnet.mantle.xyz";

export default function WalletPage() {
  const [wallet, setWallet] = useState<{ pk: string; addr: string } | null>(null);
  const [balance, setBalance] = useState<string>("...");
  const [needsFaucet, setNeedsFaucet] = useState(false);
  const [showPk, setShowPk] = useState(false);
  const [pasteKey, setPasteKey] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [agentCount, setAgentCount] = useState(0);

  useEffect(() => {
    const active = getActiveWallet();
    if (active) {
      setWallet({ pk: active.pk, addr: active.addr });
      fetchBalance(active.addr);
    }
    fetch("/api/agents").then(r => r.json()).then(d => setAgentCount(d.stats?.total || 0));
  }, []);

  const fetchBalance = async (addr: string) => {
    try {
      const res = await fetch(`/api/balance?address=${addr}`);
      const data = await res.json();
      setBalance(parseFloat(data.balance).toFixed(4));
      setNeedsFaucet(data.needsFaucet);
    } catch { setBalance("0"); }
  };

  const generateKey = async () => {
    const res = await fetch("/api/keygen");
    const data = await res.json();
    addWallet(data.privateKey, data.address);
    setWallet({ pk: data.privateKey, addr: data.address });
    setBalance("0.0000");
    setNeedsFaucet(true);
  };

  const handlePasteKey = async () => {
    const pk = pasteKey.trim();
    if (!pk.startsWith("0x") || pk.length !== 66) { alert("Invalid private key."); return; }
    const { privateKeyToAddress } = await import("viem/accounts");
    const addr = privateKeyToAddress(pk as `0x${string}`);
    addWallet(pk, addr);
    setWallet({ pk, addr });
    setPasteKey("");
    setShowPaste(false);
    fetchBalance(addr);
  };

  const disconnect = () => { if (wallet) { removeWallet(wallet.addr); const a = getActiveWallet(); if (a) { setWallet({ pk: a.pk, addr: a.addr }); fetchBalance(a.addr); } else { setWallet(null); setBalance("..."); } } };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-semibold text-2xl tracking-[-0.015em]">Wallet</h1>
        <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-ink-soft mt-0.5">{wallet ? "Connected" : "Connect to deploy"} · {agentCount} agents deployed</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-border p-8">
          <h2 className="font-display font-semibold text-lg mb-6">Key Management</h2>
          <AnimatePresence mode="wait">
            {!wallet ? (
              <motion.div key="no" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <button onClick={generateKey} className="font-display italic text-white bg-ink px-8 py-3 text-sm tracking-[0.03em] hover:bg-accent transition-colors w-full">Generate New Wallet</button>
                <div className="text-center font-mono text-[0.5rem] text-muted tracking-[0.1em] uppercase">or</div>
                {!showPaste ? (
                  <button onClick={() => setShowPaste(true)} className="font-mono text-[0.55rem] text-ink-soft w-full border border-border px-4 py-3 hover:bg-surface-alt transition-colors tracking-[0.08em]">Paste Private Key</button>
                ) : (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                    <input type="password" placeholder="0x..." value={pasteKey} onChange={(e) => setPasteKey(e.target.value)} className="w-full border border-border font-mono text-[0.55rem] px-4 py-3 focus:outline-none focus:border-ink/20" />
                    <div className="flex gap-3">
                      <button onClick={handlePasteKey} className="flex-1 font-mono text-[0.5rem] bg-ink text-white px-4 py-2.5 tracking-[0.08em] hover:bg-accent transition-colors">Connect</button>
                      <button onClick={() => { setShowPaste(false); setPasteKey(""); }} className="font-mono text-[0.5rem] text-muted px-4 py-2.5 hover:text-ink transition-colors">Cancel</button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-alt border border-border p-4"><div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft mb-1">Balance</div><div className={`font-display font-semibold text-2xl ${needsFaucet ? "text-[#fbbf24]" : "text-[#4ade80]"}`}>{balance} MNT</div></div>
                  <div className="bg-surface-alt border border-border p-4"><div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft mb-1">Deployments</div><div className="font-display font-semibold text-2xl">{agentCount}</div></div>
                </div>
                <div><div className="font-mono text-[0.48rem] tracking-[0.15em] uppercase text-ink-soft mb-2">Address</div><div className="font-mono text-[0.54rem] text-ink bg-surface-alt border border-border p-3 break-all">{wallet.addr}</div><button onClick={() => navigator.clipboard.writeText(wallet.addr)} className="font-mono text-[0.46rem] text-accent hover:underline mt-1.5 tracking-[0.05em]">Copy address</button></div>
                <div><div className="font-mono text-[0.48rem] tracking-[0.15em] uppercase text-ink-soft mb-2 flex items-center justify-between">Private Key<button onClick={() => setShowPk(!showPk)} className="font-mono text-[0.42rem] text-accent hover:underline">{showPk ? "HIDE" : "REVEAL"}</button></div>{showPk && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="font-mono text-[0.52rem] text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] p-3 break-all">{wallet.pk}</motion.div>}</div>
                <div className="flex gap-3 pt-2">
                  {needsFaucet && <a href={FAUCET_URL} target="_blank" rel="noopener noreferrer" className="flex-1 font-mono text-[0.5rem] bg-accent text-white text-center px-3 py-2.5 tracking-[0.1em] hover:bg-accent-light transition-colors">Get Testnet MNT →</a>}
                  <button onClick={() => fetchBalance(wallet.addr)} className="font-mono text-[0.5rem] text-ink-soft border border-border px-3 py-2.5 hover:bg-surface-alt transition-colors tracking-[0.08em]">Refresh</button>
                  <button onClick={disconnect} className="font-mono text-[0.5rem] text-muted hover:text-[#f87171] transition-colors tracking-[0.08em]">Disconnect</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="bg-white border border-border p-8">
          <h2 className="font-display font-semibold text-lg mb-6">How to deploy</h2>
          <div className="space-y-5">
            {[{ step: "1", text: "Generate a new wallet or paste your existing private key." },{ step: "2", text: "Copy your address and visit the Mantle Sepolia faucet to get testnet MNT.", link: FAUCET_URL, linkText: "Open Faucet" },{ step: "3", text: "Go to Deploy and describe your DeFi strategy in natural language." },{ step: "4", text: "The AI generates a Solidity contract, compiles it, and deploys to Mantle testnet." },{ step: "5", text: "View your agent under Agents and track it in Analytics and History." }].map((s) => (
              <div key={s.step} className="flex gap-4"><span className="font-display font-semibold text-xl text-accent/40 w-8 shrink-0">{s.step}</span><div><p className="font-mono text-[0.56rem] text-ink-soft leading-relaxed tracking-[0.04em]">{s.text}</p>{s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-1.5 font-mono text-[0.46rem] text-accent hover:underline tracking-[0.05em]">{s.linkText} →</a>}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
