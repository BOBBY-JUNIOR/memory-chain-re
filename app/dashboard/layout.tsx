'use client'

import { useCurrentAccount } from '@mysten/dapp-kit'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { ConnectButton } from '@mysten/dapp-kit'
import { Brain, MessageSquare, Database, User, BarChart3, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/dashboard', icon: MessageSquare, label: 'Chat', exact: true },
  { href: '/dashboard/explorer', icon: Database, label: 'Memory Explorer' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const account = useCurrentAccount()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!account) {
      router.push('/')
    }
  }, [account, router])

  if (!account) return null

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Fixed mesh gradient */}
      <div className="fixed inset-0 bg-mesh-gradient pointer-events-none opacity-60" />

      {/* Sidebar */}
      <aside className="relative z-20 w-60 shrink-0 flex flex-col border-r border-white/6 glass">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-chain-500 to-violet-600 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-sm text-gradient-chain">MemoryChain</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-chain-500/15 text-chain-400 border border-chain-500/20 font-mono">
              AI
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-chain-500/15 text-chain-300 border border-chain-500/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/4'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-chain-400' : 'group-hover:text-foreground'}`} />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-chain-400/60" />}
              </Link>
            )
          })}
        </nav>

        {/* Wallet info */}
        <div className="p-4 border-t border-white/6">
          <div className="glass rounded-xl p-3 mb-3">
            <p className="text-xs text-muted-foreground mb-1">Connected wallet</p>
            <p className="text-xs font-mono text-chain-300 truncate">
              {account.address}
            </p>
          </div>
          <ConnectButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 relative z-10 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
