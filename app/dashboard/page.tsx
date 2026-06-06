'use client'

import { useCurrentAccount } from '@mysten/dapp-kit'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { MemoryPanel } from '@/components/memory/MemoryPanel'
import { useState } from 'react'
import { PanelRightOpen, PanelRightClose } from 'lucide-react'

export default function DashboardPage() {
  const account = useCurrentAccount()
  const [showMemories, setShowMemories] = useState(true)

  if (!account) return null

  return (
    <div className="h-full flex relative">
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toggle memory panel button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setShowMemories(v => !v)}
            className="p-2 rounded-lg glass border border-white/8 hover:border-white/15 text-muted-foreground hover:text-foreground transition-all"
            title={showMemories ? 'Hide memories' : 'Show memories'}
          >
            {showMemories ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </div>
        <ChatInterface walletAddress={account.address} />
      </div>

      {/* Memory panel */}
      {showMemories && (
        <div className="w-72 shrink-0 h-full">
          <MemoryPanel walletAddress={account.address} />
        </div>
      )}
    </div>
  )
}
