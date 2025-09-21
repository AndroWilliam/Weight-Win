import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  console.log("[v0] Auth callback route hit")

  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/consent"

    console.log("[v0] Callback params:", { code: code ? "present" : "missing", next, origin })

    if (!code) {
      console.log("[v0] No code parameter found, redirecting to error page")
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    console.log("[v0] Creating Supabase client...")
    const supabase = await createClient()

    console.log("[v0] Exchanging code for session...")
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] Error exchanging code for session:", error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
    }

    if (!data.session) {
      console.error("[v0] No session returned after code exchange")
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_session`)
    }

    console.log("[v0] Authentication successful, user:", data.user?.email)

    // Get the correct base URL for redirects
    const forwardedHost = request.headers.get("x-forwarded-host")
    const forwardedProto = request.headers.get("x-forwarded-proto")
    const isLocalEnv = process.env.NODE_ENV === "development"

    let redirectUrl: string
    if (isLocalEnv) {
      // In development, use localhost
      redirectUrl = `${origin}${next}`
    } else if (forwardedHost) {
      // In production with Vercel, use the forwarded host
      const protocol = forwardedProto || "https"
      redirectUrl = `${protocol}://${forwardedHost}${next}`
    } else {
      // Fallback: try to construct from origin but ensure it's not localhost
      const url = new URL(origin)
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        // If somehow we're getting localhost in production, use environment variable
        const vercelUrl = process.env.VERCEL_URL
        if (vercelUrl) {
          redirectUrl = `https://${vercelUrl}${next}`
        } else {
          // Last resort: use the request origin but log a warning
          console.warn("[v0] Using localhost origin in production, this may cause issues")
          redirectUrl = `${origin}${next}`
        }
      } else {
        redirectUrl = `${origin}${next}`
      }
    }

    console.log("[v0] Redirecting to:", redirectUrl)
    console.log("[v0] Environment check:", { isLocalEnv, forwardedHost, forwardedProto, origin })
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("[v0] Unexpected error in auth callback:", error)
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=server_error`)
  }
}
