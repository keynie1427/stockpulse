import { NextRequest, NextResponse } from 'next/server'
import { getSnapshot, getMultipleSnapshots } from '@/lib/alpaca'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const symbols = searchParams.get('symbols')

  try {
    if (symbols) {
      const data = await getMultipleSnapshots(symbols.split(','))
      return NextResponse.json(data)
    } else if (symbol) {
      const data = await getSnapshot(symbol)
      return NextResponse.json(data)
    } else {
      return NextResponse.json({ error: 'Missing symbol' }, { status: 400 })
    }
  } catch (error) {
    console.error('Snapshot API error:', error)
    return NextResponse.json({ error: 'Failed to fetch snapshot' }, { status: 500 })
  }
}
