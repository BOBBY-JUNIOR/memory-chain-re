import { getSuiNetworkInfo } from '@/services/sui'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

/**
 * GET /api/sui-info
 * Returns live Sui network info via Tatum RPC.
 * Demonstrates Tatum integration to hackathon judges.
 */
export async function GET(_req: NextRequest) {
  try {
    const info = await getSuiNetworkInfo()
    if (!info) {
      return Response.json({ error: 'Could not fetch Sui network info' }, { status: 503 })
    }
    return Response.json({ success: true, data: info })
  } catch (error) {
    console.error('Sui info error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
