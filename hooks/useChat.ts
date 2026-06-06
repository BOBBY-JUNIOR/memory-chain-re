import { useState, useCallback, useRef } from 'react'
import type { ChatMessage } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export function useChat(walletAddress: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return

    setError(null)

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      createdAt: new Date(),
    }

    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setIsStreaming(true)

    abortRef.current = new AbortController()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          walletAddress,
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Chat request failed')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response body')

      let accumulatedContent = ''
      let buffer = ''

      const handleEvent = (event: string) => {
        const dataLines = event
          .split('\n')
          .filter(line => line.startsWith('data: '))
          .map(line => line.slice(6))

        if (dataLines.length === 0) return

        const data = dataLines.join('\n')
        if (data === '[DONE]') return

        const parsed = JSON.parse(data)
        if (!parsed.content) return

        accumulatedContent += parsed.content
        setMessages(prev => {
          const newMessages = [...prev]
          const lastMsg = newMessages[newMessages.length - 1]
          if (lastMsg && lastMsg.role === 'assistant') {
            newMessages[newMessages.length - 1] = {
              ...lastMsg,
              content: accumulatedContent,
            }
          }
          return newMessages
        })
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() ?? ''

        for (const event of events) {
          handleEvent(event)
        }
      }

      if (buffer.trim()) {
        handleEvent(buffer)
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return

      setError('Failed to send message. Please try again.')
      setMessages(prev => prev.filter(m => m.id !== assistantMessage.id))
      console.error('Chat error:', err)
    } finally {
      setIsStreaming(false)
    }
  }, [messages, isStreaming, walletAddress])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, isStreaming, error, sendMessage, stopStreaming, clearMessages }
}
