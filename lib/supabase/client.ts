import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createClient() {
  // Use standard supabase-js for browser-based OAuth
  // Google OAuth provider in Supabase is configured for implicit flow (not PKCE)
  // as evidenced by UUID-format codes (9f5572fc...) instead of base64 PKCE codes
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'implicit', // Match Supabase's Google OAuth configuration
        detectSessionInUrl: true,
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        debug: true,
      }
    }
  )
}
