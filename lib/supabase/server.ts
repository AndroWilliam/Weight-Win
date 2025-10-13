import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

/**
 * Server-side Supabase client that reads session from custom cookies
 * (synced by the browser client after OAuth)
 */
export async function createClient() {
  const cookieStore = await cookies()
  
  // Get access token from custom cookie (set by browser client)
  const accessToken = cookieStore.get('sb-access-token')?.value
  const refreshToken = cookieStore.get('sb-refresh-token')?.value
  
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // If we have tokens in cookies, set the session manually
  if (accessToken && refreshToken) {
    await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })
  }
  
  return client
}
