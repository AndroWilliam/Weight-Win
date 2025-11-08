import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  console.log("[v0] Middleware hit for path:", request.nextUrl.pathname)

  // Skip all API routes entirely
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next({ request })
  }

  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Missing Supabase environment variables, allowing request to continue")
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    // Create client and check for session in custom cookies
    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)
    
    // Get access token from custom cookie (set by browser client after OAuth)
    const accessToken = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value
    
    let user = null
    
    // If we have tokens in cookies, set the session and get user
    if (accessToken && refreshToken) {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      
      const { data: { user: authUser } } = await supabase.auth.getUser()
      user = authUser
    }

    console.log("[v0] User authenticated:", !!user)
    console.log("[v0] Current path:", request.nextUrl.pathname)

    if (
      request.nextUrl.pathname !== "/" &&
      !user &&
      !request.nextUrl.pathname.startsWith("/login") &&
      !request.nextUrl.pathname.startsWith("/auth") &&
      !request.nextUrl.pathname.startsWith("/apply") &&
      !request.nextUrl.pathname.startsWith("/consent") &&
      !request.nextUrl.pathname.startsWith("/setup") &&
      !request.nextUrl.pathname.startsWith("/commit") &&
      !request.nextUrl.pathname.startsWith("/weight-check") &&
      !request.nextUrl.pathname.startsWith("/progress") &&
      !request.nextUrl.pathname.startsWith("/preview") &&
      !request.nextUrl.pathname.startsWith("/preview-signup") &&
      !request.nextUrl.pathname.startsWith("/preview-confirmation")
    ) {
      console.log("[v0] Redirecting to login - path is not root and user not authenticated")
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    console.log("[v0] No redirect - allowing request to continue")
    return supabaseResponse
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    // If there's an error with Supabase, allow the request to continue
    // This prevents the entire app from breaking due to middleware issues
    return NextResponse.next({
      request,
    })
  }
}
