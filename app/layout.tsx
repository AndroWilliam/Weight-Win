import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from 'sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ThemeProvider } from '@/components/theme-provider'
import { OfflineBanner } from '@/components/OfflineBanner'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'WeightWin - 7 Days to Better Health',
  description: 'Track your weight consistently for 7 days and earn a free nutritionist session. Simple, consistent, rewarding.',
  keywords: 'weight tracking, nutrition, health, fitness, 7-day challenge',
  authors: [{ name: 'WeightWin Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Offline Detection Banner */}
          <OfflineBanner />
          
          <ErrorBoundary>
            {children}
            <Toaster />
            <Sonner />
            <Analytics />
            <SpeedInsights />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
