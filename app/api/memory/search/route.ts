import { NextRequest } from 'next/server'
import { searchMemories, getOrCreateUser } from '@/services/memory'
import { z } from 'zod'

const searchSchema = z.object({
  wallet: z.string().min(1, 'Wallet address required'),
  q: z.string().trim().min(1, 'Search query required'),
  limit: z.coerce.number().int().min(1).max(50).default(5),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = searchSchema.safeParse(Object.fromEntries(searchParams))

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      )
    }

    const { wallet: walletAddress, q: query, limit } = parsed.data
    const user = await getOrCreateUser(walletAddress)

    const memories = await searchMemories({
      userId: user.id,
      query,
      limit,
    })

    return Response.json({ success: true, data: memories })
  } catch (error) {
    console.error('Memory search error:', error)
    return Response.json({ success: false, error: 'Search failed' }, { status: 500 })
  }
}
