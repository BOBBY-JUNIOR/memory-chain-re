import { SuiClient } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import type { SuiMemoryObject } from '@/types'
import crypto from 'crypto'

// ─── Tatum-powered Sui RPC ────────────────────────────────────────────────────
// Tatum provides enterprise-grade Sui RPC nodes for this hackathon.
// Sign up free: https://dashboard.tatum.io/
const TATUM_API_KEY = process.env.TATUM_API_KEY || ''
const SUI_NETWORK = (process.env.SUI_NETWORK as 'mainnet' | 'testnet' | 'devnet') || 'testnet'
const PACKAGE_ID = process.env.SUI_PACKAGE_ID || ''
const MODULE_NAME = 'memory_registry'

// Tatum RPC endpoint selection
function getTatumRpcUrl(): string {
  if (process.env.SUI_RPC_URL) return process.env.SUI_RPC_URL
  switch (SUI_NETWORK) {
    case 'mainnet':
      return 'https://sui-mainnet.gateway.tatum.io'
    case 'testnet':
      return 'https://sui-testnet.gateway.tatum.io'
    case 'devnet':
      return 'https://sui-devnet.gateway.tatum.io'
    default:
      return 'https://sui-mainnet.gateway.tatum.io'
  }
}

// Build SuiClient with Tatum API key injected as header
export function createSuiClient(): SuiClient {
  const rpcUrl = getTatumRpcUrl()

  // If Tatum API key is provided, use authenticated transport
  if (TATUM_API_KEY) {
    return new SuiClient({
      url: rpcUrl,
      // Tatum requires x-api-key header for authentication
      transport: new (require('@mysten/sui/client').SuiHTTPTransport)({
        url: rpcUrl,
        requestOptions: {
          headers: {
            'x-api-key': TATUM_API_KEY,
          },
        },
      }),
    })
  }

  // Fallback to unauthenticated (public node) for local dev
  return new SuiClient({ url: rpcUrl })
}

export const suiClient = createSuiClient()

export function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

export async function buildRegisterMemoryTx(params: {
  walletAddress: string
  contentHash: string
  walrusBlobId: string
  category: string
}): Promise<Transaction> {
  const tx = new Transaction()

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::register_memory`,
    arguments: [
      tx.pure.string(params.contentHash),
      tx.pure.string(params.walrusBlobId),
      tx.pure.string(params.category),
    ],
  })

  return tx
}

export async function verifyMemoryOnChain(objectId: string): Promise<boolean> {
  try {
    const object = await suiClient.getObject({
      id: objectId,
      options: { showContent: true },
    })
    return object.data !== null && !object.error
  } catch {
    return false
  }
}

export async function getUserMemoryObjects(walletAddress: string): Promise<SuiMemoryObject[]> {
  try {
    const objects = await suiClient.getOwnedObjects({
      owner: walletAddress,
      filter: PACKAGE_ID ? { Package: PACKAGE_ID } : undefined,
      options: {
        showContent: true,
        showType: true,
      },
    })

    return objects.data
      .map(obj => {
        const content = obj.data?.content as Record<string, unknown> | undefined
        if (!content || content.dataType !== 'moveObject') return null
        const fields = content.fields as Record<string, string>
        return {
          objectId: obj.data?.objectId ?? '',
          txDigest: '',
          contentHash: fields?.content_hash ?? '',
          walrusBlobId: fields?.walrus_blob_id ?? '',
          owner: walletAddress,
        } satisfies SuiMemoryObject
      })
      .filter((o): o is SuiMemoryObject => o !== null)
  } catch (error) {
    console.error('Error fetching Sui objects:', error)
    return []
  }
}

// Get Sui network info via Tatum RPC — useful for health checks & demos
export async function getSuiNetworkInfo() {
  try {
    const [chainId, latestCheckpoint] = await Promise.all([
      suiClient.getChainIdentifier(),
      suiClient.getLatestCheckpointSequenceNumber(),
    ])
    return {
      network: SUI_NETWORK,
      rpcUrl: getTatumRpcUrl(),
      chainId,
      latestCheckpoint: latestCheckpoint.toString(),
      poweredBy: 'Tatum',
    }
  } catch (error) {
    console.error('Sui network info error:', error)
    return null
  }
}

// Mock for development when no wallet/contract is configured
export async function registerMemoryMock(params: {
  walletAddress: string
  contentHash: string
  walrusBlobId: string
}): Promise<SuiMemoryObject> {
  await new Promise(resolve => setTimeout(resolve, 150))
  return {
    objectId: `0x${crypto.randomBytes(32).toString('hex')}`,
    txDigest: `mock-tx-${Date.now()}`,
    contentHash: params.contentHash,
    walrusBlobId: params.walrusBlobId,
    owner: params.walletAddress,
  }
}
