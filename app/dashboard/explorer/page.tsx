'use client'

import { useCurrentAccount } from '@mysten/dapp-kit'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemories, useVerifyMemory } from '@/hooks/useMemory'
import { formatRelativeTime, getImportanceLabel, getImportanceColor, truncateAddress } from '@/lib/utils'
import { CATEGORY_COLORS, CATEGORY_ICONS, type MemoryCategory } from '@/types'
import { MemoryTimeline } from '@/components/memory/MemoryTimeline'
import { MemoryGraph } from '@/components/memory/MemoryGraph'
import {
  Database, Search, Filter, CheckCircle2, Clock,
  Shield, ExternalLink, Grid, List, BarChart2,
  GitBranch, Clock3
} from 'lucide-react'

const CATEGORIES: (MemoryCategory | 'all')[] = ['all', 'personal', 'business', 'preferences', 'projects', 'learning', 'general']
type ViewMode = 'grid' | 'list' | 'timeline' | 'graph'

export default function ExplorerPage() {
  const account = useCurrentAccount()
  const [activeCategory, setActiveCategory] = useState<MemoryCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<'recent' | 'importance'>('recent')

  const { data, isLoading } = useMemories(
    account?.address ?? '',
    activeCategory === 'all' ? undefined : activeCategory
  )

  const { mutate: verify } = useVerifyMemory()

  const memories = data?.memories ?? []
  const filtered = memories
    .filter(m => !search || m.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'importance') return b.importanceScore - a.importanceScore
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  if (!account) return null

  const viewButtons = [
    { mode: 'grid' as ViewMode, icon: Grid, label: 'Grid' },
    { mode: 'list' as ViewMode, icon: List, label: 'List' },
    { mode: 'timeline' as ViewMode, icon: Clock3, label: 'Timeline' },
    { mode: 'graph' as ViewMode, icon: GitBranch, label: 'Graph' },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="mb-5">
          <h1 className="font-display text-3xl font-bold mb-1">Memory Explorer</h1>
          <p className="text-muted-foreground text-sm">Browse and verify your blockchain-stored memories</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total', value: data?.total ?? 0, icon: Database, color: 'text-chain-400' },
            { label: 'Verified', value: memories.filter(m => m.verified).length, icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Categories', value: new Set(memories.map(m => m.category)).size, icon: Filter, color: 'text-violet-400' },
            { label: 'Avg Score', value: memories.length ? `${Math.round((memories.reduce((a, m) => a + m.importanceScore, 0) / memories.length) * 100)}%` : '—', icon: BarChart2, color: 'text-amber-400' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-3 flex items-center gap-3">
              <stat.icon className={`w-4 h-4 ${stat.color} shrink-0`} />
              <div>
                <p className="font-display text-lg font-bold leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search memories..."
              className="w-full glass border border-white/8 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-chain-500/40 transition-colors" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as 'recent' | 'importance')}
            className="glass border border-white/8 rounded-xl px-3 py-2 text-sm focus:outline-none bg-transparent text-foreground">
            <option value="recent">Most Recent</option>
            <option value="importance">By Importance</option>
          </select>
          <div className="flex gap-0.5 glass border border-white/8 rounded-xl p-1">
            {viewButtons.map(({ mode, icon: Icon, label }) => (
              <button key={mode} onClick={() => setViewMode(mode)} title={label}
                className={`p-1.5 rounded-lg transition-all ${viewMode === mode ? 'bg-chain-500/20 text-chain-300' : 'text-muted-foreground hover:text-foreground'}`}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {viewMode !== 'graph' && (
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-lg capitalize transition-all ${activeCategory === cat
                  ? 'bg-chain-500/15 text-chain-300 border border-chain-500/20'
                  : 'glass text-muted-foreground hover:text-foreground border border-white/8'}`}>
                {cat === 'all' ? 'All' : `${CATEGORY_ICONS[cat]} ${cat}`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {[...Array(6)].map((_, i) => <div key={i} className="glass rounded-2xl h-40 shimmer-bg" />)}
          </div>
        ) : viewMode === 'timeline' ? (
          <div className="pt-6"><MemoryTimeline memories={filtered} walletAddress={account.address} /></div>
        ) : viewMode === 'graph' ? (
          <div className="h-[600px] glass rounded-2xl mt-4 overflow-hidden">
            <MemoryGraph memories={memories} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Database className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No memories found</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className={`pt-4 ${viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}`}>
              {filtered.map((memory, i) => {
                const catColors = CATEGORY_COLORS[memory.category]
                return (
                  <motion.div key={memory.id} layout
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.02 }} className="glass-hover rounded-2xl p-5 group">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-2 py-1 rounded-lg border ${catColors.bg} ${catColors.text} ${catColors.border} capitalize`}>
                        {CATEGORY_ICONS[memory.category]} {memory.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono ${getImportanceColor(memory.importanceScore)}`}>
                          {getImportanceLabel(memory.importanceScore)}
                        </span>
                        {memory.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed mb-3 line-clamp-3">{memory.content}</p>
                    <div className="h-1 bg-white/5 rounded-full mb-3 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${memory.importanceScore * 100}%` }}
                        transition={{ delay: i * 0.02 + 0.3, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-chain-500 to-violet-600 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground/60">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{formatRelativeTime(memory.createdAt)}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!memory.verified && (
                          <button onClick={() => verify({ memoryId: memory.id, walletAddress: account.address })}
                            className="flex items-center gap-1 text-chain-400 hover:text-chain-300">
                            <Shield className="w-3 h-3" /> Verify
                          </button>
                        )}
                        {memory.walrusBlobId && (
                          <a href={`${process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL}/v1/${memory.walrusBlobId}`}
                            target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 hover:text-foreground transition-colors" />
                          </a>
                        )}
                      </div>
                    </div>
                    {(memory.walrusBlobId || memory.suiObjectId) && (
                      <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                        {memory.walrusBlobId && (
                          <div className="flex gap-2 text-xs">
                            <span className="text-muted-foreground/40 w-12 shrink-0">Walrus</span>
                            <span className="font-mono text-chain-400/60 truncate">{memory.walrusBlobId}</span>
                          </div>
                        )}
                        {memory.suiObjectId && (
                          <div className="flex gap-2 text-xs">
                            <span className="text-muted-foreground/40 w-12 shrink-0">Sui</span>
                            <span className="font-mono text-violet-400/60 truncate">{truncateAddress(memory.suiObjectId, 12)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
