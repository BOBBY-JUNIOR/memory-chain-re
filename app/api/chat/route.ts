import { openai, extractMemory, buildSystemPromptWithMemories, getChatModel } from '@/lib/openai'
import { searchMemories, saveMemory, getOrCreateUser } from '@/services/memory'
import { NextRequest } from 'next/server'
import type { MemoryCategory } from '@/types'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, walletAddress, conversationId } = body

    if (!walletAddress) {
      return Response.json({ error: 'Wallet address required' }, { status: 401 })
    }

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Messages required' }, { status: 400 })
    }

    // Get or create user
    const user = await getOrCreateUser(walletAddress)

    // Get last user message for memory search
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content ?? ''

    // Search for relevant memories
    let relevantMemories: string[] = []
    if (lastUserMessage) {
      const memories = await searchMemories({
        userId: user.id,
        query: lastUserMessage,
        limit: 5,
      })
      relevantMemories = memories.map(m => m.content)
    }

    // Build system prompt with memories
    const systemPrompt = buildSystemPromptWithMemories(relevantMemories)

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: getChatModel(),
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-20), // Keep last 20 messages for context
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    // Collect full response for memory extraction
    let fullResponse = ''

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? ''
            if (delta) {
              fullResponse += delta
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`))
            }
          }

          // Extract and save memory asynchronously (don't block response)
          if (lastUserMessage && fullResponse) {
            extractAndSaveMemory({
              userId: user.id,
              walletAddress,
              userMessage: lastUserMessage,
              assistantResponse: fullResponse,
            }).catch(console.error)
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function extractAndSaveMemory(params: {
  userId: string
  walletAddress: string
  userMessage: string
  assistantResponse: string
}) {
  const extraction = await extractMemory(params.userMessage, params.assistantResponse)

  if (!extraction || !extraction.is_memory) return

  await saveMemory({
    userId: params.userId,
    walletAddress: params.walletAddress,
    content: extraction.memory,
    category: extraction.category as MemoryCategory,
    importanceScore: extraction.importance_score,
  })
}
