import type { WalrusMemoryRecord, WalrusUploadResponse } from '@/types'

// ─── Walrus Decentralized Storage ────────────────────────────────────────────
// Walrus stores memory blobs on Sui in a trustless, permanent way.
// Core to MemoryChain: every AI memory is a Walrus blob, not just a DB row.
// Docs: https://docs.wal.app

// Mainnet endpoints (use for production / hackathon judging)
const WALRUS_MAINNET_PUBLISHER = 'https://publisher.walrus.space'
const WALRUS_MAINNET_AGGREGATOR = 'https://aggregator.walrus.space'

// Testnet endpoints
const WALRUS_TESTNET_PUBLISHER = 'https://publisher.walrus-testnet.walrus.space'
const WALRUS_TESTNET_AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space'

const SUI_NETWORK = process.env.SUI_NETWORK || 'testnet'

function getWalrusPublisher(): string {
  if (process.env.WALRUS_PUBLISHER_URL) return process.env.WALRUS_PUBLISHER_URL
  return SUI_NETWORK === 'mainnet' ? WALRUS_MAINNET_PUBLISHER : WALRUS_TESTNET_PUBLISHER
}

function getWalrusAggregator(): string {
  if (process.env.WALRUS_AGGREGATOR_URL) return process.env.WALRUS_AGGREGATOR_URL
  return SUI_NETWORK === 'mainnet' ? WALRUS_MAINNET_AGGREGATOR : WALRUS_TESTNET_AGGREGATOR
}

export class WalrusService {
  get publisherUrl() { return getWalrusPublisher() }
  get aggregatorUrl() { return getWalrusAggregator() }

  /**
   * Store a memory record on Walrus decentralized storage.
   * Returns a blobId that is permanently addressable on Sui.
   */
  async storeMemory(record: WalrusMemoryRecord): Promise<WalrusUploadResponse> {
    const payload = JSON.stringify(record)
    const blob = new Blob([payload], { type: 'application/json' })

    // epochs=200 = ~6+ months of guaranteed storage
    const url = `${this.publisherUrl}/v1/blobs?epochs=200`

    const response = await fetch(url, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Walrus upload failed (${response.status}): ${errorText}`)
    }

    const result = await response.json()

    // Walrus returns either newlyCreated or alreadyCertified
    if (result.newlyCreated) {
      const { blobId, suiObject } = result.newlyCreated
      return {
        blobId,
        objectId: suiObject?.id ?? blobId,
        size: payload.length,
      }
    } else if (result.alreadyCertified) {
      const { blobId } = result.alreadyCertified
      return {
        blobId,
        objectId: blobId,
        size: payload.length,
      }
    }

    throw new Error(`Unexpected Walrus response: ${JSON.stringify(result)}`)
  }

  /**
   * Retrieve a memory record from Walrus by its blobId.
   * This proves the data is stored on decentralized storage, not just a DB.
   */
  async retrieveMemory(blobId: string): Promise<WalrusMemoryRecord | null> {
    try {
      const response = await fetch(`${this.aggregatorUrl}/v1/blobs/${blobId}`)
      if (!response.ok) return null
      const data = await response.json()
      return data as WalrusMemoryRecord
    } catch (error) {
      console.error('Walrus retrieval error:', error)
      return null
    }
  }

  /**
   * Check if a blob still exists on Walrus (integrity verification).
   */
  async verifyBlob(blobId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.aggregatorUrl}/v1/blobs/${blobId}`, {
        method: 'HEAD',
      })
      return response.ok
    } catch {
      return false
    }
  }

  // Mock — only for CI / unit tests, not for hackathon submission
  async storeMemoryMock(record: WalrusMemoryRecord): Promise<WalrusUploadResponse> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const blobId = `mock-blob-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    return {
      blobId,
      objectId: `mock-obj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      size: JSON.stringify(record).length,
    }
  }
}

export const walrusService = new WalrusService()

/**
 * Store a memory on Walrus. Mock only if explicitly set — real storage is default.
 */
export async function storeMemoryOnWalrus(record: WalrusMemoryRecord): Promise<WalrusUploadResponse> {
  // Only use mock if WALRUS_USE_MOCK is explicitly "true"
  // Default is real Walrus storage — this is a core hackathon requirement
  if (process.env.WALRUS_USE_MOCK === 'true') {
    console.warn('[Walrus] Using mock storage. Set WALRUS_USE_MOCK=false for real storage.')
    return walrusService.storeMemoryMock(record)
  }

  return walrusService.storeMemory(record)
}
