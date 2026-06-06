# 🧠 MemoryChain AI

> Permanent AI memory powered by **Walrus** decentralized storage and **Sui** blockchain, with enterprise RPC by **Tatum**.

Built for the **Tatum × Walrus Hackathon** — May/June 2026.

[![Tatum](https://img.shields.io/badge/RPC-Tatum-blue)](https://tatum.io)
[![Walrus](https://img.shields.io/badge/Storage-Walrus-purple)](https://walrus.xyz)
[![Sui](https://img.shields.io/badge/Chain-Sui%20Mainnet-teal)](https://sui.io)

---

## ✨ What is MemoryChain AI?

MemoryChain gives AI assistants **permanent, verifiable, user-owned long-term memory**. Every important fact learned in conversation is:

1. **Extracted** by an LLM — "User is building a DeFi protocol on Sui"
2. **Stored on Walrus** — content lives on decentralized blob storage forever
3. **Registered on Sui** — ownership + content hash locked on-chain via a Move contract
4. **Semantically searchable** — pgvector cosine similarity injects relevant memories into every new chat

Your memories are not just database rows. They are **on-chain assets you own**, stored trustlessly on Walrus, powered by Tatum's enterprise Sui RPC.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, Framer Motion |
| Wallet | Sui dApp Kit |
| AI | OpenAI API (GPT-4o-mini + text-embedding-3-small) |
| Database | PostgreSQL + Prisma + pgvector |
| **Blockchain RPC** | **Tatum Sui Nodes** (`sui-mainnet.gateway.tatum.io`) |
| **Decentralized Storage** | **Walrus** (`publisher.walrus.space`) |
| Smart Contract | Sui Move (`memory_registry`) |
| Charts | Recharts |

---

## 🔌 Tatum Integration

This project uses **Tatum's enterprise-grade Sui RPC** for all blockchain interactions:

```
Mainnet: https://sui-mainnet.gateway.tatum.io
Testnet: https://sui-testnet.gateway.tatum.io
Devnet:  https://sui-devnet.gateway.tatum.io
```

The `x-api-key` header is injected automatically via `SuiHTTPTransport`:

```typescript
// services/sui.ts
new SuiClient({
  url: 'https://sui-mainnet.gateway.tatum.io',
  transport: new SuiHTTPTransport({
    url: 'https://sui-mainnet.gateway.tatum.io',
    requestOptions: {
      headers: { 'x-api-key': process.env.TATUM_API_KEY },
    },
  }),
})
```

A live `/api/sui-info` endpoint demonstrates real-time Tatum RPC connectivity:
```json
{
  "network": "mainnet",
  "rpcUrl": "https://sui-mainnet.gateway.tatum.io",
  "chainId": "35834a8a",
  "latestCheckpoint": "...",
  "poweredBy": "Tatum"
}
```

---

## 🌊 Walrus Integration

Every memory is stored as a JSON blob on Walrus — **not just in a database**:

```json
{
  "id": "mem-1234567890",
  "content": "User is building a DeFi protocol on Sui",
  "category": "projects",
  "timestamp": 1748700000000,
  "owner_wallet": "0xabc...",
  "importance_score": 0.85
}
```

The `blobId` returned by Walrus is then registered on the Sui Move contract, cryptographically linking the on-chain ownership record to the off-chain content.

**Walrus is core to the app, not an add-on:**
- Without Walrus, memories have no decentralized storage
- The Sui contract stores only the hash + blobId (not the content)
- Users can independently verify memory integrity via `/api/memory/verify`

---

## 🧠 Memory Flow

```
User sends message
      ↓
AI generates response (SSE streaming)
      ↓
LLM extraction: "Is this worth remembering?"
      ↓ (if yes)
SHA-256 hash of content
      ↓
PUT to Walrus → blobId returned
      ↓
register_memory() on Sui Move contract (via Tatum RPC)
      ↓
Save to PostgreSQL with pgvector embedding
      ↓
Next message: cosine similarity search → top 5 memories injected into system prompt
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL with pgvector (`CREATE EXTENSION vector;`)
- [Tatum API key](https://dashboard.tatum.io/) (free)
- OpenAI API key

### 1. Install

```bash
git clone <repo>
cd memorychain
npm install
```

### 2. Configure

```bash
cp .env.example .env.local
# Fill in: TATUM_API_KEY, DATABASE_URL, OPENAI_API_KEY
```

### 3. Database

```bash
npm run db:generate
npm run db:push
```

### 4. Run

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Deploy Smart Contract (Optional but recommended)

```bash
# Install Sui CLI: https://docs.sui.io/guides/developer/getting-started/sui-install
# Fund wallet via: https://faucets.tatum.io (testnet) or real SUI (mainnet)
chmod +x scripts/deploy-contract.sh
./scripts/deploy-contract.sh
# Copy printed Package ID → SUI_PACKAGE_ID in .env.local
```

---

## 📁 Project Structure

```
memorychain/
├── app/
│   ├── api/
│   │   ├── chat/route.ts           # Streaming chat + memory injection
│   │   ├── sui-info/route.ts       # 🆕 Live Tatum RPC status endpoint
│   │   └── memory/
│   │       ├── save/route.ts       # Save memory → Walrus + Sui
│   │       ├── search/route.ts     # Semantic vector search
│   │       ├── list/route.ts       # List & filter memories
│   │       └── verify/route.ts     # On-chain + Walrus verification
│   └── dashboard/
│       ├── page.tsx                # Chat interface + memory panel
│       ├── explorer/page.tsx       # Memory explorer grid
│       ├── analytics/page.tsx      # Charts & insights
│       └── profile/page.tsx        # Wallet profile & stats
├── services/
│   ├── sui.ts                      # 🔑 Tatum-powered Sui RPC client
│   ├── walrus.ts                   # 🌊 Walrus mainnet/testnet storage
│   └── memory.ts                   # Core memory business logic
├── contracts/
│   └── memory_registry/            # Sui Move smart contract
│       └── sources/memory_registry.move
└── lib/
    ├── openai.ts                   # LLM chat + memory extraction
    └── prisma.ts                   # DB client
```

---

## 📜 Smart Contract

The `memory_registry` Move module on Sui:

- `register_memory` — Mints a `MemoryObject` owned by the user's wallet
- `verify_memory` — Self-verification by owner
- `transfer_memory` — Transfer memory ownership to another wallet
- `admin_verify_memory` — Admin-level verification

```bash
# Deploy
cd contracts/memory_registry
sui move build
sui client publish --gas-budget 100000000
```

---

## 🚢 Deployment (Vercel + Supabase)

```bash
# 1. Push to GitHub
git push origin main

# 2. Import on Vercel: vercel.com/new
# 3. Add all .env.local variables in Vercel dashboard
# 4. Push schema to Supabase
npm run db:push

# Done — live at yourapp.vercel.app
```

---

## 🌐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TATUM_API_KEY` | ✅ | Tatum API key for Sui RPC nodes |
| `DATABASE_URL` | ✅ | PostgreSQL + pgvector connection string |
| `OPENAI_API_KEY` | ✅ | For chat + memory extraction + embeddings |
| `SUI_NETWORK` | ✅ | `mainnet` (recommended) or `testnet` |
| `SUI_PACKAGE_ID` | Optional | Deployed Move contract ID |
| `WALRUS_USE_MOCK` | Optional | `false` (default) — use real Walrus |
| `WALRUS_PUBLISHER_URL` | Optional | Defaults to Walrus mainnet publisher |

---

## 🏆 Hackathon: Tatum × Walrus

This project was built for the [Tatum × Walrus Hackathon](https://tatum.io/tatum-x-walrus-hackathon).

**How it satisfies every requirement:**

| Requirement | Implementation |
|---|---|
| ✅ Tatum API key | `TATUM_API_KEY` injected into `SuiHTTPTransport`, all RPC via Tatum |
| ✅ Walrus integration (core) | Every memory = a Walrus blob; no Walrus = no decentralized memory |
| ✅ Sui Mainnet | `SUI_NETWORK=mainnet` default, Tatum mainnet RPC |
| ✅ GitHub repo | This repo |
| ✅ Demo video | See `/demo` or linked in submission |

---

## 📝 License

MIT — Built for the Tatum × Walrus Hackathon 🏆
