import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js"

/**
 * SUPABASE CLIENT SINGLETON (Browser)
 * ====================================
 *
 * Ensures only one Supabase browser client instance exists throughout the app.
 * This prevents "Multiple Supabase clients detected" warnings and keeps
 * connection management consistent.
 *
 * Usage:
 * ```ts
 * import { createClient, getSupabaseClient, supabase } from '@/lib/supabase/client'
 *
 * const supabaseA = createClient()
 * const supabaseB = getSupabaseClient()
 * const supabaseC = supabase
 * // supabaseA === supabaseB === supabaseC
 * ```
 */

let supabaseInstance: SupabaseClient | null = null

// Cookie helper to sync session to cookies for server-side access
function syncSessionToCookies() {
  if (typeof window === 'undefined') return
  
  // Get session from localStorage
  const storageKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`
  const sessionStr = localStorage.getItem(storageKey)
  
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr)
      // Set cookie for server-side access (expires in 7 days)
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=604800; SameSite=Lax; Secure`
      document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=604800; SameSite=Lax; Secure`
    } catch (e) {
      console.error('[Client] Failed to sync session to cookies:', e)
    }
  }
}

function initSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    )
  }

  // Use standard supabase-js for browser OAuth (supports implicit flow)
  // Google OAuth provider uses implicit flow (UUID codes, not PKCE)
  const client = createSupabaseClient(
    supabaseUrl, 
    supabaseAnonKey,
    {
      auth: {
        flowType: 'implicit',
        detectSessionInUrl: true,
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
      }
    }
  )
  
  // Sync session to cookies after creation for server-side access
  if (typeof window !== 'undefined') {
    client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        syncSessionToCookies()
      }
    })
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Supabase client singleton created')
  }
  
  return client
}

/**
 * Returns the singleton Supabase client instance (creating it if needed).
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = initSupabaseClient()
  }
  return supabaseInstance
}

/**
 * Backwards-compatible export for existing imports.
 * Previously, calling createClient() always instantiated a new client.
 * Now it returns the shared singleton instance.
 */
export function createClient(): SupabaseClient {
  return getSupabaseClient()
}

/**
 * Named export for convenience when a constant is preferred.
 */
export const supabase = getSupabaseClient()

/**
 * Utility to reset the singleton (useful for tests/hard reloads).
 * Should not be called in production code.
 */
export function resetSupabaseClientInstance() {
  if (process.env.NODE_ENV === 'test') {
    supabaseInstance = null
  } else {
    console.warn('⚠️ resetSupabaseClientInstance should only be used in tests.')
  }
}
