# Genesis — Autonomous Protocol Synthesis Engine

**Intent in. Protocol out.**

Genesis synthesizes verifiable on-chain protocol specifications from natural language intent. Every execution is gated by a correctness proof. The system cannot deploy what it cannot verify.

---

## What It Does

You describe the desired protocol behavior. Genesis:

1. **Synthesizes** a formal protocol specification via AI (Llama 4 Maverick via NVIDIA NIM)
2. **Verifies** it against the Paschov 20-class correctness catalog — confidence-scored risk levels, critical violations block execution
3. **Compiles** the verified specification with solc 0.8.26
4. **Executes** on Mantle Sepolia Testnet via viem
5. **Records** on Mantle Explorer via Blockscout API
6. **Assigns** an ERC-8004 protocol identity

Every protocol is UUPS upgradeable. Every deployment has an on-chain identity and a developer integration panel with ready-to-use ethers.js and web3.py snippets.

---

## Correctness Gate

```
User Intent
    ↓
Protocol Synthesis (NVIDIA NIM — Llama 4 Maverick 17B)
    ↓
Correctness Verification (Paschov Catalog — 20 classes, confidence-scored)
    ↓  HIGH RISK? → Findings displayed, execution blocked
    ↓  VERIFIED
solc Compilation
    ↓
Gas Estimate (MNT + USD)
    ↓  Insufficient? → Link to faucet
    ↓  Confirmed
Execute on Mantle Testnet
    ↓
Blockscout Auto-Verification
    ↓
ERC-8004 Protocol Identity
```

**Critical principle**: The system cannot execute a protocol it cannot verify. Every stage is auditable. Every finding is confidence-scored. The correctness gate has veto power.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| AI | NVIDIA NIM — Llama 4 Maverick 17B |
| Blockchain | viem (Mantle Sepolia Testnet) |
| Compiler | solc 0.8.26 |
| Identity | ERC-8004 Protocol Identity |
| Verification | Blockscout API (Mantle Explorer) |
| Fonts | Playfair Display + DM Sans + JetBrains Mono |

---

## Features

### Protocol Synthesis Engine
- Natural language → verified protocol specification in seconds
- UUPS upgradeable by default
- Mantle protocol awareness: mETH, Agni Finance, Merchant Moe, USDY, Fluxion

### Correctness Gate
- Paschov catalog: 20 vulnerability classes across critical/high/medium/info
- Confidence scores per finding (0.0–1.0)
- Static analysis fallback when LLM unavailable
- Risk levels: Low / Medium / High — never claims protocols are "safe"
- Execution blocked on critical findings

### Developer Integration
- One-click copy Protocol Address + full JSON ABI
- Pre-generated ethers.js snippet with actual deployed address
- Pre-generated web3.py snippet
- Full Solidity specification view + copy
- Mantle Explorer links (protocol + execution transaction)

### Wallet System
- Generate or paste private keys entirely in-browser
- Multi-wallet history persisted in localStorage
- Live balance display + faucet integration
- Keys never sent to the server except per-request for execution — never stored

### Dashboard
- 8 pages: Overview, Protocols, Synthesize, Strategies, Analytics, Wallet, History, Business (upcoming)
- Live protocol grid with deployer-address grouping
- Protocol detail pages with full developer panel
- Real-time synthesis pipeline with stage-by-stage progress
- Gas estimates (MNT + USD) before execution
- Explicit correctness warnings and disclaimers

### Landing Page
- Brutalist-editorial aesthetic
- Animated abstract geometric visualization
- Business model overview section

---

## Getting Started

```bash
git clone https://github.com/subheeksh5599/GENESIS.git
cd GENESIS
bun install
echo 'NVIDIA_API_KEY=nvapi-...' > .env.local
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

### Synthesize a Protocol

1. Open **Wallet** → Generate New Wallet or paste an existing private key
2. Visit the [Mantle faucet](https://faucet.testnet.mantle.xyz) to get testnet MNT
3. Go to **Synthesize** → describe your protocol intent
4. Watch the pipeline: Synthesis → Correctness Gate → Compile → Execute → Verify
5. View your protocol under **Protocols** — click for the full developer panel

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── agents/route.ts        # Protocol CRUD + detail lookup
│   │   ├── balance/route.ts       # Wallet balance by address
│   │   ├── deploy/route.ts        # Full synthesis pipeline endpoint
│   │   ├── keygen/route.ts        # In-browser key generation
│   │   └── review/route.ts        # Standalone correctness verification
│   ├── dashboard/
│   │   ├── agents/[id]/page.tsx   # Protocol detail with dev panel
│   │   ├── analytics/page.tsx     # Performance + execution timeline
│   │   ├── deploy/page.tsx        # Synthesis wizard entry point
│   │   ├── history/page.tsx       # Wallet keys + protocol history
│   │   ├── strategies/page.tsx    # Strategy marketplace
│   │   ├── tokenomics/page.tsx    # Business model (upcoming)
│   │   ├── wallet/page.tsx        # Full key management
│   │   └── page.tsx               # Overview dashboard
│   ├── components/dashboard/
│   │   ├── activity-feed.tsx      # Live execution log
│   │   ├── agent-grid.tsx         # Protocol cards with status
│   │   ├── deploy-modal.tsx       # Synthesis wizard with pipeline UI
│   │   ├── developer-panel.tsx    # ethers.js + web3.py snippets
│   │   ├── sidebar.tsx            # Navigation (mobile + desktop)
│   │   ├── stats-bar.tsx          # Live dashboard stats
│   │   └── wallet-panel.tsx       # Wallet overview widget
│   ├── lib/
│   │   └── wallet-history.ts      # localStorage multi-wallet manager
│   └── page.tsx                   # Landing page
├── lib/
│   ├── ai-gen.ts                  # Protocol synthesizer (NVIDIA NIM)
│   ├── deployer.ts                # viem execution + gas estimation
│   ├── mantle.ts                  # Mantle chain configuration
│   ├── security-review.ts         # Paschov correctness gate
│   ├── store.ts                   # File-based protocol data store
│   └── verifier.ts                # Blockscout auto-verification
├── data/
│   └── agents.json                # Executed protocol records
└── .env.local                     # API keys (gitignored)
```

---

## Security Model

- **Private keys**: Generated in-browser. Sent to the server only per-execution-request. Never stored.
- **API keys**: Server-side only via `.env.local`. Never exposed to clients.
- **Correctness verification**: Paschov catalog with 20 vulnerability classes. Dual-layer: LLM verification with confidence scoring + static analysis fallback.
- **Risk disclosure**: Every execution shows risk level (Low / Medium / High), confidence per finding, and an explicit warning that synthesized protocols carry inherent risk.

---

## License

MIT
