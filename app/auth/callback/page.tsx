"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"init" | "exchanging" | "success" | "error">("init")
  const [message, setMessage] = useState<string>("")

  const { code, next, err, errCode, errDesc } = useMemo(() => {
    if (typeof window === "undefined") return { code: null as string | null, next: "/setup" }
    const url = new URL(window.location.href)
    return {
      code: url.searchParams.get("code"),
      next: url.searchParams.get("next") || "/setup",
      err: url.searchParams.get("error"),
      errCode: url.searchParams.get("error_code"),
      errDesc: url.searchParams.get("error_description"),
    }
  }, [])

  useEffect(() => {
    async function run() {
      if (!code) {
        // If provider returned an error, show it
        if (err || errCode) {
          setStatus("error")
          setMessage(errDesc || "Authentication was cancelled or failed.")
          return
        }
        setStatus("error")
        setMessage("Missing authorization code in callback URL.")
        return
      }

      try {
        setStatus("exchanging")
        const supabase = createClient()
        
        // Debug: Check all localStorage keys related to Supabase auth
        if (typeof window !== 'undefined') {
          console.log('[Auth Debug] All localStorage keys:', Object.keys(localStorage))
          const allSupabaseKeys = Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('sb-'))
          console.log('[Auth Debug] Supabase-related keys:', allSupabaseKeys)
          allSupabaseKeys.forEach(key => {
            const value = localStorage.getItem(key)
            console.log(`[Auth Debug] ${key}:`, value ? value.substring(0, 50) + '...' : 'null')
          })
        }
        
        // Exchange code for session with explicit error handling
        console.log('[Auth Debug] Calling exchangeCodeForSession with code:', code?.substring(0, 20) + '...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code as string)

        if (error || !data?.session) {
          setStatus("error")
          console.error('[Auth Debug] Exchange failed:', error)
          console.error('[Auth Debug] Error details:', JSON.stringify(error, null, 2))
          setMessage(error?.message || "Failed to create session.")
          return
        }
        
        console.log('[Auth Debug] Exchange successful! Session created.')

        setStatus("success")
        // Determine post-auth destination: URL param > localStorage > /consent
        let dest = next || "/consent"
        try {
          const stored = localStorage.getItem("postAuthNext")
          if (!next && stored) dest = stored
          localStorage.removeItem("postAuthNext")
        } catch {}
        // Small timeout for visual feedback on mobile
        setTimeout(() => router.replace(dest), 200)
      } catch (err: any) {
        setStatus("error")
        setMessage(err?.message || "Unexpected error.")
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full rounded-xl border border-border bg-card p-6 text-center space-y-3">
        <h1 className="text-lg font-semibold text-foreground">Signing you in…</h1>
        {status === "exchanging" && (
          <p className="text-sm text-muted-foreground">Creating your session, please wait.</p>
        )}
        {status === "success" && (
          <p className="text-sm text-muted-foreground">Success! Redirecting…</p>
        )}
        {status === "error" && (
          <div className="space-y-2">
            <p className="text-sm text-destructive">{message}</p>
            <button
              onClick={() => router.replace("/auth/login")}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              Go to Sign in
            </button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">You can close this tab if nothing happens.</p>
      </div>
    </div>
  )
}


