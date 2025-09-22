import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  console.log("[v0] Middleware hit for path:", request.nextUrl.pathname)

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
    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getUser() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const {
      data: { user },
    } = await supabase.auth.getUser()

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
      !request.nextUrl.pathname.startsWith("/progress")
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
