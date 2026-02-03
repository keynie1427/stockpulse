import { NextRequest, NextResponse } from 'next/server'
import { getStockBars } from '@/lib/alpaca'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'AAPL'
  const timeframe = searchParams.get('timeframe') || '1M'

  try {
    const bars = await getStockBars(symbol, timeframe)
    return NextResponse.json({ bars })
  } catch (error) {
    console.error('Bars API error:', error)
    return NextResponse.json({ error: 'Failed to fetch bars' }, { status: 500 })
  }
}
