"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { ArrowLeft, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { EnvDebug } from "@/components/env-debug"
import { getPreviewData } from "@/lib/preview/previewCookies"

function LoginPageContent() {
  // Debug environment variables
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set')
  console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set')
  
  // Check if Supabase is available - be more lenient
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // If we have the environment variables, show the normal login
  if (supabaseUrl && supabaseKey) {
    console.log('Supabase is available, showing normal login')
  } else {
    console.log('Supabase not available, showing demo mode')
    // Use fallback login page when Supabase is not available
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="px-4 py-6">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-body">Back to home</span>
            </Link>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-120px)] w-full items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-white font-bold text-lg sm:text-2xl">W</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">Welcome to WeightWin</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Start your 7-day weight tracking challenge
            </p>
          </div>

            <Card className="border-border">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-lg sm:text-2xl">🚀</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Demo Mode</h2>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    Supabase authentication is not configured. You can still explore the app in demo mode.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/consent'}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-sm sm:text-base font-medium rounded-lg"
                  >
                    Continue to Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if coming from preview
  const fromPreview = searchParams.get('from') === 'preview'

  const isDevelopment =
    typeof window !== "undefined" &&
    (window.location.hostname.includes("vusercontent.net") || window.location.hostname === "localhost")

  useEffect(() => {
    console.log("[v0] Login page URL:", window.location.href)
    console.log("[v0] OAuth callback URL will be:", `${window.location.origin}/auth/callback`)
    console.log("[v0] Development mode:", isDevelopment)
  }, [isDevelopment])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (isSignUp) {
            // Get the correct redirect URL based on environment
            const isProduction = process.env.NODE_ENV === "production"
            const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
            
            let redirectUrl: string
            if (isProduction && isVercel) {
              redirectUrl = `${window.location.origin}/auth/callback`
            } else if (isProduction) {
              redirectUrl = `${window.location.origin}/auth/callback`
            } else {
              redirectUrl = `${window.location.origin}/auth/callback`
            }
            
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: redirectUrl,
              },
            })

        if (error) throw error

        if (data.user && !data.user.email_confirmed_at) {
          setError("Please check your email for a confirmation link.")
            } else {
              // Check if we have preview data to transfer
              if (fromPreview) {
                const previewData = getPreviewData()
                if (previewData && !previewData.tourCompleted) {
                  router.push('/preview-confirmation')
                  return
                }
              }
              router.push("/consent")
            }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        // Check if we have preview data to transfer
        if (fromPreview) {
          const previewData = getPreviewData()
          if (previewData && previewData.tourCompleted) {
            router.push('/preview-confirmation')
            return
          }
        }
        router.push("/consent")
      }
    } catch (error: unknown) {
      console.error("[v0] Auth error:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unexpected error occurred during authentication")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Starting Google OAuth login")
      
      // Get the correct redirect URL based on environment
      const isProduction = process.env.NODE_ENV === "production"
      const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
      
      let redirectUrl: string
      if (isProduction && isVercel) {
        // In production on Vercel, use the current domain
        redirectUrl = `${window.location.origin}/auth/callback`
      } else if (isProduction) {
        // In production but not Vercel, still use current domain
        redirectUrl = `${window.location.origin}/auth/callback`
      } else {
        // In development, use localhost
        redirectUrl = `${window.location.origin}/auth/callback`
      }
      
      console.log("[v0] Redirect URL:", redirectUrl)
      console.log("[v0] Environment:", { isProduction, isVercel, hostname: window.location.hostname })

      // Persist intended next so callback page can use it if provider strips query params
      try { localStorage.setItem('postAuthNext', '/consent') } catch {}

      console.log('[Auth Debug] Starting OAuth with standard supabase-js (PKCE in localStorage)')
      console.log('[Auth Debug] LocalStorage available:', !!window.localStorage)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
          }
        },
      })

      console.log("[v0] OAuth response:", { data, error })
      
      if (error) {
        console.error("[v0] OAuth error:", error)
        throw error
      }
    } catch (error: unknown) {
      console.error("[v0] Login error:", error)
      if (error instanceof Error) {
        setError(`Authentication failed: ${error.message}`)
      } else {
        setError("An unexpected error occurred during authentication")
      }
      setIsLoading(false)
    }
  }

  const handleDevLogin = async () => {
    setIsLoading(true)
    console.log("[v0] Using development bypass - creating mock session")

    // Simulate loading time
    await new Promise((resolve) => setTimeout(resolve, 1000))

        // Redirect to consent
        router.push("/consent")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm sm:text-base">Back to home</span>
          </Link>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-120px)] w-full items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-white font-bold text-lg sm:text-2xl">W</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {isSignUp 
                ? "Start your 7-day weight tracking challenge" 
                : "Sign in to continue your challenge"
              }
            </p>
          </div>

          <Card className="border-neutral-300">
            <CardContent className="p-8">
              <form onSubmit={handleEmailAuth} className="space-y-4 sm:space-y-6">
                {error && (
                  <div className="p-3 sm:p-4 text-xs sm:text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm sm:text-base font-medium text-foreground">
                      Email address
                    </Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 border-border focus:border-primary focus:ring-primary"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm sm:text-base font-medium text-foreground">
                      Password
                    </Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 border-border focus:border-primary focus:ring-primary"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-sm sm:text-base font-medium rounded-lg disabled:opacity-50"
                >
                  {isSignUp ? "Create Account" : "Sign In"}
                </Button>
              </form>

              <div className="mt-4 sm:mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  <Button
                    onClick={handleGoogleLogin}
                    loading={isLoading}
                    variant="outline"
                    className="w-full border-border hover:bg-muted py-3 sm:py-4 text-sm sm:text-base font-medium rounded-lg h-auto disabled:opacity-50"
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </div>
                  </Button>

                  {isDevelopment && (
                    <Button
                      onClick={handleDevLogin}
                      loading={isLoading}
                      variant="outline"
                      className="w-full border-border hover:bg-muted py-3 text-sm sm:text-base font-medium rounded-lg disabled:opacity-50"
                    >
                      Skip Login (Dev Mode)
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-sm sm:text-base text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    {isSignUp ? "Sign in" : "Sign up"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <EnvDebug />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">W</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
