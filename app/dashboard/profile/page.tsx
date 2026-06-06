'use client'

import { useCurrentAccount } from '@mysten/dapp-kit'
import { useMemories } from '@/hooks/useMemory'
import { motion } from 'framer-motion'
import { truncateAddress, formatBytes } from '@/lib/utils'
import { CATEGORY_COLORS, CATEGORY_ICONS, type MemoryCategory } from '@/types'
import {
  User, Database, HardDrive, Award, Copy, CheckCheck,
  Wallet, Calendar, Shield
} from 'lucide-react'
import { useState } from 'react'

export default function ProfilePage() {
  const account = useCurrentAccount()
  const { data } = useMemories(account?.address ?? '')
  const [copied, setCopied] = useState(false)

  if (!account) return null

  const memories = data?.memories ?? []
  const total = data?.total ?? 0

  // Category breakdown
  const categoryBreakdown = memories.reduce<Record<string, number>>((acc, m) => {
    acc[m.category] = (acc[m.category] ?? 0) + 1
    return acc
  }, {})

  const storageUsed = memories.reduce((acc, m) => acc + m.content.length, 0)
  const verifiedCount = memories.filter(m => m.verified).length
  const avgImportance = memories.length
    ? memories.reduce((a, m) => a + m.importanceScore, 0) / memories.length
    : 0

  const copyAddress = () => {
    navigator.clipboard.writeText(account.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Your decentralized identity and memory stats</p>
        </div>

        {/* Wallet card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 mb-6 glow-blue chain-border"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-chain-500 to-violet-600 flex items-center justify-center shrink-0">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-xl font-bold">Sui Wallet</h2>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-muted-foreground truncate">
                  {account.address}
                </code>
                <button
                  onClick={copyAddress}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Memories', value: total, icon: Database, color: 'from-chain-500/20 to-chain-600/5', iconColor: 'text-chain-400' },
            { label: 'Storage Used', value: formatBytes(storageUsed), icon: HardDrive, color: 'from-violet-500/20 to-violet-600/5', iconColor: 'text-violet-400' },
            { label: 'Verified', value: verifiedCount, icon: Shield, color: 'from-emerald-500/20 to-emerald-600/5', iconColor: 'text-emerald-400' },
            { label: 'Avg Importance', value: `${Math.round(avgImportance * 100)}%`, icon: Award, color: 'from-amber-500/20 to-amber-600/5', iconColor: 'text-amber-400' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-5"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <p className="font-display text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Memory breakdown */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 mb-6"
          >
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-chain-400" />
              Memory Categories
            </h3>
            <div className="space-y-3">
              {Object.entries(categoryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => {
                  const colors = CATEGORY_COLORS[cat as MemoryCategory]
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs capitalize flex items-center gap-1.5 ${colors.text}`}>
                          {CATEGORY_ICONS[cat as MemoryCategory]} {cat}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.4, duration: 0.6 }}
                          className={`h-full rounded-full ${colors.dot}`}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </motion.div>
        )}

        {/* Network info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-chain-400" />
            Network Configuration
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Network', value: process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet' },
              { label: 'Storage', value: 'Walrus Testnet' },
              { label: 'Embeddings', value: 'OpenAI text-embedding-3-small' },
              { label: 'Memory Model', value: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <code className="text-xs font-mono text-chain-300 bg-chain-500/10 px-2 py-0.5 rounded">
                  {value}
                </code>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
