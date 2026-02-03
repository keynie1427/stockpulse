const BASE_URL = 'https://data.alpaca.markets/v2'

const headers = {
  'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
  'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET || '',
}

export const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM']

export async function getStockBars(symbol: string, timeframe: string) {
  const now = new Date()
  let start: Date
  let tf = '1Day'
  
  switch (timeframe) {
    case '1D':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      tf = '1Hour'
      break
    case '1W':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      tf = '1Hour'
      break
    case '1M':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      tf = '1Day'
      break
    case '3M':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      tf = '1Day'
      break
    case '1Y':
      start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      tf = '1Day'
      break
    case '5Y':
      start = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000)
      tf = '1Week'
      break
    default:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  const url = `${BASE_URL}/stocks/${symbol}/bars?timeframe=${tf}&start=${start.toISOString()}&limit=500`
  
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`Alpaca API error: ${res.status}`)
  
  const data = await res.json()
  
  return (data.bars || []).map((bar: { t: string; o: number; h: number; l: number; c: number; v: number }) => ({
    date: bar.t,
    open: bar.o,
    high: bar.h,
    low: bar.l,
    close: bar.c,
    volume: bar.v,
  }))
}

export async function getSnapshot(symbol: string) {
  const url = `${BASE_URL}/stocks/${symbol}/snapshot`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`Alpaca API error: ${res.status}`)
  return res.json()
}

export async function getMultipleSnapshots(symbols: string[]) {
  const url = `${BASE_URL}/stocks/snapshots?symbols=${symbols.join(',')}`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`Alpaca API error: ${res.status}`)
  return res.json()
}
