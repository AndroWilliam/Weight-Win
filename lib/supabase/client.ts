import { createClient as createSupabaseClient } from "@supabase/supabase-js"

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

export function createClient() {
  // Use standard supabase-js for browser OAuth (supports implicit flow)
  // Google OAuth provider uses implicit flow (UUID codes, not PKCE)
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        syncSessionToCookies()
      }
    })
  }
  
  return client
}
