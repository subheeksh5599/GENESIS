"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface DeployModalProps {
  open: boolean;
  onClose: () => void;
  onDeployed: () => void;
}

const PROTOCOLS = ["mETH", "Agni Finance", "Merchant Moe", "USDY", "Fluxion"];
const ALLOCATIONS = ["10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"];

export function DeployModal({ open, onClose, onDeployed }: DeployModalProps) {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState("");
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);
  const [alloc, setAlloc] = useState("60");
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ id: string; contractAddress: string; txHash: string; source?: string } | null>(null);
  const [faucetInfo, setFaucetInfo] = useState<{ faucetUrl?: string; walletAddress?: string } | null>(null);

  const toggleProtocol = (p: string) => {
    setSelectedProtocols((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setError("");

    // Read private key from sessionStorage
    let privateKey = "";
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("genesis_wallet");
      if (raw) {
        try {
          const w = JSON.parse(raw);
          privateKey = w.pk;
        } catch { /* ignore */ }
      }
    }

    if (!privateKey) {
      setError("No wallet connected. Go to the Wallet panel and generate or paste a private key first.");
      setDeploying(false);
      return;
    }

    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: intent || `Allocate ${alloc}% to ${selectedProtocols.join(" + ")}, compound rewards, rebalance weekly`,
          protocols: selectedProtocols,
          privateKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.faucetUrl) {
          setFaucetInfo({ faucetUrl: data.faucetUrl, walletAddress: data.walletAddress });
          setError(data.error || "Deployment failed");
        } else {
          setError(data.error || "Deployment failed");
        }
        setDeploying(false);
        return;
      }

      setResult(data.agent);
      setDeployed(true);
      onDeployed();
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setDeploying(false);
    }
  };

  const reset = () => {
    setStep(1);
    setIntent("");
    setSelectedProtocols([]);
    setAlloc("60");
    setDeploying(false);
    setDeployed(false);
    setError("");
    setResult(null);
    setFaucetInfo(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-ink/40 z-[300] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[301] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-full max-w-[600px] max-h-[90vh] overflow-y-auto border border-border shadow-[0_20px_80px_rgba(0,0,0,0.12)]"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.0, 1.0] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-border">
                <div>
                  <h2 className="font-display font-semibold text-xl">Deploy an Agent</h2>
                  <p className="font-mono text-[0.52rem] tracking-[0.15em] uppercase text-ink-soft mt-1">
                    {deploying ? "Deploying..." : deployed ? "Complete" : `Step ${step} of 3`}
                  </p>
                </div>
                <button onClick={onClose} className="font-mono text-muted hover:text-ink transition-colors text-lg">×</button>
              </div>

              <div className="px-8 py-8">
                {/* Error state */}
                {error && !deployed && (
                  <div className="bg-[#fef2f2] border border-[#fecaca] p-6 mb-6">
                    <div className="font-mono text-[0.55rem] text-[#dc2626] font-medium mb-2 tracking-[0.05em]">Deployment Failed</div>
                    <p className="font-mono text-[0.55rem] text-[#991b1b] leading-relaxed whitespace-pre-wrap">{error}</p>
                    {faucetInfo?.faucetUrl && (
                      <a
                        href={faucetInfo.faucetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 font-mono text-[0.5rem] bg-accent text-white px-3 py-1.5 tracking-[0.1em] hover:bg-accent-light transition-colors"
                      >
                        Open Faucet →
                      </a>
                    )}
                  </div>
                )}

                {deployed && result ? (
                  <div className="text-center py-10">
                    <motion.div
                      className="w-16 h-16 rounded-full bg-[#4ade80]/10 flex items-center justify-center mx-auto mb-6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <span className="text-2xl text-[#4ade80]">✓</span>
                    </motion.div>
                    <h3 className="font-display font-semibold text-2xl mb-2">Deployment Complete</h3>
                    <p className="font-mono text-[0.58rem] text-ink-soft mb-2 tracking-[0.05em]">
                      ERC-8004 Agent #{result.id} is live on Mantle
                    </p>
                    <div className="bg-surface-alt border border-border p-4 mb-6 text-left space-y-2 font-mono text-[0.55rem]">
                      <div className="flex justify-between">
                        <span className="text-ink-soft">Contract</span>
                        <a href={`https://explorer.sepolia.mantle.xyz/address/${result.contractAddress}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline truncate max-w-[240px]">
                          {result.contractAddress.slice(0, 12)}...
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-soft">Transaction</span>
                        <a href={`https://explorer.sepolia.mantle.xyz/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline truncate max-w-[240px]">
                          {result.txHash.slice(0, 12)}...
                        </a>
                      </div>
                    </div>
                    <button onClick={reset} className="font-display italic text-white bg-ink px-8 py-2.5 text-sm tracking-[0.03em] hover:bg-accent transition-colors">
                      View Dashboard
                    </button>
                  </div>
                ) : deploying ? (
                  <div className="text-center py-14 space-y-5">
                    <motion.div
                      className="w-12 h-12 border-2 border-ink/10 border-t-accent rounded-full mx-auto"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="font-mono text-[0.6rem] text-ink-soft tracking-[0.08em] space-y-1">
                      <p>Generating Solidity contract...</p>
                      <p className="text-[0.5rem] text-muted">Compiling with solc + deploying to Mantle testnet</p>
                    </div>
                  </div>
                ) : step === 1 ? (
                  <div className="space-y-6">
                    <div>
                      <label className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-ink-soft mb-3 block">
                        Describe your strategy
                      </label>
                      <textarea
                        className="w-full border border-border bg-surface-alt p-4 font-mono text-[0.62rem] leading-[1.8] text-ink resize-none focus:outline-none focus:border-ink/20 transition-colors h-32"
                        placeholder="e.g. Allocate 60% to mETH staking, provide 40% as liquidity to Agni mETH/USDC pool, rebalance weekly, compound rewards automatically..."
                        value={intent}
                        onChange={(e) => setIntent(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-ink-soft mb-3 block">
                        Target protocols
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {PROTOCOLS.map((p) => (
                          <button
                            key={p}
                            onClick={() => toggleProtocol(p)}
                            className={`font-mono text-[0.52rem] tracking-[0.1em] px-3 py-1.5 border transition-all ${
                              selectedProtocols.includes(p)
                                ? "bg-ink text-white border-ink"
                                : "bg-white text-ink-soft border-border hover:border-ink/20"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setStep(2)} className="font-display italic text-white bg-ink px-8 py-2.5 text-sm tracking-[0.03em] hover:bg-accent transition-colors w-full">
                      Continue
                    </button>
                  </div>
                ) : step === 2 ? (
                  <div className="space-y-6">
                    <div>
                      <label className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-ink-soft mb-3 block">
                        Allocation
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ALLOCATIONS.map((a) => (
                          <button
                            key={a}
                            onClick={() => setAlloc(a.replace("%", ""))}
                            className={`font-mono text-[0.52rem] tracking-[0.1em] px-3 py-1.5 border transition-all ${
                              alloc === a.replace("%", "")
                                ? "bg-ink text-white border-ink"
                                : "bg-white text-ink-soft border-border hover:border-ink/20"
                            }`}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-ink-soft mb-3 block">
                        Risk
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[["Slippage", "0.3%"], ["Stop-loss", "15%"], ["Rebalance", "Weekly"], ["Target", "Mantle Testnet"]].map(([label, val]) => (
                          <div key={label} className="border border-border p-3">
                            <div className="font-mono text-[0.48rem] tracking-[0.15em] uppercase text-ink-soft mb-1">{label}</div>
                            <div className="font-mono text-[0.7rem] font-medium">{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-ink-soft border border-border px-6 py-2.5 hover:bg-surface-alt transition-colors">Back</button>
                      <button onClick={() => setStep(3)} className="font-display italic text-white bg-ink px-8 py-2.5 text-sm tracking-[0.03em] hover:bg-accent transition-colors flex-1">Review</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="bg-surface-alt border border-border p-5 space-y-3 font-mono text-[0.6rem]">
                      <div className="flex justify-between"><span className="text-ink-soft">Strategy</span><span className="text-ink font-medium">{intent || "mETH + Agni LP"}</span></div>
                      <div className="flex justify-between"><span className="text-ink-soft">Protocols</span><span className="text-ink font-medium">{selectedProtocols.length > 0 ? selectedProtocols.join(", ") : "mETH, Agni"}</span></div>
                      <div className="flex justify-between"><span className="text-ink-soft">Allocation</span><span className="text-ink font-medium">{alloc}%</span></div>
                      <div className="flex justify-between"><span className="text-ink-soft">Network</span><span className="text-ink font-medium">Mantle Sepolia Testnet</span></div>
                    </div>
                    <p className="font-mono text-[0.52rem] text-ink-soft tracking-[0.08em] text-center">
                      AI generates Solidity → solc compiles → deploys to Mantle testnet
                    </p>
                    {error && !deployed && <p className="font-mono text-[0.5rem] text-[#dc2626] text-center">{error}</p>}
                    <div className="flex gap-3">
                      <button onClick={() => setStep(2)} className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-ink-soft border border-border px-6 py-2.5 hover:bg-surface-alt transition-colors">Back</button>
                      <button onClick={handleDeploy} className="font-display italic text-white bg-accent px-8 py-2.5 text-sm tracking-[0.03em] hover:bg-accent-light transition-colors flex-1">
                        Confirm & Deploy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
