'use client'

import { useState, useEffect } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton'
import {
  Brain, Shield, Zap, Database, Link2, Clock,
  ChevronRight, Sparkles, Globe, Lock
} from 'lucide-react'

const MEMORY_EXAMPLES = [
  { text: '"My startup is called NovaAI"', cat: 'business', delay: 0 },
  { text: '"I prefer TypeScript over JavaScript"', cat: 'preferences', delay: 0.8 },
  { text: '"Building a DeFi protocol on Sui"', cat: 'projects', delay: 1.6 },
  { text: '"Learning Rust this year"', cat: 'learning', delay: 2.4 },
]

const FEATURES = [
  {
    icon: Brain,
    title: 'Automatic Memory Extraction',
    desc: 'AI intelligently extracts important facts from your conversations — no manual tagging needed.',
    color: 'from-chain-500/20 to-chain-600/5',
    iconColor: 'text-chain-400',
  },
  {
    icon: Database,
    title: 'Walrus Decentralized Storage',
    desc: 'Memories are stored permanently on Walrus, a decentralized blob storage network built for Web3.',
    color: 'from-violet-500/20 to-violet-600/5',
    iconColor: 'text-violet-400',
  },
  {
    icon: Shield,
    title: 'Sui Blockchain Verification',
    desc: 'Memory ownership and hashes are registered on Sui blockchain for tamper-proof verification.',
    color: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Zap,
    title: 'Semantic Memory Search',
    desc: 'Vector embeddings power lightning-fast semantic search across all your stored memories.',
    color: 'from-amber-500/20 to-amber-600/5',
    iconColor: 'text-amber-400',
  },
  {
    icon: Link2,
    title: 'Memory Graph',
    desc: 'Visualize connections between your memories to understand patterns and relationships.',
    color: 'from-rose-500/20 to-rose-600/5',
    iconColor: 'text-rose-400',
  },
  {
    icon: Clock,
    title: 'Memory Timeline',
    desc: 'Browse your memory history chronologically and see how your knowledge has grown.',
    color: 'from-chain-500/20 to-violet-600/10',
    iconColor: 'text-chain-300',
  },
]

const CAT_COLORS: Record<string, string> = {
  business: 'bg-chain-500/20 text-chain-300 border-chain-500/30',
  preferences: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  projects: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  learning: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
}

export default function LandingPage() {
  const account = useCurrentAccount()
  const router = useRouter()
  const [activeMemory, setActiveMemory] = useState(0)

  useEffect(() => {
    if (account) {
      router.push('/dashboard')
    }
  }, [account, router])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMemory(prev => (prev + 1) % MEMORY_EXAMPLES.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background noise-overlay overflow-hidden">
      {/* Mesh gradient background */}
      <div className="fixed inset-0 bg-mesh-gradient pointer-events-none" />
      <div className="fixed inset-0 dot-grid opacity-40 pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between gap-3 px-4 py-4 border-b border-white/5 sm:px-6 md:px-12 md:py-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-chain-500 to-violet-600 flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-base text-gradient-chain truncate sm:text-lg">MemoryChain</span>
          <span className="hidden text-xs px-2 py-0.5 rounded-full bg-chain-500/15 text-chain-400 border border-chain-500/20 font-mono sm:inline">
            AI
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3 md:gap-6">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            How it works
          </a>
          <div className="w-36 sm:w-auto">
            <WalletConnectButton compact />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-4 pt-16 pb-20 sm:px-6 md:px-12 md:pt-24 md:pb-32 max-w-7xl mx-auto">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-chain-500/20 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-chain-400" />
              <span className="text-xs text-chain-300 font-medium">Powered by Sui + Walrus</span>
              <div className="w-1 h-1 rounded-full bg-chain-400 animate-pulse" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.08] mb-5 md:mb-6"
          >
            AI that{' '}
            <span className="text-gradient-chain">remembers</span>
            <br />
            everything about you
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed"
          >
            MemoryChain AI stores your important memories permanently on the blockchain.
            Every conversation makes it smarter about you — forever.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <WalletConnectButton />
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              See how it works <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Memory demo animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-14 relative max-w-3xl mx-auto md:mt-20"
        >
          <div className="glass rounded-2xl border border-white/8 overflow-hidden glow-blue">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6">
              <div className="w-3 h-3 rounded-full bg-rose-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <span className="ml-3 text-xs text-muted-foreground font-mono">memorychain — chat</span>
            </div>

            <div className="p-4 space-y-4 sm:p-6">
              {/* Chat example */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-chain-500/20 border border-chain-500/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono text-chain-400">U</span>
                </div>
                <div className="glass rounded-xl px-3 py-2.5 text-sm text-foreground/90 sm:px-4">
                  I&apos;m building a decentralized coffee shop app on Sui blockchain
                </div>
              </div>

              <div className="flex gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-violet-400" />
                </div>
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-2.5 text-sm text-foreground/90 max-w-[82%] text-right sm:max-w-sm sm:px-4">
                  That sounds fascinating! A decentralized coffee shop app would be a great use case for Sui&apos;s fast finality...
                </div>
              </div>

              {/* Memory extraction indicator */}
              <motion.div
                key={activeMemory}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 sm:gap-3 sm:px-4"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="min-w-0 truncate text-xs text-emerald-300 font-mono flex-1">
                  Memory extracted: {MEMORY_EXAMPLES[activeMemory].text}
                </span>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${CAT_COLORS[MEMORY_EXAMPLES[activeMemory].cat]}`}>
                  {MEMORY_EXAMPLES[activeMemory].cat}
                </span>
              </motion.div>

              {/* Storage indicators */}
              <div className="flex flex-wrap gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Globe className="w-3 h-3 text-chain-400" />
                  <span className="font-mono">Walrus</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-chain-400 animate-pulse" />
                </div>
                <div className="w-px bg-white/10" />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 text-violet-400" />
                  <span className="font-mono">Sui verified</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-y border-white/5 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '∞', label: 'Memory Capacity' },
            { value: '<200ms', label: 'Retrieval Speed' },
            { value: '100%', label: 'On-chain Verified' },
            { value: 'Permanent', label: 'Storage Duration' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="font-display text-3xl font-bold text-gradient-chain mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything you need for
            <br />
            <span className="text-gradient-chain">persistent AI memory</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built on cutting-edge decentralized infrastructure for permanent, verifiable AI memory.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className="glass-hover rounded-2xl p-6 group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 md:px-12 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl font-bold mb-4">How it works</h2>
        </motion.div>

        <div className="space-y-4">
          {[
            { n: '01', title: 'Connect your Sui wallet', desc: 'Your wallet address is your unique identity. No passwords, no accounts — just your wallet.' },
            { n: '02', title: 'Chat naturally', desc: 'Have conversations with the AI just like ChatGPT. No special commands needed.' },
            { n: '03', title: 'Memories are extracted automatically', desc: 'After each message, the AI identifies important facts and saves them permanently.' },
            { n: '04', title: 'Stored on Walrus + Sui', desc: 'Memory content goes to Walrus decentralized storage. Ownership proof goes on Sui blockchain.' },
            { n: '05', title: 'Future chats remember everything', desc: 'Every new conversation automatically retrieves relevant memories and personalizes your AI experience.' },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex gap-6 glass rounded-2xl p-6 group hover:border-white/10 transition-all"
            >
              <span className="font-display text-4xl font-bold text-gradient-chain shrink-0 leading-none">{step.n}</span>
              <div>
                <h3 className="font-display text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass rounded-3xl p-12 glow-blue chain-border">
            <Brain className="w-12 h-12 text-gradient-chain mx-auto mb-6 text-chain-400" />
            <h2 className="font-display text-4xl font-bold mb-4">
              Start building your
              <br />
              <span className="text-gradient-chain">permanent memory</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Connect your wallet and have your first conversation. Your memories are forever.
            </p>
            <WalletConnectButton />
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-chain-400" />
            <span className="text-sm font-display font-semibold text-gradient-chain">MemoryChain AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built on Sui × Walrus
          </p>
        </div>
      </footer>
    </div>
  )
}
