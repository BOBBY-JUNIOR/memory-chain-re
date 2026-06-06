'use client'

import { useCurrentAccount } from '@mysten/dapp-kit'
import { useMemories } from '@/hooks/useMemory'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { CATEGORY_COLORS, type MemoryCategory } from '@/types'
import { BarChart3, TrendingUp, Brain, Zap } from 'lucide-react'
import { format, subDays, startOfDay } from 'date-fns'

const PIE_COLORS = {
  personal: '#a78bfa',
  business: '#2aa5ff',
  preferences: '#34d399',
  projects: '#fbbf24',
  learning: '#fb7185',
  general: '#64748b',
}

export default function AnalyticsPage() {
  const account = useCurrentAccount()
  const { data } = useMemories(account?.address ?? '')

  if (!account) return null

  const memories = data?.memories ?? []

  // Category pie data
  const categoryData = Object.entries(
    memories.reduce<Record<string, number>>((acc, m) => {
      acc[m.category] = (acc[m.category] ?? 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  // Timeline data (last 14 days)
  const timelineData = Array.from({ length: 14 }, (_, i) => {
    const day = startOfDay(subDays(new Date(), 13 - i))
    const dayEnd = new Date(day.getTime() + 86400000)
    const count = memories.filter(m => {
      const d = new Date(m.createdAt)
      return d >= day && d < dayEnd
    }).length
    return { date: format(day, 'MMM d'), count }
  })

  // Importance distribution
  const importanceBuckets = [
    { range: '0–20%', count: memories.filter(m => m.importanceScore < 0.2).length },
    { range: '20–40%', count: memories.filter(m => m.importanceScore >= 0.2 && m.importanceScore < 0.4).length },
    { range: '40–60%', count: memories.filter(m => m.importanceScore >= 0.4 && m.importanceScore < 0.6).length },
    { range: '60–80%', count: memories.filter(m => m.importanceScore >= 0.6 && m.importanceScore < 0.8).length },
    { range: '80–100%', count: memories.filter(m => m.importanceScore >= 0.8).length },
  ]

  const customTooltipStyle = {
    backgroundColor: 'hsl(222, 47%, 7%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#e2e8f0',
    fontSize: '12px',
    fontFamily: 'JetBrains Mono',
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Insights into your memory patterns</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Memories', value: memories.length, icon: Brain, color: 'text-chain-400' },
            { label: 'This Week', value: memories.filter(m => new Date(m.createdAt) > subDays(new Date(), 7)).length, icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'High Importance', value: memories.filter(m => m.importanceScore >= 0.7).length, icon: Zap, color: 'text-amber-400' },
            { label: 'Categories', value: new Set(memories.map(m => m.category)).size, icon: BarChart3, color: 'text-violet-400' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl p-4"
            >
              <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
              <p className="font-display text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Timeline chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <h3 className="font-display font-semibold mb-4">Memory Creation Timeline</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="#2aa5ff" strokeWidth={2} dot={{ fill: '#2aa5ff', r: 3 }} activeDot={{ r: 5 }} name="Memories" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Category pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-display font-semibold mb-4">Category Distribution</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS] ?? '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {categoryData.map(entry => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[entry.name as keyof typeof PIE_COLORS] }} />
                  <span className="capitalize">{entry.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Importance distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-display font-semibold mb-4">Importance Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={importanceBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} name="Memories">
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2aa5ff" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
