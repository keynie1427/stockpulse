import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata = {
  title: 'StockPulse - Real-time Stock Analysis',
  description: 'Real-time stock market analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
