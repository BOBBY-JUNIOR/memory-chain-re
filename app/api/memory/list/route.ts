import { NextRequest } from 'next/server'
import { listMemories, getOrCreateUser } from '@/services/memory'
import { z } from 'zod'

const listSchema = z.object({
  wallet: z.string().min(1, 'Wallet address required'),
  category: z.enum(['personal', 'business', 'preferences', 'projects', 'learning', 'general']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = listSchema.safeParse(Object.fromEntries(searchParams))

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      )
    }

    const { wallet: walletAddress, category, limit, offset } = parsed.data
    const user = await getOrCreateUser(walletAddress)

    const result = await listMemories({
      userId: user.id,
      category,
      limit,
      offset,
    })

    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error('Memory list error:', error)
    return Response.json({ success: false, error: 'Failed to list memories' }, { status: 500 })
  }
}
