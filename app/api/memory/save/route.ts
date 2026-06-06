import { NextRequest } from 'next/server'
import { saveMemory, getOrCreateUser } from '@/services/memory'
import type { MemoryCategory } from '@/types'
import { z } from 'zod'

const saveSchema = z.object({
  walletAddress: z.string().min(1),
  content: z.string().min(1).max(5000),
  category: z.enum(['personal', 'business', 'preferences', 'projects', 'learning', 'general']),
  importanceScore: z.number().min(0).max(1).optional().default(0.7),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = saveSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.message },
        { status: 400 }
      )
    }

    const { walletAddress, content, category, importanceScore } = parsed.data

    const user = await getOrCreateUser(walletAddress)

    const memory = await saveMemory({
      userId: user.id,
      walletAddress,
      content,
      category: category as MemoryCategory,
      importanceScore,
    })

    return Response.json({ success: true, data: memory })
  } catch (error) {
    console.error('Memory save error:', error)
    return Response.json({ success: false, error: 'Failed to save memory' }, { status: 500 })
  }
}
