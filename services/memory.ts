import { prisma } from '@/lib/prisma'
import { generateEmbedding } from '@/lib/openai'
import { storeMemoryOnWalrus } from './walrus'
import { hashContent, registerMemoryMock } from './sui'
import type { Memory, MemoryCategory, MemoryWithScore, WalrusMemoryRecord } from '@/types'

export async function saveMemory(params: {
  userId: string
  walletAddress: string
  content: string
  category: MemoryCategory
  importanceScore: number
}): Promise<Memory> {
  // Generate embedding for semantic search
  const embedding = await generateEmbedding(params.content)

  // Store on Walrus
  const walrusRecord: WalrusMemoryRecord = {
    id: `mem-${Date.now()}`,
    content: params.content,
    category: params.category,
    timestamp: Date.now(),
    owner_wallet: params.walletAddress,
    importance_score: params.importanceScore,
  }

  let walrusBlobId: string | undefined
  let walrusObjectId: string | undefined

  try {
    const walrusResult = await storeMemoryOnWalrus(walrusRecord)
    walrusBlobId = walrusResult.blobId
    walrusObjectId = walrusResult.objectId
  } catch (error) {
    console.error('Walrus storage failed, continuing:', error)
  }

  // Register on Sui blockchain
  const contentHash = hashContent(params.content)
  let suiObjectId: string | undefined
  let txDigest: string | undefined

  try {
    const suiResult = await registerMemoryMock({
      walletAddress: params.walletAddress,
      contentHash,
      walrusBlobId: walrusBlobId ?? '',
    })
    suiObjectId = suiResult.objectId
    txDigest = suiResult.txDigest
  } catch (error) {
    console.error('Sui registration failed, continuing:', error)
  }

  // Save to PostgreSQL with embedding
  const embeddingArray = embedding ? `[${embedding.join(',')}]` : null

  if (embeddingArray) {
    const memory = await prisma.$transaction(async tx => {
      // Use raw query to handle pgvector.
      const result = await tx.$queryRaw<Memory[]>`
        INSERT INTO memories (
          id, "userId", content, category, "importanceScore",
          "walrusObjectId", "walrusBlobId", "suiObjectId", "txDigest",
          "contentHash", verified, embedding, "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text,
          ${params.userId},
          ${params.content},
          ${params.category}::"MemoryCategory",
          ${params.importanceScore},
          ${walrusObjectId ?? null},
          ${walrusBlobId ?? null},
          ${suiObjectId ?? null},
          ${txDigest ?? null},
          ${contentHash},
          false,
          ${embeddingArray}::vector,
          NOW(),
          NOW()
        )
        RETURNING *
      `

      await tx.user.update({
        where: { id: params.userId },
        data: {
          totalMemories: { increment: 1 },
          storageUsed: { increment: BigInt(params.content.length) },
        },
      })

      return result[0]
    })

    return memory
  } else {
    // Fallback without embedding.
    const memory = await prisma.$transaction(async tx => {
      const created = await tx.memory.create({
        data: {
          userId: params.userId,
          content: params.content,
          category: params.category,
          importanceScore: params.importanceScore,
          walrusObjectId,
          walrusBlobId,
          suiObjectId,
          txDigest,
          contentHash,
          verified: false,
        },
      })

      await tx.user.update({
        where: { id: params.userId },
        data: {
          totalMemories: { increment: 1 },
          storageUsed: { increment: BigInt(params.content.length) },
        },
      })

      return created
    })

    return memory
  }
}

export async function searchMemories(params: {
  userId: string
  query: string
  limit?: number
}): Promise<MemoryWithScore[]> {
  const limit = params.limit ?? 5

  // Try vector search first
  const queryEmbedding = await generateEmbedding(params.query)

  if (queryEmbedding) {
    try {
      const embeddingStr = `[${queryEmbedding.join(',')}]`
      const results = await prisma.$queryRaw<(Memory & { similarity: number })[]>`
        SELECT *, 1 - (embedding <=> ${embeddingStr}::vector) AS similarity
        FROM memories
        WHERE "userId" = ${params.userId}
          AND embedding IS NOT NULL
        ORDER BY embedding <=> ${embeddingStr}::vector
        LIMIT ${limit}
      `
      return results.filter(r => r.similarity > 0.7)
    } catch (error) {
      console.error('Vector search failed, falling back:', error)
    }
  }

  // Fallback: text search
  const memories = await prisma.memory.findMany({
    where: {
      userId: params.userId,
      content: { contains: params.query, mode: 'insensitive' },
    },
    orderBy: [{ importanceScore: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  })

  return memories
}

export async function listMemories(params: {
  userId: string
  category?: MemoryCategory
  limit?: number
  offset?: number
}): Promise<{ memories: Memory[]; total: number }> {
  const where = {
    userId: params.userId,
    ...(params.category ? { category: params.category } : {}),
  }

  const [memories, total] = await Promise.all([
    prisma.memory.findMany({
      where,
      orderBy: [{ importanceScore: 'desc' }, { createdAt: 'desc' }],
      take: params.limit ?? 20,
      skip: params.offset ?? 0,
    }),
    prisma.memory.count({ where }),
  ])

  return { memories, total }
}

export async function getOrCreateUser(walletAddress: string) {
  return prisma.user.upsert({
    where: { walletAddress },
    update: {},
    create: { walletAddress },
  })
}
