'use client'

import { ConnectModal, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit'
import { Wallet } from 'lucide-react'
import { useState } from 'react'

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function WalletConnectButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const account = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()

  const className = compact
    ? 'relative z-50 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/8 px-3 text-xs font-medium text-foreground transition hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-chain-400'
    : 'relative z-50 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-chain-400/30 bg-chain-500 px-4 text-sm font-semibold text-white shadow-lg shadow-chain-500/20 transition hover:bg-chain-400 focus:outline-none focus:ring-2 focus:ring-chain-300'

  if (account) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => disconnect()}
        title="Disconnect wallet"
      >
        <Wallet className="h-4 w-4" />
        {shortAddress(account.address)}
      </button>
    )
  }

  return (
    <ConnectModal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          type="button"
          className={className}
          onClick={() => setOpen(true)}
        >
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </button>
      }
    />
  )
}
