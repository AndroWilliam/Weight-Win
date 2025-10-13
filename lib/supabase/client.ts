import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createClient() {
  // Use standard supabase-js for browser-based OAuth with PKCE localStorage
  // NOT @supabase/ssr which expects server-side cookie handling
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        debug: true, // Enable debug logs to see PKCE flow
      }
    }
  )
}
