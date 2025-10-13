import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Use @supabase/ssr browser client which handles both localStorage AND cookies
  // This ensures sessions work on both client and server (SSR/API routes)
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
