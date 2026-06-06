#!/bin/bash
# =============================================
# Deploy MemoryChain AI Sui Move Contract
# Tatum x Walrus Hackathon Edition
# =============================================
# Prerequisites:
#   - sui CLI installed (https://docs.sui.io/guides/developer/getting-started/sui-install)
#   - Active Sui wallet with SUI for gas
#   - Testnet faucet: https://faucets.tatum.io
#   - Run: sui client switch --env testnet  (or mainnet)

set -e

echo "🧠 MemoryChain AI — Contract Deployer"
echo "======================================="
echo "Powered by Tatum x Walrus"
echo ""

# Check sui CLI
if ! command -v sui &> /dev/null; then
    echo "❌ sui CLI not found."
    echo "   Install: https://docs.sui.io/guides/developer/getting-started/sui-install"
    exit 1
fi

# Check active address
ACTIVE_ADDRESS=$(sui client active-address)
echo "📍 Active address: $ACTIVE_ADDRESS"
echo "🌐 Network: $(sui client active-env)"

# Check balance
echo ""
echo "💰 Checking balance..."
sui client gas --json | head -20

# Testnet faucet reminder
echo ""
echo "💡 Need testnet SUI? → https://faucets.tatum.io"
echo ""

# Change to contract directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../contracts/memory_registry"

echo "📦 Building Move contract..."
sui move build

echo ""
echo "🚀 Publishing to $(sui client active-env)..."
PUBLISH_OUTPUT=$(sui client publish \
    --gas-budget 100000000 \
    --json 2>&1)

echo "$PUBLISH_OUTPUT" | tail -50

# Extract package ID
PACKAGE_ID=$(echo "$PUBLISH_OUTPUT" | grep -o '"packageId":"0x[a-f0-9]*"' | head -1 | cut -d'"' -f4)

if [ -n "$PACKAGE_ID" ]; then
    echo ""
    echo "✅ Contract deployed successfully!"
    echo "📋 Package ID: $PACKAGE_ID"
    echo ""
    echo "Add to your .env.local:"
    echo "SUI_PACKAGE_ID=\"$PACKAGE_ID\""

    # Auto-update .env.local
    ENV_FILE="$SCRIPT_DIR/../.env.local"
    if [ -f "$ENV_FILE" ]; then
        sed -i.bak "s/SUI_PACKAGE_ID=.*/SUI_PACKAGE_ID=\"$PACKAGE_ID\"/" "$ENV_FILE"
        echo "✅ Updated .env.local automatically"
    fi
else
    echo ""
    echo "⚠️  Could not extract package ID automatically."
    echo "Check the output above for the packageId field."
fi
