'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Hook to check if user should see preview mode
 * Returns true if user is NOT authenticated
 */
export function usePreviewMode() {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      setIsPreviewMode(!user) // Preview mode if NOT logged in
      setLoading(false)
    }

    checkAuth()
  }, [])

  return { isPreviewMode, loading }
}


