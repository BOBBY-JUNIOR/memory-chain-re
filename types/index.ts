import type { Memory, Message, Conversation, User, MemoryCategory } from '@prisma/client'

export type { Memory, Message, Conversation, User, MemoryCategory }

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: Date
}

export interface MemoryExtraction {
  is_memory: boolean
  memory: string
  category: MemoryCategory
  importance_score: number
  reasoning: string
}

export interface WalrusMemoryRecord {
  id: string
  content: string
  category: string
  timestamp: number
  owner_wallet: string
  importance_score: number
}

export interface WalrusUploadResponse {
  blobId: string
  objectId: string
  size: number
}

export interface SuiMemoryObject {
  objectId: string
  txDigest: string
  contentHash: string
  walrusBlobId: string
  owner: string
}

export interface MemoryWithScore extends Memory {
  similarity?: number
}

export interface DashboardStats {
  totalMemories: number
  storageUsed: number
  categoryCounts: Record<MemoryCategory, number>
  recentMemories: Memory[]
  importanceDistribution: { score: string; count: number }[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export type CategoryColor = {
  bg: string
  text: string
  border: string
  dot: string
}

export const CATEGORY_COLORS: Record<MemoryCategory, CategoryColor> = {
  personal: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    border: 'border-violet-500/20',
    dot: 'bg-violet-400',
  },
  business: {
    bg: 'bg-chain-500/10',
    text: 'text-chain-400',
    border: 'border-chain-500/20',
    dot: 'bg-chain-400',
  },
  preferences: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  projects: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
  },
  learning: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    dot: 'bg-rose-400',
  },
  general: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
    dot: 'bg-slate-400',
  },
}

export const CATEGORY_ICONS: Record<MemoryCategory, string> = {
  personal: 'User',
  business: 'Work',
  preferences: 'Star',
  projects: 'Build',
  learning: 'Learn',
  general: 'Note',
}
