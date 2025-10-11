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
      <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        relative inline-flex h-6 w-12 items-center rounded-full transition-colors
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${isDark ? 'bg-primary' : 'bg-gray-200'}
        dark:focus:ring-offset-gray-900
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out
          ${isDark ? 'translate-x-6' : 'translate-x-0.5'}
        `}
      >
        <div className="flex items-center justify-center h-full">
          {isDark ? (
            <Moon className="h-3 w-3 text-primary" />
          ) : (
            <Sun className="h-3 w-3 text-yellow-500" />
          )}
        </div>
      </span>
    </button>
  )
}
