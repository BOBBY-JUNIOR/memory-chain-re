'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Send, Square, Trash2, Sparkles } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { formatRelativeTime } from '@/lib/utils'
import type { ChatMessage } from '@/types'

interface ChatInterfaceProps {
  walletAddress: string
}

export function ChatInterface({ walletAddress }: ChatInterfaceProps) {
  const { messages, isStreaming, error, sendMessage, stopStreaming, clearMessages } = useChat(walletAddress)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = () => {
    if (!input.trim() || isStreaming) return
    sendMessage(input)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-chain-500 to-violet-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-sm">MemoryChain AI</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-muted-foreground">Memory active</span>
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
        )}

        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <TypingIndicator />
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400"
          >
            {error}
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-4 border-t border-white/6 shrink-0">
        <div className="glass rounded-2xl border border-white/8 focus-within:border-chain-500/40 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything... I remember you."
            disabled={isStreaming}
            rows={1}
            className="w-full bg-transparent px-4 pt-4 pb-2 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none disabled:opacity-50 leading-relaxed"
            style={{ maxHeight: '200px' }}
          />
          <div className="flex items-center justify-between px-4 pb-3">
            <span className="text-xs text-muted-foreground/50 font-mono">
              {isStreaming ? 'Generating...' : 'Enter to send - Shift+Enter for newline'}
            </span>
            <button
              onClick={isStreaming ? stopStreaming : handleSubmit}
              disabled={!isStreaming && !input.trim()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isStreaming
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                  : input.trim()
                  ? 'bg-chain-500 text-white hover:bg-chain-600 shadow-lg shadow-chain-500/20'
                  : 'bg-white/5 text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isStreaming ? (
                <>
                  <Square className="w-3 h-3" />
                  Stop
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const isEmpty = message.content === ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-mono font-bold ${
        isUser
          ? 'bg-chain-500/20 border border-chain-500/30 text-chain-300'
          : 'bg-violet-500/20 border border-violet-500/30'
      }`}>
        {isUser ? 'U' : <Brain className="w-4 h-4 text-violet-300" />}
      </div>

      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-chain-500/15 border border-chain-500/20 text-foreground'
            : 'glass border border-white/8 text-foreground/90'
        }`}>
          {isEmpty ? (
            <TypingDots />
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>
        <span className="text-xs text-muted-foreground/50 px-1">
          {formatRelativeTime(message.createdAt)}
        </span>
      </div>
    </motion.div>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-1 py-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-violet-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
        <Brain className="w-4 h-4 text-violet-300" />
      </div>
      <div className="glass border border-white/8 rounded-2xl px-4 py-3">
        <TypingDots />
      </div>
    </div>
  )
}

function EmptyState() {
  const suggestions = [
    "What's my name and what projects am I working on?",
    "Tell me what you know about me so far.",
    "I'm building a DeFi app on Sui blockchain.",
    "My favorite programming language is TypeScript.",
  ]

  return (
    <div className="h-full flex flex-col items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-chain-500/20 to-violet-600/20 border border-chain-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
          <Brain className="w-8 h-8 text-chain-400" />
        </div>
        <h3 className="font-display text-lg font-semibold mb-2">Start a conversation</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          I&apos;ll automatically remember important details from our chats, stored permanently on blockchain.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
        {suggestions.map((s, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="glass-hover rounded-xl px-4 py-2.5 text-xs text-left text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 group"
          >
            <Sparkles className="w-3 h-3 text-chain-400/60 group-hover:text-chain-400 shrink-0" />
            {s}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
