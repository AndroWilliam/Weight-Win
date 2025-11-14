'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to check if demo mode is active via ?demo=true query parameter
 *
 * Demo mode bypasses validation and shows sample data for QA testing
 * Uses client-side only detection to avoid SSR/build issues
 *
 * @example
 * const { isDemoMode } = useDemoMode()
 * if (isDemoMode) {
 *   // Use sample data
 * } else {
 *   // Normal validation
 * }
 */
export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Only run on client side to avoid SSR issues
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setIsDemoMode(params.get('demo') === 'true')
    }
  }, [])

  return { isDemoMode }
}
