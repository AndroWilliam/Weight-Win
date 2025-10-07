import { createClient } from '@/lib/supabase/server'

/**
 * Server-side function to check if the current user is an admin
 * Uses the is_admin() PostgreSQL function via RPC
 */
export async function userIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('[Admin Guard] No authenticated user')
      return false
    }
    
    // Call the is_admin RPC function
    const { data, error } = await supabase.rpc('is_admin', { uid: user.id })
    
    if (error) {
      console.error('[Admin Guard] Error checking admin status:', error)
      return false
    }
    
    console.log('[Admin Guard] User admin status:', { email: user.email, isAdmin: !!data })
    return !!data
  } catch (error) {
    console.error('[Admin Guard] Unexpected error:', error)
    return false
  }
}

/**
 * Client-side hook to check admin status
 * Call from client components
 */
export async function checkIsAdminClient(): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/check')
    const data = await response.json()
    return data.isAdmin ?? false
  } catch (error) {
    console.error('[Admin Guard Client] Error:', error)
    return false
  }
}

