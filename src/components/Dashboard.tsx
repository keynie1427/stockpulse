'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Activity, TrendingUp, TrendingDown, Search, LogIn, LogOut, Star, RefreshCw } from 'lucide-react'
import { DEFAULT_WATCHLIST } from '@/lib/alpaca'

interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
}

interface ChartData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export default function Dashboard() {
  const { user, isConfigured, signInWithGoogle, logout } = useAuth()
  const [watchlist] = useState(DEFAULT_WATCHLIST)
  const [stocks, setStocks] = useState<Record<string, StockData>>({})
  const [selected, setSelected] = useState('AAPL')
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [timeframe, setTimeframe] = useState('1M')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch watchlist prices
  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch(`/api/stocks/snapshot?symbols=${watchlist.join(',')}`)
        const data = await res.json()
        
        const stockMap: Record<string, StockData> = {}
        for (const [symbol, snapshot] of Object.entries(data)) {
          const s = snapshot as { latestTrade?: { p: number }; dailyBar?: { c: number; o: number } }
          const price = s.latestTrade?.p || s.dailyBar?.c || 0
          const prevClose = s.dailyBar?.o || price
          const change = price - prevClose
          const changePercent = prevClose ? (change / prevClose) * 100 : 0
          stockMap[symbol] = { symbol, price, change, changePercent }
        }
        setStocks(stockMap)
      } catch (err) {
        console.error('Failed to fetch prices:', err)
      }
    }
    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [watchlist])

  // Fetch chart data
  useEffect(() => {
    async function fetchChart() {
      setLoading(true)
      try {
        const res = await fetch(`/api/stocks/bars?symbol=${selected}&timeframe=${timeframe}`)
        const data = await res.json()
        setChartData(data.bars || [])
      } catch (err) {
        console.error('Failed to fetch chart:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchChart()
  }, [selected, timeframe])

  const formatPrice = (n: number) => `$${n.toFixed(2)}`
  const formatPercent = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`

  // Calculate chart dimensions
  const prices = chartData.map(d => d.close)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const range = maxPrice - minPrice || 1
  const getY = (price: number) => 100 - ((price - minPrice) / range) * 100

  const isPositive = chartData.length > 1 ? chartData[chartData.length - 1].close >= chartData[0].close : true
  const chartColor = isPositive ? '#22c55e' : '#ef4444'

  const currentStock = stocks[selected]

  const filteredWatchlist = watchlist.filter(s => 
    s.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold">StockPulse</h1>
              <p className="text-zinc-500 text-xs">v2.0</p>
            </div>
          </div>
          
          {isConfigured && (
            <div>
              {user ? (
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  {user.email?.split('@')[0]}
                </button>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Watchlist Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-emerald-400" />
                <h2 className="font-semibold">Watchlist</h2>
              </div>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Stock List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredWatchlist.map(symbol => {
                  const stock = stocks[symbol]
                  return (
                    <button
                      key={symbol}
                      onClick={() => setSelected(symbol)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        selected === symbol
                          ? 'bg-emerald-500/20 border border-emerald-500/50'
                          : 'bg-zinc-800 hover:bg-zinc-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{symbol}</span>
                        {stock && (
                          <span className={stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {formatPercent(stock.changePercent)}
                          </span>
                        )}
                      </div>
                      {stock && (
                        <div className="text-zinc-400 text-sm">{formatPrice(stock.price)}</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {/* Stock Header */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">{selected}</h2>
                  {currentStock && (
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-4xl font-bold">{formatPrice(currentStock.price)}</span>
                      <span className={`flex items-center gap-1 text-xl ${
                        currentStock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {currentStock.changePercent >= 0 ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                        {formatPercent(currentStock.changePercent)}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setChartData([...chartData])}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              {/* Timeframe Buttons */}
              <div className="flex gap-2 mb-6">
                {['1D', '1W', '1M', '3M', '1Y', '5Y'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      timeframe === tf
                        ? 'bg-white text-black'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* SVG Chart */}
              <div className="h-[350px] relative">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-zinc-500">
                    Loading...
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-500">
                    No data available
                  </div>
                ) : (
                  <svg
                    className="w-full h-full"
                    viewBox={`0 0 ${chartData.length} 100`}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColor} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Area */}
                    <path
                      d={`
                        M 0 ${getY(chartData[0].close)}
                        ${chartData.map((d, i) => `L ${i} ${getY(d.close)}`).join(' ')}
                        L ${chartData.length - 1} 100
                        L 0 100
                        Z
                      `}
                      fill="url(#gradient)"
                    />
                    
                    {/* Line */}
                    <path
                      d={`
                        M 0 ${getY(chartData[0].close)}
                        ${chartData.map((d, i) => `L ${i} ${getY(d.close)}`).join(' ')}
                      `}
                      fill="none"
                      stroke={chartColor}
                      strokeWidth="0.5"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                )}
              </div>

              {/* Price Range */}
              {chartData.length > 0 && (
                <div className="flex justify-between text-sm text-zinc-500 mt-4">
                  <span>Low: {formatPrice(minPrice)}</span>
                  <span>{chartData.length} data points</span>
                  <span>High: {formatPrice(maxPrice)}</span>
                </div>
              )}
            </div>

            {/* OHLC Stats */}
            {chartData.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Open', value: chartData[chartData.length - 1].open },
                  { label: 'High', value: chartData[chartData.length - 1].high },
                  { label: 'Low', value: chartData[chartData.length - 1].low },
                  { label: 'Volume', value: chartData[chartData.length - 1].volume, isVolume: true },
                ].map(stat => (
                  <div key={stat.label} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                    <div className="text-zinc-500 text-sm">{stat.label}</div>
                    <div className="text-xl font-semibold mt-1">
                      {stat.isVolume 
                        ? `${(stat.value / 1000000).toFixed(2)}M`
                        : formatPrice(stat.value)
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-12 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between text-zinc-500 text-sm">
          <span>Data by Alpaca Markets</span>
          <span>Prices may be delayed</span>
        </div>
      </footer>
    </div>
  )
}
