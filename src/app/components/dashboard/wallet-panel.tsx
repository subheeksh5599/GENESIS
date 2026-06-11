"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const FAUCET_URL = "https://faucet.testnet.mantle.xyz";

export function WalletPanel() {
  const [balance, setBalance] = useState<string>("...");
  const [address, setAddress] = useState<string>("");
  const [needsFaucet, setNeedsFaucet] = useState(false);
  const [generated, setGenerated] = useState<{ pk: string; addr: string } | null>(null);
  const [showPk, setShowPk] = useState(false);

  useEffect(() => {
    fetch("/api/balance")
      .then((r) => r.json())
      .then((d) => {
        setBalance(parseFloat(d.balance).toFixed(4));
        setAddress(d.address);
        setNeedsFaucet(d.needsFaucet);
      });
  }, []);

  const generateKey = async () => {
    const res = await fetch("/api/keygen");
    const data = await res.json();
    setGenerated({ pk: data.privateKey, addr: data.address });
  };

  const copyPk = () => {
    if (generated) {
      navigator.clipboard.writeText(generated.pk);
    }
  };

  return (
    <div className="space-y-5">
      {/* Balance card */}
      <div className="bg-white border border-border p-5">
        <h3 className="font-display font-semibold text-sm mb-4">Deployer Wallet</h3>
        <div className="space-y-3 font-mono text-[0.56rem]">
          <div className="flex justify-between">
            <span className="text-ink-soft">Balance</span>
            <span className={`font-medium ${needsFaucet ? "text-[#fbbf24]" : "text-[#4ade80]"}`}>
              {balance} MNT
            </span>
          </div>
          {address && address !== "0x0000000000000000000000000000000000000000" && (
            <div className="flex justify-between">
              <span className="text-ink-soft">Address</span>
              <span className="text-ink text-[0.5rem] truncate max-w-[140px]">{address.slice(0, 8)}...{address.slice(-6)}</span>
            </div>
          )}
        </div>
        {needsFaucet && (
          <a
            href={FAUCET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 font-mono text-[0.5rem] bg-accent text-white text-center px-3 py-2 tracking-[0.1em] hover:bg-accent-light transition-colors"
          >
            Get Testnet MNT →
          </a>
        )}
      </div>

      {/* Key generation */}
      <div className="bg-white border border-border p-5">
        <h3 className="font-display font-semibold text-sm mb-4">Generate Wallet</h3>
        {!generated ? (
          <button
            onClick={generateKey}
            className="font-display italic text-sm text-white bg-ink w-full px-4 py-2.5 tracking-[0.03em] hover:bg-accent transition-colors"
          >
            Generate New Key
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="font-mono text-[0.48rem] tracking-[0.15em] uppercase text-ink-soft mb-1">
                Address
              </div>
              <div className="font-mono text-[0.52rem] text-ink bg-surface-alt p-2 break-all">
                {generated.addr}
              </div>
            </div>
            <div>
              <div className="font-mono text-[0.48rem] tracking-[0.15em] uppercase text-ink-soft mb-1 flex items-center justify-between">
                Private Key
                <button
                  onClick={() => setShowPk(!showPk)}
                  className="font-mono text-[0.42rem] text-accent hover:underline tracking-[0.05em]"
                >
                  {showPk ? "HIDE" : "SHOW"}
                </button>
              </div>
              {showPk && (
                <div className="font-mono text-[0.5rem] text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] p-2 break-all">
                  {generated.pk}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyPk}
                className="flex-1 font-mono text-[0.48rem] text-ink-soft border border-border px-3 py-1.5 hover:bg-surface-alt transition-colors tracking-[0.08em]"
              >
                Copy Key
              </button>
              <button
                onClick={() => setGenerated(null)}
                className="font-mono text-[0.48rem] text-muted px-3 py-1.5 hover:text-ink transition-colors"
              >
                Reset
              </button>
            </div>
            <div className="font-mono text-[0.45rem] text-muted tracking-[0.06em] space-y-1 mt-2">
              <p>1. Copy this key to .env.local</p>
              <p>2. Get testnet MNT from faucet</p>
              <p>3. Restart dev server</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
