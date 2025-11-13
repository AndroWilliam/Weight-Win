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
      <div className="w-[70px] h-10 md:h-10 bg-white/10 border border-white/20 rounded-full animate-pulse" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`
        relative inline-flex h-10 md:h-10 w-[70px] items-center rounded-[20px] transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
        ${isDark
          ? 'bg-violet-500/15 border border-violet-500/30 hover:shadow-[0_0_20px_rgba(129,140,248,0.8)]'
          : 'bg-white/10 border border-white/20 hover:shadow-[0_0_20px_rgba(251,191,36,0.8)]'
        }
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      role="switch"
      aria-checked={isDark}
    >
      {/* Sun Icon (always visible, bright in light mode, dimmed in dark mode) */}
      <motion.div
        animate={{
          opacity: isDark ? 0.3 : 1,
          scale: isDark ? 0.9 : 1
        }}
        transition={{ duration: 0.3 }}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
        style={{ pointerEvents: 'none' }}
      >
        <Sun
          className="h-5 w-5 text-amber-400 fill-amber-400"
          style={{
            filter: isDark
              ? 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.3))'
              : 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))'
          }}
        />
      </motion.div>

      {/* Moon Icon (always visible, bright in dark mode, dimmed in light mode) */}
      <motion.div
        animate={{
          opacity: isDark ? 1 : 0.3,
          scale: isDark ? 1 : 0.9
        }}
        transition={{ duration: 0.3 }}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
        style={{ pointerEvents: 'none' }}
      >
        <Moon
          className="h-5 w-5 text-indigo-400 fill-indigo-400"
          style={{
            filter: isDark
              ? 'drop-shadow(0 0 8px rgba(129, 140, 248, 0.8))'
              : 'drop-shadow(0 0 4px rgba(129, 140, 248, 0.3))'
          }}
        />
      </motion.div>

      {/* Toggle Circle */}
      <motion.span
        animate={{ x: isDark ? 34 : 4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`
          inline-block h-8 w-8 rounded-full shadow-lg relative z-20
          ${isDark
            ? 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/40'
            : 'bg-gradient-to-br from-white to-gray-100 shadow-black/10'
          }
        `}
      />
    </motion.button>
  )
}
