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
    <div className="h-full flex flex-col md:flex-row relative overflow-hidden">
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Toggle memory panel button */}
        <div className="absolute top-3 right-3 z-20 md:top-4 md:right-4">
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
        <div className="h-[38%] min-h-56 shrink-0 border-t border-white/6 md:h-full md:min-h-0 md:w-72 md:border-t-0">
          <MemoryPanel walletAddress={account.address} />
        </div>
      )}
    </div>
  )
}
