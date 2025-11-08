"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getPreviewData } from "@/lib/preview/previewCookies"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"init" | "exchanging" | "success" | "error">("init")
  const [message, setMessage] = useState<string>("")

  const { code, next, err, errCode, errDesc, hasHashToken } = useMemo(() => {
    if (typeof window === "undefined") return { 
      code: null as string | null, 
      next: "/setup",
      hasHashToken: false 
    }
    const url = new URL(window.location.href)
    
    // Check if we have implicit flow tokens in hash (access_token, refresh_token)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const hasHashToken = hashParams.has('access_token')
    
    return {
      code: url.searchParams.get("code"),
      next: url.searchParams.get("next") || "/setup",
      err: url.searchParams.get("error"),
      errCode: url.searchParams.get("error_code"),
      errDesc: url.searchParams.get("error_description"),
      hasHashToken
    }
  }, [])

  useEffect(() => {
    async function run() {
      // Handle implicit flow (tokens in URL hash)
      if (hasHashToken) {
        console.log('[Auth Debug] Implicit flow detected - tokens in URL hash')
        setStatus("exchanging")
        const supabase = createClient()
        
        try {
          // Supabase client automatically detects and processes hash tokens
          // when detectSessionInUrl is true
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error || !session) {
            console.error('[Auth Debug] Failed to get session from hash:', error)
            setStatus("error")
            setMessage(error?.message || "Failed to create session from tokens.")
            return
          }
          
        console.log('[Auth Debug] ✓ Session created from implicit flow hash tokens')
        setStatus("success")
        
        // Check if user is new or existing by checking settings
        try {
          const settingsResponse = await fetch('/api/settings/get')
          
          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json()
            
            // Existing user with completed setup -> go to dashboard
            if (settingsData.success && settingsData.setupCompleted) {
              console.log('[Auth Debug] Existing user detected - redirecting to dashboard')
              setTimeout(() => router.replace('/dashboard'), 200)
              return
            }
          }
          
          // New user or setup not completed -> check preview data first
          console.log('[Auth Debug] New user detected - checking for preview data')
          
          // Check if we have preview data to transfer
          const previewData = getPreviewData()
          if (previewData && previewData.tourCompleted) {
            console.log('[Auth Debug] Found preview data - redirecting to confirmation')
            setTimeout(() => router.replace('/preview-confirmation'), 200)
            return
          }
          
          // No preview data -> start normal onboarding flow
          console.log('[Auth Debug] No preview data - starting onboarding flow')
          let dest = next || "/consent"
          try {
            const stored = localStorage.getItem("postAuthNext")
            if (!next && stored) dest = stored
            localStorage.removeItem("postAuthNext")
          } catch {}
          
          setTimeout(() => router.replace(dest), 200)
        } catch (error) {
          console.error('[Auth Debug] Error checking user status:', error)
          // On error, default to consent page (safer for new users)
          setTimeout(() => router.replace("/consent"), 200)
        }
        return
        } catch (err: any) {
          setStatus("error")
          setMessage(err?.message || "Unexpected error processing tokens.")
          return
        }
      }
      
      // Handle code exchange flow (if code exists in query params)
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
        
        console.log('[Auth Debug] Code exchange flow')
        console.log('[Auth Debug] Code format:', code?.substring(0, 20) + '...')
        
        const { data, error } = await supabase.auth.exchangeCodeForSession(code as string)

        if (error || !data?.session) {
          setStatus("error")
          console.error('[Auth Debug] Exchange failed:', error)
          console.error('[Auth Debug] Error details:', JSON.stringify(error, null, 2))
          setMessage(error?.message || "Failed to create session.")
          return
        }
        
        console.log('[Auth Debug] ✓ Session created from code exchange')

        setStatus("success")
        
        // Check if user is new or existing by checking settings
        try {
          const settingsResponse = await fetch('/api/settings/get')
          
          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json()
            
            // Existing user with completed setup -> go to dashboard
            if (settingsData.success && settingsData.setupCompleted) {
              console.log('[Auth Debug] Existing user detected - redirecting to dashboard')
              setTimeout(() => router.replace('/dashboard'), 200)
              return
            }
          }
          
          // New user or setup not completed -> check preview data first
          console.log('[Auth Debug] New user detected - checking for preview data')
          
          // Check if we have preview data to transfer
          const previewData = getPreviewData()
          if (previewData && previewData.tourCompleted) {
            console.log('[Auth Debug] Found preview data - redirecting to confirmation')
            setTimeout(() => router.replace('/preview-confirmation'), 200)
            return
          }
          
          // No preview data -> start normal onboarding flow
          console.log('[Auth Debug] No preview data - starting onboarding flow')
          let dest = next || "/consent"
          try {
            const stored = localStorage.getItem("postAuthNext")
            if (!next && stored) dest = stored
            localStorage.removeItem("postAuthNext")
          } catch {}
          
          setTimeout(() => router.replace(dest), 200)
        } catch (error) {
          console.error('[Auth Debug] Error checking user status:', error)
          // On error, default to consent page (safer for new users)
          setTimeout(() => router.replace("/consent"), 200)
        }
      } catch (err: any) {
        setStatus("error")
        setMessage(err?.message || "Unexpected error.")
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, hasHashToken])

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


