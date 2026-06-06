import OpenAI from 'openai'
import type { MemoryExtraction } from '@/types'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
})

export async function extractMemory(
  userMessage: string,
  assistantResponse: string
): Promise<MemoryExtraction | null> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
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
      model: 'text-embedding-3-small',
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
