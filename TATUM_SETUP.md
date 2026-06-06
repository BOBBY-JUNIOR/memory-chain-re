# ⚡ Tatum Setup — 2 Minutes

This guide gets you a free Tatum API key and connected to Sui in 2 minutes.

## Step 1 — Get Your Free API Key

1. Go to [dashboard.tatum.io](https://dashboard.tatum.io/)
2. Sign up free (no credit card needed)
3. Copy your API key from the dashboard

## Step 2 — Add to Your Environment

```bash
# In .env.local
TATUM_API_KEY="your-api-key-here"
SUI_NETWORK="mainnet"   # or testnet for development
```

## Step 3 — Verify It Works

After starting the app (`npm run dev`), hit:

```
GET http://localhost:3000/api/sui-info
```

You should see:
```json
{
  "success": true,
  "data": {
    "network": "mainnet",
    "rpcUrl": "https://sui-mainnet.gateway.tatum.io",
    "chainId": "35834a8a",
    "latestCheckpoint": "...",
    "poweredBy": "Tatum"
  }
}
```

## Tatum RPC Endpoints Used

| Network | URL |
|---------|-----|
| Mainnet | `https://sui-mainnet.gateway.tatum.io` |
| Testnet | `https://sui-testnet.gateway.tatum.io` |
| Devnet  | `https://sui-devnet.gateway.tatum.io` |

## Testnet Faucet

Need testnet SUI? Use Tatum's faucet: https://faucets.tatum.io

## Resources

- [Tatum Sui RPC Docs](https://docs.tatum.io/reference/rpc-sui)
- [Tatum Discord](https://discord.gg/Ttp9zJwPqa)
- [Walrus Docs](https://docs.wal.app)
