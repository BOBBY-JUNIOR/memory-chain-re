import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Memory, MemoryCategory } from '@/types'

export function useMemories(walletAddress: string, category?: MemoryCategory) {
  return useQuery({
    queryKey: ['memories', walletAddress, category],
    queryFn: async () => {
      const params = new URLSearchParams({ wallet: walletAddress })
      if (category) params.set('category', category)
      params.set('limit', '50')

      const res = await fetch(`/api/memory/list?${params}`)
      const data = await res.json()

      if (!data.success) throw new Error(data.error)
      return data.data as { memories: Memory[]; total: number }
    },
    enabled: !!walletAddress,
    refetchInterval: 5000, // Refresh every 5 seconds for live updates
  })
}

export function useSearchMemories(walletAddress: string, query: string) {
  return useQuery({
    queryKey: ['memories-search', walletAddress, query],
    queryFn: async () => {
      const params = new URLSearchParams({ wallet: walletAddress, q: query })
      const res = await fetch(`/api/memory/search?${params}`)
      const data = await res.json()

      if (!data.success) throw new Error(data.error)
      return data.data as Memory[]
    },
    enabled: !!walletAddress && query.length > 2,
  })
}

export function useVerifyMemory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { memoryId: string; walletAddress: string }) => {
      const res = await fetch('/api/memory/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return data.data
    },
    onSuccess: (_, { walletAddress }) => {
      queryClient.invalidateQueries({ queryKey: ['memories', walletAddress] })
    },
  })
}

export function useSaveMemory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      walletAddress: string
      content: string
      category: MemoryCategory
      importanceScore?: number
    }) => {
      const res = await fetch('/api/memory/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return data.data as Memory
    },
    onSuccess: (_, { walletAddress }) => {
      queryClient.invalidateQueries({ queryKey: ['memories', walletAddress] })
    },
  })
}
