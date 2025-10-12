'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-14 h-7 bg-muted rounded-full animate-pulse" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
        ${isDark ? 'bg-primary' : 'bg-muted'}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span
        className={`
          inline-flex h-6 w-6 items-center justify-center transform rounded-full bg-background shadow-lg transition-transform duration-300 ease-in-out
          ${isDark ? 'translate-x-7' : 'translate-x-0.5'}
        `}
      >
          <Sun className={`h-4 w-4 text-slate-500 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-100'}`} />
          <Moon className={`absolute h-4 w-4 text-white transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0'}`} />
      </span>
    </button>
  )
}
