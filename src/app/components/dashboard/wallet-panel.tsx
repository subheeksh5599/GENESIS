"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const FAUCET_URL = "https://faucet.testnet.mantle.xyz";
const STORAGE_KEY = "genesis_wallet";

function loadWallet(): { pk: string; addr: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveWallet(pk: string, addr: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ pk, addr }));
}

function clearWallet() {
  localStorage.removeItem(STORAGE_KEY);
}

export function WalletPanel() {
  const [wallet, setWallet] = useState<{ pk: string; addr: string } | null>(null);
  const [balance, setBalance] = useState<string>("...");
  const [needsFaucet, setNeedsFaucet] = useState(false);
  const [showPk, setShowPk] = useState(false);
  const [pasteKey, setPasteKey] = useState("");
  const [showPaste, setShowPaste] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    const saved = loadWallet();
    if (saved) {
      setWallet(saved);
      fetchBalance(saved.addr);
    }
  }, []);

  const fetchBalance = async (addr: string) => {
    try {
      const res = await fetch(`/api/balance?address=${addr}`);
      const data = await res.json();
      setBalance(parseFloat(data.balance).toFixed(4));
      setNeedsFaucet(data.needsFaucet);
    } catch {
      setBalance("0");
    }
  };

  const generateKey = async () => {
    const res = await fetch("/api/keygen");
    const data = await res.json();
    saveWallet(data.privateKey, data.address);
    setWallet({ pk: data.privateKey, addr: data.address });
    setBalance("0.0000");
    setNeedsFaucet(true);
  };

  const handlePasteKey = () => {
    const pk = pasteKey.trim();
    if (!pk.startsWith("0x") || pk.length !== 66) {
      alert("Invalid private key format. Must be 0x + 64 hex characters.");
      return;
    }
    // Derive address from key
    import("viem/accounts").then(({ privateKeyToAddress }) => {
      const addr = privateKeyToAddress(pk as `0x${string}`);
      saveWallet(pk, addr);
      setWallet({ pk, addr });
      setPasteKey("");
      setShowPaste(false);
      fetchBalance(addr);
    });
  };

  const disconnect = () => {
    clearWallet();
    setWallet(null);
    setBalance("...");
    setNeedsFaucet(false);
  };

  const copyAddress = () => {
    if (wallet) navigator.clipboard.writeText(wallet.addr);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-semibold text-sm">Wallet</h3>

      {!wallet ? (
        <div className="space-y-3">
          <button
            onClick={generateKey}
            className="font-display italic text-sm text-white bg-ink w-full px-4 py-2.5 tracking-[0.03em] hover:bg-accent transition-colors"
          >
            Generate New Wallet
          </button>
          <div className="relative text-center">
            <span className="font-mono text-[0.48rem] text-muted tracking-[0.1em] uppercase">or</span>
          </div>
          {!showPaste ? (
            <button
              onClick={() => setShowPaste(true)}
              className="font-mono text-[0.52rem] text-ink-soft w-full border border-border px-4 py-2.5 hover:bg-surface-alt transition-colors tracking-[0.08em]"
            >
              Paste Private Key
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <input
                type="password"
                placeholder="0x..."
                value={pasteKey}
                onChange={(e) => setPasteKey(e.target.value)}
                className="w-full border border-border font-mono text-[0.5rem] px-3 py-2 focus:outline-none focus:border-ink/20"
              />
              <div className="flex gap-2">
                <button
                  onClick={handlePasteKey}
                  className="flex-1 font-mono text-[0.48rem] bg-ink text-white px-3 py-1.5 tracking-[0.08em] hover:bg-accent transition-colors"
                >
                  Connect
                </button>
                <button
                  onClick={() => { setShowPaste(false); setPasteKey(""); }}
                  className="font-mono text-[0.48rem] text-muted px-3 py-1.5 hover:text-ink transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Balance */}
          <div className="bg-surface-alt border border-border p-3">
            <div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft mb-1">
              Balance
            </div>
            <div className={`font-display font-semibold text-xl ${needsFaucet ? "text-[#fbbf24]" : "text-[#4ade80]"}`}>
              {balance} MNT
            </div>
          </div>

          {/* Address */}
          <div>
            <div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft mb-1">
              Address
            </div>
            <div className="font-mono text-[0.48rem] text-ink bg-surface-alt border border-border p-2 break-all leading-relaxed">
              {wallet.addr}
            </div>
            <button
              onClick={copyAddress}
              className="font-mono text-[0.45rem] text-accent hover:underline mt-1 tracking-[0.05em]"
            >
              Copy address
            </button>
          </div>

          {/* Private key */}
          <div>
            <div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft mb-1 flex items-center justify-between">
              Private Key
              <button
                onClick={() => setShowPk(!showPk)}
                className="font-mono text-[0.42rem] text-accent hover:underline tracking-[0.05em]"
              >
                {showPk ? "HIDE" : "SHOW"}
              </button>
            </div>
            {showPk && (
              <div className="font-mono text-[0.48rem] text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] p-2 break-all leading-relaxed">
                {wallet.pk}
              </div>
            )}
          </div>

          {/* Actions */}
          {needsFaucet && (
            <a
              href={FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-mono text-[0.5rem] bg-accent text-white text-center px-3 py-2 tracking-[0.1em] hover:bg-accent-light transition-colors"
            >
              Get Testnet MNT →
            </a>
          )}
          <button
            onClick={() => fetchBalance(wallet.addr)}
            className="font-mono text-[0.48rem] text-ink-soft w-full border border-border px-3 py-1.5 hover:bg-surface-alt transition-colors tracking-[0.08em]"
          >
            Refresh Balance
          </button>
          <button
            onClick={disconnect}
            className="font-mono text-[0.48rem] text-muted w-full hover:text-[#f87171] transition-colors tracking-[0.08em]"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
