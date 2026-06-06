'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Search, RefreshCw, CheckCircle2, Clock, Shield } from 'lucide-react'
import { useMemories, useVerifyMemory } from '@/hooks/useMemory'
import { formatRelativeTime, getImportanceColor, truncateAddress } from '@/lib/utils'
import { CATEGORY_COLORS, CATEGORY_ICONS, type MemoryCategory } from '@/types'
import type { Memory } from '@/types'

interface MemoryPanelProps {
  walletAddress: string
}

const CATEGORIES: (MemoryCategory | 'all')[] = ['all', 'personal', 'business', 'preferences', 'projects', 'learning', 'general']

export function MemoryPanel({ walletAddress }: MemoryPanelProps) {
  const [activeCategory, setActiveCategory] = useState<MemoryCategory | 'all'>('all')
  const [search, setSearch] = useState('')

  const { data, isLoading, refetch } = useMemories(
    walletAddress,
    activeCategory === 'all' ? undefined : activeCategory
  )

  const memories = data?.memories ?? []
  const filtered = search
    ? memories.filter(m => m.content.toLowerCase().includes(search.toLowerCase()))
    : memories

  return (
    <div className="flex flex-col h-full border-l border-white/6">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-chain-400" />
            <span className="text-sm font-display font-semibold">Memories</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-chain-500/15 text-chain-400 font-mono">
              {data?.total ?? 0}
            </span>
          </div>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="w-full bg-white/4 border border-white/8 rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-chain-500/40 transition-colors"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="px-4 py-2 border-b border-white/6 flex gap-1 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 text-xs px-2.5 py-1 rounded-lg capitalize transition-all ${
              activeCategory === cat
                ? 'bg-chain-500/15 text-chain-300 border border-chain-500/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/4'
            }`}
          >
            {cat === 'all' ? '✦ All' : `${CATEGORY_ICONS[cat]} ${cat}`}
          </button>
        ))}
      </div>

      {/* Memory list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {isLoading ? (
          <MemorySkeletons />
        ) : filtered.length === 0 ? (
          <EmptyMemories />
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((memory, i) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                walletAddress={walletAddress}
                index={i}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

function MemoryCard({ memory, walletAddress, index }: { memory: Memory; walletAddress: string; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const { mutate: verify, isPending } = useVerifyMemory()
  const catColors = CATEGORY_COLORS[memory.category]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
      className="glass-hover rounded-xl p-3 cursor-pointer group"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2 mb-2">
        <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-md border ${catColors.bg} ${catColors.text} ${catColors.border}`}>
          {CATEGORY_ICONS[memory.category]}
        </span>
        <p className={`text-xs text-foreground/90 leading-relaxed flex-1 ${!expanded ? 'line-clamp-2' : ''}`}>
          {memory.content}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground/50">
            {formatRelativeTime(memory.createdAt)}
          </span>
          <span className={`text-xs font-mono ${getImportanceColor(memory.importanceScore)}`}>
            {Math.round(memory.importanceScore * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {memory.verified ? (
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span className="hidden group-hover:inline">Verified</span>
            </div>
          ) : (
            <button
              onClick={e => {
                e.stopPropagation()
                verify({ memoryId: memory.id, walletAddress })
              }}
              disabled={isPending}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-chain-400 transition-colors"
            >
              <Shield className="w-3 h-3" />
              <span className="hidden group-hover:inline">Verify</span>
            </button>
          )}
        </div>
      </div>

      {expanded && memory.walrusBlobId && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 pt-2 border-t border-white/6 space-y-1"
        >
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground/50">Walrus:</span>
            <span className="font-mono text-chain-400/70 truncate">{memory.walrusBlobId}</span>
          </div>
          {memory.suiObjectId && (
            <div className="flex gap-2 text-xs">
              <span className="text-muted-foreground/50">Sui:</span>
              <span className="font-mono text-violet-400/70 truncate">{truncateAddress(memory.suiObjectId, 10)}</span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

function MemorySkeletons() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="glass rounded-xl p-3 space-y-2">
          <div className="h-3 bg-white/5 rounded shimmer-bg" />
          <div className="h-3 bg-white/5 rounded shimmer-bg w-3/4" />
        </div>
      ))}
    </>
  )
}

function EmptyMemories() {
  return (
    <div className="text-center py-8">
      <Database className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
      <p className="text-xs text-muted-foreground">No memories yet.</p>
      <p className="text-xs text-muted-foreground/60 mt-1">Start chatting to create memories.</p>
    </div>
  )
}
