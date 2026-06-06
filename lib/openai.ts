import OpenAI from 'openai'
import type { MemoryExtraction } from '@/types'

const isOpenRouter =
  !!process.env.OPENROUTER_API_KEY ||
  process.env.OPENROUTER_BASE_URL?.includes('openrouter.ai') ||
  process.env.OPENAI_BASE_URL?.includes('openrouter.ai')

const baseURL =
  process.env.OPENROUTER_BASE_URL ||
  process.env.OPENAI_BASE_URL ||
  (isOpenRouter ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1')

const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY

const siteUrl =
  process.env.OPENROUTER_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)

const defaultHeaders: Record<string, string> = {}

if (isOpenRouter) {
  if (siteUrl) defaultHeaders['HTTP-Referer'] = siteUrl
  defaultHeaders['X-OpenRouter-Title'] = process.env.OPENROUTER_APP_NAME || 'MemoryChain AI'
}

export const openai = new OpenAI({
  apiKey,
  baseURL,
  defaultHeaders,
})

export function getChatModel() {
  return (
    process.env.OPENROUTER_MODEL ||
    process.env.OPENAI_MODEL ||
    (isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini')
  )
}

export function getEmbeddingModel() {
  return (
    process.env.OPENROUTER_EMBEDDING_MODEL ||
    process.env.OPENAI_EMBEDDING_MODEL ||
    (isOpenRouter ? 'openai/text-embedding-3-small' : 'text-embedding-3-small')
  )
}

export async function extractMemory(
  userMessage: string,
  assistantResponse: string
): Promise<MemoryExtraction | null> {
  try {
    const response = await openai.chat.completions.create({
      model: getChatModel(),
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `You are a memory extraction system. Analyze conversations and extract important personal facts worth remembering long-term.

Return ONLY valid JSON with this structure:
{
  "is_memory": boolean,
  "memory": "concise factual statement about the user",
  "category": "personal" | "business" | "preferences" | "projects" | "learning" | "general",
  "importance_score": 0.0-1.0,
  "reasoning": "why this is worth remembering"
}

Extract memories for:
- Personal facts (name, location, family, health)
- Business/work context (company, role, projects)
- Strong preferences (likes/dislikes, opinions)
- Active projects (what they're building/working on)
- Learning goals (what they want to learn)

Do NOT extract:
- Questions or hypothetical scenarios
- Temporary or trivial information
- Conversational filler
- Already obvious information

Set is_memory: false if nothing significant to extract.`,
        },
        {
          role: 'user',
          content: `User said: "${userMessage}"\n\nAssistant responded: "${assistantResponse.slice(0, 500)}"\n\nExtract any important memory:`,
        },
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) return null

    const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim())
    if (!parsed.is_memory) return null

    return parsed as MemoryExtraction
  } catch (error) {
    console.error('Memory extraction error:', error)
    return null
  }
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await openai.embeddings.create({
      model: getEmbeddingModel(),
      input: text,
    })
    return response.data[0]?.embedding ?? null
  } catch (error) {
    console.error('Embedding generation error:', error)
    return null
  }
}

export function buildSystemPromptWithMemories(memories: string[]): string {
  const base = `You are MemoryChain AI, a helpful assistant with persistent long-term memory stored on the blockchain. You remember important facts about users across conversations.

Be helpful, concise, and personable. Reference relevant memories naturally in conversation without being robotic about it.`

  if (memories.length === 0) return base

  const memoriesText = memories.map((m, i) => `${i + 1}. ${m}`).join('\n')

  return `${base}

## Relevant memories about this user:
${memoriesText}

Use these memories to provide personalized, context-aware responses. Reference them naturally when relevant.`
}
