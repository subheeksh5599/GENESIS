# Genesis — The Machine That Writes Itself

**Intent in. Contract out.**

An autonomous AI engine that generates, reviews, and deploys UUPS-upgradeable Solidity smart contracts on Mantle Network. Autonomous generation with built-in security review and risk scoring.

---

## What It Does

You describe a DeFi strategy in natural language. Genesis:

1. **Generates** a production Solidity contract via AI (Llama 4 Maverick via NVIDIA NIM)
2. **Reviews** it against the Paschov 20-pattern vulnerability catalog — blocks deployment on critical findings with confidence-scored risk levels
3. **Compiles** with solc 0.8.26
4. **Deploys** to Mantle Sepolia Testnet via viem
5. **Verifies** on Mantle Explorer via Blockscout API
6. **Assigns** an ERC-8004 agent identity

Every contract is UUPS upgradeable. Every agent has an on-chain identity and a developer integration panel with ready-to-use ethers.js and web3.py snippets.

---

## Pipeline

```
User Intent
    ↓
AI Generation (NVIDIA NIM — Llama 4 Maverick 17B)
    ↓
Security Review (Paschov Catalog — 20 patterns, confidence-scored)
    ↓  HIGH RISK? → Show findings, block deployment
    ↓  APPROVED
solc Compilation
    ↓
Gas Estimate (MNT + USD)
    ↓  Insufficient? → Link to faucet
    ↓  Confirmed
Deploy to Mantle Testnet
    ↓
Blockscout Auto-Verification
    ↓
ERC-8004 Agent Identity
```

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
| Identity | ERC-8004 Agent Standard |
| Verification | Blockscout API (Mantle Explorer) |
| Fonts | Playfair Display + DM Sans + JetBrains Mono |

---

## Features

### AI Contract Engine
- Natural language → production Solidity in seconds
- UUPS upgradeable by default
- Mantle protocol awareness: mETH, Agni Finance, Merchant Moe, USDY, Fluxion

### Security Review Agent
- Paschov catalog: 20 vulnerability patterns across critical/high/medium/info
- Confidence scores per finding (0.0–1.0)
- Static analysis fallback when LLM unavailable
- Risk levels: Low / Medium / High — never claims code is "safe"
- Deployment blocked on critical findings

### Developer Integration
- One-click copy Contract Address + full JSON ABI
- Pre-generated ethers.js snippet with actual deployed address
- Pre-generated web3.py snippet
- Full Solidity source view + copy
- Mantle Explorer links (contract + deployment transaction)

### Wallet System
- Generate or paste private keys entirely in-browser
- Multi-wallet history persisted in localStorage
- Live balance display + faucet integration
- Keys never sent to the server except per-request for deployment — never stored

### Dashboard
- 8 pages: Overview, Agents, Deploy, Strategies, Analytics, Wallet, History, Business (upcoming)
- Live agent grid with deployer-address grouping
- Agent detail pages with full developer panel
- Real-time deploy pipeline with stage-by-stage progress
- Gas estimates (MNT + USD) before deployment
- Explicit risk warnings and disclaimers

### Landing Page
- Brutalist-editorial aesthetic
- Animated abstract geometric visualization
- Business model overview section

---

## Getting Started

### Prerequisites
- Node.js 22+ or Bun
- NVIDIA API key ([build.nvidia.com](https://build.nvidia.com) — free tier available)
- Mantle Sepolia testnet wallet with MNT ([faucet.testnet.mantle.xyz](https://faucet.testnet.mantle.xyz))

### Install

```bash
git clone https://github.com/subheeksh5599/GENESIS.git
cd GENESIS
bun install
```

### Configure

```bash
# .env.local (never committed to git)
NVIDIA_API_KEY=nvapi-...
```

### Run

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy a Contract

1. Open **Wallet** → Generate New Wallet or paste an existing private key
2. Visit the [Mantle faucet](https://faucet.testnet.mantle.xyz) to get testnet MNT
3. Go to **Deploy** → describe your DeFi strategy in natural language
4. Watch the pipeline: Generate → Review → Compile → Deploy → Verify
5. View your deployed agent under **Agents** — click for the full developer panel

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── agents/route.ts        # Agent CRUD + detail lookup
│   │   ├── balance/route.ts       # Wallet balance by address
│   │   ├── deploy/route.ts        # Full pipeline endpoint
│   │   ├── keygen/route.ts        # In-browser key generation
│   │   └── review/route.ts        # Standalone security review
│   ├── dashboard/
│   │   ├── agents/[id]/page.tsx   # Agent detail with dev panel
│   │   ├── analytics/page.tsx     # Performance + deployment timeline
│   │   ├── deploy/page.tsx        # Deploy wizard entry point
│   │   ├── history/page.tsx       # Wallet keys + contract history
│   │   ├── strategies/page.tsx    # Strategy marketplace
│   │   ├── tokenomics/page.tsx    # Business model (upcoming)
│   │   ├── wallet/page.tsx        # Full key management
│   │   └── page.tsx               # Overview dashboard
│   ├── components/dashboard/
│   │   ├── activity-feed.tsx      # Live deployment log
│   │   ├── agent-grid.tsx         # Agent cards with status
│   │   ├── deploy-modal.tsx       # 3-step deploy with pipeline UI
│   │   ├── developer-panel.tsx    # ethers.js + web3.py snippets
│   │   ├── sidebar.tsx            # Navigation (mobile + desktop)
│   │   ├── stats-bar.tsx          # Live dashboard stats
│   │   └── wallet-panel.tsx       # Wallet overview widget
│   ├── lib/
│   │   └── wallet-history.ts      # localStorage multi-wallet manager
│   └── page.tsx                   # Landing page
├── lib/
│   ├── ai-gen.ts                  # AI Solidity generator (NVIDIA NIM)
│   ├── deployer.ts                # viem deployment + gas estimation
│   ├── mantle.ts                  # Mantle chain configuration
│   ├── security-review.ts         # Paschov review agent
│   ├── store.ts                   # File-based agent data store
│   └── verifier.ts                # Blockscout auto-verification
├── data/
│   └── agents.json                # Deployed agent records
└── .env.local                     # API keys (gitignored)
```

---

## Security Model

- **Private keys**: Generated in-browser. Sent to the server only per-deploy-request. Never written to disk or logs. Deleted from server memory after deployment completes.
- **API keys**: Server-side only via `.env.local`. Never exposed to clients.
- **Contract review**: Paschov catalog with 20 vulnerability patterns. Dual-layer: LLM review with confidence scoring + static analysis fallback.
- **Risk disclosure**: Every deploy shows risk level (Low / Medium / High), confidence per finding, and an explicit warning that AI-generated code carries inherent risk.

---

## License

MIT
