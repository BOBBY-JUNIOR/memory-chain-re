'use client'

import { motion } from 'framer-motion'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'
import { CheckCircle2, Shield } from 'lucide-react'
import { CATEGORY_COLORS, CATEGORY_ICONS, type MemoryCategory } from '@/types'
import { getImportanceColor } from '@/lib/utils'
import type { Memory } from '@/types'

interface MemoryTimelineProps {
  memories: Memory[]
  walletAddress: string
}

function groupByDate(memories: Memory[]): Record<string, Memory[]> {
  return memories.reduce<Record<string, Memory[]>>((acc, mem) => {
    const d = new Date(mem.createdAt)
    let key: string
    if (isToday(d)) key = 'Today'
    else if (isYesterday(d)) key = 'Yesterday'
    else if (isThisWeek(d)) key = format(d, 'EEEE') // Monday, Tuesday...
    else key = format(d, 'MMMM d, yyyy')

    if (!acc[key]) acc[key] = []
    acc[key].push(mem)
    return acc
  }, {})
}

export function MemoryTimeline({ memories, walletAddress }: MemoryTimelineProps) {
  const groups = groupByDate(
    [...memories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  )

  if (memories.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-sm">No memories to display on timeline</p>
      </div>
    )
  }

  return (
    <div className="relative pl-8">
      {/* Vertical timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-chain-500/40 via-violet-500/20 to-transparent" />

      <div className="space-y-8">
        {Object.entries(groups).map(([dateLabel, dayMemories], groupIdx) => (
          <motion.div
            key={dateLabel}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: groupIdx * 0.1 }}
          >
            {/* Date label */}
            <div className="flex items-center gap-3 mb-4 -ml-8">
              <div className="w-6 h-6 rounded-full bg-chain-500/20 border border-chain-500/30 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-chain-400" />
              </div>
              <span className="text-xs font-display font-semibold text-chain-300 uppercase tracking-wider">
                {dateLabel}
              </span>
              <span className="text-xs text-muted-foreground">
                {dayMemories.length} {dayMemories.length === 1 ? 'memory' : 'memories'}
              </span>
            </div>

            {/* Day memories */}
            <div className="space-y-3 ml-0">
              {dayMemories.map((memory, i) => {
                const catColors = CATEGORY_COLORS[memory.category]
                const time = format(new Date(memory.createdAt), 'h:mm a')
                return (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIdx * 0.1 + i * 0.04 }}
                    className="relative glass-hover rounded-xl p-4 group"
                  >
                    {/* Connector dot */}
                    <div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-background border-2 border-white/20 group-hover:border-chain-500/50 transition-colors" />

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded-md border ${catColors.bg} ${catColors.text} ${catColors.border} capitalize shrink-0`}>
                            {CATEGORY_ICONS[memory.category]} {memory.category}
                          </span>
                          {memory.verified && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          )}
                          <span className={`text-xs font-mono ml-auto ${getImportanceColor(memory.importanceScore)}`}>
                            {Math.round(memory.importanceScore * 100)}%
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">{memory.content}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <span className="text-xs text-muted-foreground/50 font-mono">{time}</span>
                      {memory.walrusBlobId && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
                          <Shield className="w-3 h-3" />
                          <span className="font-mono">{memory.walrusBlobId.slice(0, 12)}...</span>
                        </div>
                      )}
                    </div>

                    {/* Importance fill bar */}
                    <div className="absolute bottom-0 left-0 h-0.5 rounded-b-xl bg-gradient-to-r from-chain-500 to-violet-600 transition-all"
                      style={{ width: `${memory.importanceScore * 100}%` }} />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
