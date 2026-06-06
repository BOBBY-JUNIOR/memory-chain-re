#!/bin/bash
# =============================================
# Setup MemoryChain AI Database
# =============================================
# Requires: PostgreSQL with pgvector extension
# Install pgvector: https://github.com/pgvector/pgvector

set -e

echo "🗄️  MemoryChain AI — Database Setup"
echo "======================================"

# Check for DATABASE_URL
if [ -z "$DATABASE_URL" ] && [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set. Check .env.local"
    exit 1
fi

echo "📍 Database: $DATABASE_URL"

# Run Prisma migrations
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "📤 Pushing schema to database..."
npx prisma db push

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Optional: Run Prisma Studio to browse data:"
echo "  npx prisma studio"
