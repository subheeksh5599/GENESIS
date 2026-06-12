"use client";

import { useState } from "react";

interface DevPanelProps {
  contractAddress: string;
  txHash: string;
  abi?: Record<string, unknown>[];
  source?: string;
  verified?: boolean;
}

export function DeveloperPanel({ contractAddress, txHash, abi, source }: DevPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (label: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const abiStr = abi ? JSON.stringify(abi, null, 2) : "[]";

  // Manual verification steps
  const verifyUrl = `https://explorer.sepolia.mantle.xyz/address/${contractAddress}`;

  const jsSnippet = `import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const address = "${contractAddress}";
const abi = ${abiStr.slice(0, 200)}${abiStr.length > 200 ? "..." : ""};
const contract = new ethers.Contract(address, abi, signer);

// Read TVL
const tvl = await contract.totalValueLocked();

// Execute strategy
const tx = await contract.executeStrategy();
await tx.wait();`;

  const pySnippet = `from web3 import Web3

w3 = Web3(Web3.HTTPProvider("https://rpc.sepolia.mantle.xyz"))
contract = w3.eth.contract(
    address="${contractAddress}",
    abi=${abiStr.slice(0, 150)}${abiStr.length > 150 ? "..." : ""}
)

# Read TVL
tvl = contract.functions.totalValueLocked().call()

# Execute strategy
tx = contract.functions.executeStrategy().transact()
w3.eth.wait_for_transaction_receipt(tx)`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-base">Developer Integration</h3>
        <a
          href={verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[0.48rem] bg-[#fbbf24]/10 text-[#92400e] px-2 py-1 tracking-[0.1em] uppercase hover:underline"
        >
          Verify on Explorer →
        </a>
      </div>

      {/* Quick copy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft mb-1.5">
            Contract Address
          </div>
          <div className="flex gap-2">
            <code className="flex-1 font-mono text-[0.5rem] text-ink bg-surface-alt border border-border p-2.5 truncate">
              {contractAddress}
            </code>
            <button
              onClick={() => copy("address", contractAddress)}
              className="font-mono text-[0.48rem] text-accent border border-border px-3 hover:bg-surface-alt transition-colors shrink-0"
            >
              {copied === "address" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <div>
          <div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft mb-1.5">
            ABI
          </div>
          <div className="flex gap-2">
            <code className="flex-1 font-mono text-[0.5rem] text-ink bg-surface-alt border border-border p-2.5 truncate">
              {abiStr.slice(0, 60)}...
            </code>
            <button
              onClick={() => copy("abi", abiStr)}
              className="font-mono text-[0.48rem] text-accent border border-border px-3 hover:bg-surface-alt transition-colors shrink-0"
            >
              {copied === "abi" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Explorer links */}
      <div className="flex gap-4">
        <a
          href={`https://explorer.sepolia.mantle.xyz/address/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[0.5rem] text-accent hover:underline tracking-[0.06em]"
        >
          View on Explorer →
        </a>
        <a
          href={`https://explorer.sepolia.mantle.xyz/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[0.5rem] text-muted hover:text-ink transition-colors tracking-[0.06em]"
        >
          Deployment TX →
        </a>
      </div>

      {/* Code snippets */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft">
              ethers.js (JavaScript)
            </div>
            <button
              onClick={() => copy("js", jsSnippet)}
              className="font-mono text-[0.42rem] text-accent hover:underline"
            >
              {copied === "js" ? "Copied" : "Copy snippet"}
            </button>
          </div>
          <pre className="font-mono text-[0.48rem] text-ink bg-surface-alt border border-border p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
            {jsSnippet}
          </pre>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft">
              web3.py (Python)
            </div>
            <button
              onClick={() => copy("py", pySnippet)}
              className="font-mono text-[0.42rem] text-accent hover:underline"
            >
              {copied === "py" ? "Copied" : "Copy snippet"}
            </button>
          </div>
          <pre className="font-mono text-[0.48rem] text-ink bg-surface-alt border border-border p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
            {pySnippet}
          </pre>
        </div>
      </div>

      {/* Source code */}
      {source && (
        <>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-[0.45rem] tracking-[0.15em] uppercase text-ink-soft">
                Solidity Source
              </div>
              <button
                onClick={() => copy("source", source)}
                className="font-mono text-[0.42rem] text-accent hover:underline"
              >
                {copied === "source" ? "Copied" : "Copy source"}
              </button>
            </div>
            <pre className="font-mono text-[0.48rem] text-ink bg-surface-alt border border-border p-4 overflow-x-auto max-h-[300px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
              {source}
            </pre>
          </div>

          {/* Verification instructions */}
          <div className="bg-[#fffbeb] border border-[#fde68a] p-4">
            <div className="font-mono text-[0.48rem] text-[#92400e] font-medium mb-2">Verify on Mantle Explorer</div>
            <div className="font-mono text-[0.44rem] text-[#a16207] leading-relaxed space-y-1">
              <p>1. Open <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className="underline">the contract page</a></p>
              <p>2. Click the <b>Contract</b> tab</p>
              <p>3. Click <b>Verify and Publish</b></p>
              <p>4. Select: Solidity (Single File), v0.8.35, Optimization: 200 runs</p>
              <p>5. Copy the source above and paste it</p>
              <p>6. Click Submit</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
