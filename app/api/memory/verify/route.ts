import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyMemoryOnChain } from '@/services/sui'
import { walrusService } from '@/services/walrus'

export async function POST(req: NextRequest) {
  try {
    const { memoryId, walletAddress } = await req.json()

    if (!memoryId || !walletAddress) {
      return Response.json(
        { success: false, error: 'Memory ID and wallet address required' },
        { status: 400 }
      )
    }

    const memory = await prisma.memory.findFirst({
      where: { id: memoryId },
      include: { user: true },
    })

    if (!memory) {
      return Response.json({ success: false, error: 'Memory not found' }, { status: 404 })
    }

    if (memory.user.walletAddress !== walletAddress) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const verification = {
      memoryId,
      suiVerified: false,
      walrusVerified: false,
      contentHash: memory.contentHash,
      suiObjectId: memory.suiObjectId,
      walrusBlobId: memory.walrusBlobId,
    }

    // Verify on Sui
    if (memory.suiObjectId) {
      verification.suiVerified = await verifyMemoryOnChain(memory.suiObjectId)
    }

    // Verify on Walrus
    if (memory.walrusBlobId) {
      verification.walrusVerified = await walrusService.verifyBlob(memory.walrusBlobId)
    }

    // Update verification status
    if (verification.suiVerified || verification.walrusVerified) {
      await prisma.memory.update({
        where: { id: memoryId },
        data: { verified: true },
      })
    }

    return Response.json({ success: true, data: verification })
  } catch (error) {
    console.error('Verify error:', error)
    return Response.json({ success: false, error: 'Verification failed' }, { status: 500 })
  }
}
