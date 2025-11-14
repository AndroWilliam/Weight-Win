'use client'

import { useSearchParams } from 'next/navigation'

/**
 * Hook to check if demo mode is active via ?demo=true query parameter
 *
 * Demo mode bypasses validation and shows sample data for QA testing
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
  const searchParams = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'

  return { isDemoMode }
}
