'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'

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
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`
        relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-500 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
        ${isDark ? 'bg-primary' : 'bg-muted'}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.span
        animate={{ x: isDark ? 28 : 2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-background shadow-lg relative"
      >
        <motion.div
          animate={{ 
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0.5 : 1,
            rotate: isDark ? 180 : 0
          }}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <Sun className="h-4 w-4 text-slate-500" />
        </motion.div>
        <motion.div
          animate={{ 
            opacity: isDark ? 1 : 0,
            scale: isDark ? 1 : 0.5,
            rotate: isDark ? 0 : -180
          }}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <Moon className="h-4 w-4 text-white" />
        </motion.div>
      </motion.span>
    </motion.button>
  )
}
