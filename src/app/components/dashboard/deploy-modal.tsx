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

const STAGES = [
  { key: "generate", label: "Synthesize" },
  { key: "review", label: "Correctness Gate" },
  { key: "compile", label: "Compile" },
  { key: "gas", label: "Gas Estimate" },
  { key: "deploy", label: "Execute" },
  { key: "verify", label: "Verify" },
];

type StageKey = (typeof STAGES)[number]["key"];
type Pipeline = Record<StageKey, "pending" | "running" | "done" | "error">;

interface SecurityFinding {
  severity: string;
  category: string;
  line: number;
  description: string;
  recommendation: string;
  confidence: number;
}

interface SecurityReport {
  score: number;
  riskLevel: "low" | "medium" | "high";
  status: string;
  findings: SecurityFinding[];
  summary: string;
  modelUsed: string;
  disclaimer?: string;
}

export function DeployModal({ open, onClose, onDeployed }: DeployModalProps) {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState("");
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);
  const [alloc, setAlloc] = useState("60");
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ id: string; contractAddress: string; txHash: string; verified?: boolean } | null>(null);
  const [faucetInfo, setFaucetInfo] = useState<{ faucetUrl?: string; walletAddress?: string } | null>(null);
  const [gasConfirm, setGasConfirm] = useState(false);

  // Pipeline state
  const [pipeline, setPipeline] = useState<Pipeline>({
    generate: "pending",
    review: "pending",
    compile: "pending",
    gas: "pending",
    deploy: "pending",
    verify: "pending",
  });
  const [securityReport, setSecurityReport] = useState<SecurityReport | null>(null);
  const [gasEstimate, setGasEstimate] = useState<{ gas: string; costMNT: string; costUSD: string } | null>(null);
  const [pipelineSource, setPipelineSource] = useState("");

  const updateStage = (stage: StageKey, status: Pipeline[StageKey]) => {
    setPipeline((prev) => ({ ...prev, [stage]: status }));
  };

  const toggleProtocol = (p: string) => {
    setSelectedProtocols((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setError("");
    setGasConfirm(false);
    setSecurityReport(null);
    setGasEstimate(null);
    setPipelineSource("");
    setPipeline({ generate: "pending", review: "pending", compile: "pending", gas: "pending", deploy: "pending", verify: "pending" });

    // Read private key
    let privateKey = "";
    if (typeof window !== "undefined") {
      try {
        const { getActivePrivateKey } = await import("@/app/lib/wallet-history");
        privateKey = getActivePrivateKey() || "";
      } catch { /* ignore */ }
    }

    if (!privateKey) {
      setError("No wallet connected. Go to the Wallet page first.");
      setDeploying(false);
      return;
    }

    try {
      const strategy = intent || `Allocate ${alloc}% to ${selectedProtocols.join(" + ")}, compound rewards, rebalance weekly`;

      // Stage 1: Generate
      updateStage("generate", "running");
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: strategy, protocols: selectedProtocols, privateKey }),
      });
      const data = await res.json();

      // Update stages based on where we got
      updateStage("generate", "done");

      if (data.stage === "review" || data.securityReport) {
        updateStage("review", data.securityReport?.status === "approved" ? "done" : data.securityReport?.status === "rejected" ? "error" : "done");
        setSecurityReport(data.securityReport || null);
        setPipelineSource(data.source || "");

        if (data.securityReport?.status === "rejected") {
          updateStage("compile", "pending");
          setError(`Security review REJECTED (score: ${data.securityReport.score}/100). Fix the issues below and try again.`);
          setDeploying(false);
          return;
        }
        if (data.securityReport?.status === "warning") {
          updateStage("review", "done");
        }
      }

      if (!res.ok) {
        if (data.faucetUrl) setFaucetInfo({ faucetUrl: data.faucetUrl, walletAddress: data.walletAddress });
        setError(data.error || "Deployment failed at stage: " + (data.stage || "unknown"));
        const failStage = data.stage as StageKey;
        if (failStage) (Object.keys(pipeline) as StageKey[]).forEach((k) => { if (k === failStage) updateStage(k, "error"); });
        setDeploying(false);
        return;
      }

      // All stages done
      updateStage("generate", "done");
      updateStage("review", "done");
      updateStage("compile", "done");
      updateStage("gas", "done");
      updateStage("deploy", "done");
      updateStage("verify", "done");

      if (data.pipeline) {
        setSecurityReport(data.pipeline.securityReport || null);
        setGasEstimate(data.pipeline.gasEstimate || null);
        setPipelineSource(data.pipeline.source || "");
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
    setSecurityReport(null);
    setGasEstimate(null);
    setPipelineSource("");
    setPipeline({ generate: "pending", review: "pending", compile: "pending", gas: "pending", deploy: "pending", verify: "pending" });
    onClose();
  };

  const sevColor = (s: string) =>
    s === "critical" ? "text-[#dc2626] bg-[#fef2f2] border-[#fecaca]" :
    s === "high" ? "text-[#ea580c] bg-[#fff7ed] border-[#fed7aa]" :
    s === "medium" ? "text-[#ca8a04] bg-[#fefce8] border-[#fef08a]" :
    "text-[#64748b] bg-[#f8fafc] border-[#e2e8f0]";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-ink/40 z-[300] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-0 z-[301] flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="bg-white w-full max-w-[680px] max-h-[90vh] overflow-y-auto border border-border shadow-[0_20px_80px_rgba(0,0,0,0.12)]"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.0, 1.0] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-border">
                <div>
                  <h2 className="font-display font-semibold text-xl">Synthesize Protocol</h2>
                  <p className="font-mono text-[0.52rem] tracking-[0.15em] uppercase text-ink-soft mt-1">
                    {deploying ? "Processing..." : deployed ? "Complete" : `Step ${step} of 3`}
                  </p>
                </div>
                <button onClick={onClose} className="font-mono text-muted hover:text-ink transition-colors text-lg">×</button>
              </div>

              <div className="px-8 py-8">
                {/* ⚠️ AI WARNING BANNER */}
                {(step === 3 && !deploying && !deployed) || (deploying && pipeline.deploy === "pending") ? (
                  <div className="bg-[#fff7ed] border border-[#fed7aa] p-4 mb-6">
                    <div className="font-mono text-[0.55rem] text-[#ea580c] font-medium mb-1">⚠ Correctness Warning</div>
                    <p className="font-mono text-[0.5rem] text-[#9a3412] leading-relaxed">
                      This protocol is synthesized by AI and verified by an automated correctness gate. Verification is not a professional audit. Never deposit more than you can afford to lose. Always review the specification and correctness findings before execution.
                    </p>
                  </div>
                ) : null}

                {/* Pipeline stages */}
                {deploying && (
                  <div className="mb-6 space-y-1.5">
                    {STAGES.filter((s) => pipeline[s.key] !== "pending").map((s) => (
                      <div key={s.key} className="flex items-center gap-3 font-mono text-[0.52rem]">
                        <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[0.5rem] ${
                          pipeline[s.key] === "done" ? "bg-[#4ade80]/10 text-[#4ade80]" :
                          pipeline[s.key] === "running" ? "bg-accent/10 text-accent animate-pulse" :
                          pipeline[s.key] === "error" ? "bg-[#fef2f2] text-[#dc2626]" :
                          "bg-surface-alt text-muted"
                        }`}>
                          {pipeline[s.key] === "done" ? "✓" : pipeline[s.key] === "running" ? "●" : pipeline[s.key] === "error" ? "✕" : "○"}
                        </span>
                        <span className={
                          pipeline[s.key] === "done" ? "text-[#4ade80]" :
                          pipeline[s.key] === "running" ? "text-ink font-medium" :
                          pipeline[s.key] === "error" ? "text-[#dc2626]" : "text-muted"
                        }>{s.label}</span>
                        {pipeline[s.key] === "running" && <span className="text-muted text-[0.45rem]">...</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Security findings */}
                {securityReport && securityReport.findings.length > 0 && (
                  <div className="mb-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-[0.5rem] tracking-[0.15em] uppercase text-ink-soft">
                        Correctness Gate · Score: {securityReport.score}/100
                        <span className="text-[0.42rem] ml-2 text-muted">via {securityReport.modelUsed}</span>
                      </div>
                      <span className={`font-mono text-[0.48rem] font-medium ${
                        securityReport.riskLevel === "low" ? "text-[#4ade80]" :
                        securityReport.riskLevel === "medium" ? "text-[#fbbf24]" : "text-[#dc2626]"
                      }`}>
                        {securityReport.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                    <div className="space-y-1 max-h-[220px] overflow-y-auto">
                      {securityReport.findings.map((f, i) => (
                        <div key={i} className={`border px-3 py-2 ${sevColor(f.severity)}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[0.5rem] font-medium">{f.category}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[0.4rem] opacity-50">
                                {Math.round((f.confidence || 0.7) * 100)}% confidence
                              </span>
                              <span className="font-mono text-[0.42rem] opacity-60">{f.severity.toUpperCase()}</span>
                            </div>
                          </div>
                          <p className="font-mono text-[0.46rem] mt-0.5 leading-relaxed">{f.description}</p>
                          <p className="font-mono text-[0.44rem] mt-1 opacity-60 italic">Fix: {f.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gas confirmation */}
                {gasEstimate && !deployed && pipeline.deploy === "pending" && (
                  <div className="bg-surface-alt border border-border p-4 mb-6">
                    <div className="font-mono text-[0.5rem] tracking-[0.12em] uppercase text-ink-soft mb-3">Gas Estimate</div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div>
                        <div className="font-mono text-[0.48rem] text-ink-soft">Gas Units</div>
                        <div className="font-mono text-[0.6rem] font-medium">{gasEstimate.gas}</div>
                      </div>
                      <div>
                        <div className="font-mono text-[0.48rem] text-ink-soft">Cost</div>
                        <div className="font-mono text-[0.6rem] font-medium">{gasEstimate.costMNT} MNT</div>
                      </div>
                      <div>
                        <div className="font-mono text-[0.48rem] text-ink-soft">USD</div>
                        <div className="font-mono text-[0.6rem] font-medium">{gasEstimate.costUSD}</div>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gasConfirm}
                        onChange={(e) => setGasConfirm(e.target.checked)}
                        className="w-3.5 h-3.5 accent-accent"
                      />
                      <span className="font-mono text-[0.5rem] text-ink-soft">I understand and want to proceed with deployment</span>
                    </label>
                  </div>
                )}

                {/* Error */}
                {error && !deployed && (
                  <div className="bg-[#fef2f2] border border-[#fecaca] p-4 mb-6">
                    <div className="font-mono text-[0.52rem] text-[#dc2626] font-medium mb-1">Deployment Failed</div>
                    <p className="font-mono text-[0.5rem] text-[#991b1b] leading-relaxed whitespace-pre-wrap">{error}</p>
                    {faucetInfo?.faucetUrl && (
                      <a href={faucetInfo.faucetUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 font-mono text-[0.48rem] bg-accent text-white px-3 py-1.5 tracking-[0.1em] hover:bg-accent-light transition-colors">
                        Open Faucet →
                      </a>
                    )}
                  </div>
                )}

                {/* Success */}
                {deployed && result ? (
                  <div className="text-center py-6">
                    {/* Risk level badge */}
                    {securityReport && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 mb-6 font-mono text-[0.56rem] tracking-[0.12em] uppercase ${
                          securityReport.riskLevel === "low"
                            ? "bg-[#f0fdf4] border border-[#4ade80]/30 text-[#166534]"
                            : securityReport.riskLevel === "medium"
                            ? "bg-[#fff7ed] border border-[#fbbf24]/30 text-[#9a3412]"
                            : "bg-[#fef2f2] border border-[#fecaca] text-[#991b1b]"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          securityReport.riskLevel === "low" ? "bg-[#4ade80]" :
                          securityReport.riskLevel === "medium" ? "bg-[#fbbf24]" : "bg-[#ef4444]"
                        }`} />
                        {securityReport.riskLevel === "low" ? "Low Risk" :
                         securityReport.riskLevel === "medium" ? "Medium Risk" : "High Risk"}
                        {" · "}{securityReport.score}/100
                      </motion.div>
                    )}

                    <h3 className="font-display font-semibold text-2xl mb-2">
                      {securityReport?.riskLevel === "high" ? "Execution Complete — Review Required" : "Execution Complete"}
                    </h3>
                    <p className="font-mono text-[0.56rem] text-ink-soft mb-2">Protocol deployed on Mantle · ERC-8004 #{result.id}</p>

                    {/* Disclaimer */}
                    <div className="bg-[#fff7ed] border border-[#fed7aa] p-4 mb-6 text-left max-w-[500px] mx-auto">
                      <p className="font-mono text-[0.48rem] text-[#9a3412] leading-relaxed">
                        {securityReport?.disclaimer || "⚠ Synthesized protocols carry inherent risk. This specification was automatically verified but has not been professionally audited. Always review the protocol specification and correctness findings before executing with real funds. Do not deposit more than you can afford to lose."}
                      </p>
                    </div>

                    <div className="bg-surface-alt border border-border p-4 mb-6 text-left space-y-2 font-mono text-[0.52rem] max-w-[500px] mx-auto">
                      <div className="flex justify-between"><span className="text-ink-soft">Contract</span><a href={`https://explorer.sepolia.mantle.xyz/address/${result.contractAddress}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline truncate max-w-[240px]">{result.contractAddress.slice(0,12)}...</a></div>
                      <div className="flex justify-between"><span className="text-ink-soft">Transaction</span><a href={`https://explorer.sepolia.mantle.xyz/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline truncate max-w-[240px]">{result.txHash.slice(0,12)}...</a></div>
                      <div className="flex justify-between">
                        <span className="text-ink-soft">Verification</span>
                        <a
                          href={`https://explorer.sepolia.mantle.xyz/address/${result.contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#fbbf24] hover:underline"
                        >
                          Verify on Explorer →
                        </a>
                      </div>
                      {securityReport && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-ink-soft">Security Score</span>
                            <span className={
                              securityReport.riskLevel === "low" ? "text-[#4ade80]" :
                              securityReport.riskLevel === "medium" ? "text-[#fbbf24]" : "text-[#ef4444]"
                            }>{securityReport.score}/100 · {securityReport.riskLevel.toUpperCase()} RISK</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-soft">Review Model</span>
                            <span className="text-ink">{securityReport.modelUsed}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <button onClick={reset} className="font-display italic text-white bg-ink px-8 py-2.5 text-sm tracking-[0.03em] hover:bg-accent transition-colors">View Dashboard</button>
                  </div>
                ) : deploying ? (
                  <div className="text-center py-8 space-y-4">
                    <motion.div className="w-10 h-10 border-2 border-ink/10 border-t-accent rounded-full mx-auto" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                    <p className="font-mono text-[0.56rem] text-ink-soft tracking-[0.08em]">
                      Processing pipeline — synthesis, correctness verification, compilation, execution...
                    </p>
                  </div>
                ) : step === 1 ? (
                  <div className="space-y-5">
                    <div>
                      <label className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-ink-soft mb-3 block">Describe your strategy</label>
                      <textarea className="w-full border border-border bg-surface-alt p-4 font-mono text-[0.62rem] leading-[1.8] text-ink resize-none focus:outline-none focus:border-ink/20 transition-colors h-28" placeholder="e.g. Allocate 60% to mETH staking, 40% to Agni mETH/USDC LP, rebalance weekly..." value={intent} onChange={(e) => setIntent(e.target.value)} />
                    </div>
                    <div>
                      <label className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-ink-soft mb-3 block">Protocols</label>
                      <div className="flex flex-wrap gap-2">
                        {PROTOCOLS.map((p) => (
                          <button key={p} onClick={() => toggleProtocol(p)} className={`font-mono text-[0.52rem] tracking-[0.1em] px-3 py-1.5 border transition-all ${selectedProtocols.includes(p) ? "bg-ink text-white border-ink" : "bg-white text-ink-soft border-border hover:border-ink/20"}`}>{p}</button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setStep(2)} className="font-display italic text-white bg-ink px-8 py-2.5 text-sm tracking-[0.03em] hover:bg-accent transition-colors w-full">Continue</button>
                  </div>
                ) : step === 2 ? (
                  <div className="space-y-5">
                    <div>
                      <label className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-ink-soft mb-3 block">Allocation</label>
                      <div className="flex flex-wrap gap-2">{ALLOCATIONS.map((a) => (<button key={a} onClick={() => setAlloc(a.replace("%", ""))} className={`font-mono text-[0.52rem] tracking-[0.1em] px-3 py-1.5 border transition-all ${alloc === a.replace("%", "") ? "bg-ink text-white border-ink" : "bg-white text-ink-soft border-border hover:border-ink/20"}`}>{a}</button>))}</div>
                    </div>
                    <div>
                      <label className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-ink-soft mb-3 block">Risk</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[["Slippage", "0.3%"],["Stop-loss", "15%"],["Rebalance", "Weekly"],["Target", "Mantle Testnet"]].map(([l,v])=>(<div key={l} className="border border-border p-3"><div className="font-mono text-[0.48rem] tracking-[0.15em] uppercase text-ink-soft mb-1">{l}</div><div className="font-mono text-[0.7rem] font-medium">{v}</div></div>))}
                      </div>
                    </div>
                    <div className="flex gap-3"><button onClick={()=>setStep(1)} className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-ink-soft border border-border px-6 py-2.5 hover:bg-surface-alt transition-colors">Back</button><button onClick={()=>setStep(3)} className="font-display italic text-white bg-ink px-8 py-2.5 text-sm tracking-[0.03em] hover:bg-accent transition-colors flex-1">Review</button></div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="bg-surface-alt border border-border p-5 space-y-3 font-mono text-[0.6rem]">
                      <div className="flex justify-between"><span className="text-ink-soft">Strategy</span><span className="text-ink font-medium">{intent || "mETH + Agni LP"}</span></div>
                      <div className="flex justify-between"><span className="text-ink-soft">Protocols</span><span className="text-ink font-medium">{selectedProtocols.length > 0 ? selectedProtocols.join(", ") : "mETH, Agni"}</span></div>
                      <div className="flex justify-between"><span className="text-ink-soft">Allocation</span><span className="text-ink font-medium">{alloc}%</span></div>
                      <div className="flex justify-between"><span className="text-ink-soft">Network</span><span className="text-ink font-medium">Mantle Sepolia Testnet</span></div>
                      <div className="flex justify-between"><span className="text-ink-soft">Verification</span><span className="text-ink font-medium">Correctness Gate → Compile → Execute → Verify</span></div>
                    </div>
                    <p className="font-mono text-[0.5rem] text-ink-soft tracking-[0.08em] text-center">
                      The synthesis engine generates a protocol specification, the correctness gate verifies it against 20 vulnerability classes, and if approved, it deploys to Mantle.
                    </p>
                    <div className="flex gap-3">
                      <button onClick={()=>setStep(2)} className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-ink-soft border border-border px-6 py-2.5 hover:bg-surface-alt transition-colors">Back</button>
                      <button onClick={handleDeploy} className="font-display italic text-white bg-accent px-8 py-2.5 text-sm tracking-[0.03em] hover:bg-accent-light transition-colors flex-1">
                        Confirm & Execute
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
