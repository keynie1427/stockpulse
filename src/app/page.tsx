'use client'

import dynamic from 'next/dynamic'

const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-xl">Loading StockPulse...</div>
    </div>
  ),
})

export default function Home() {
  return <Dashboard />
}
