"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, Mail, Lock } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

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
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback?next=/consent`,
              },
            })

        if (error) throw error

        if (data.user && !data.user.email_confirmed_at) {
          setError("Please check your email for a confirmation link.")
            } else {
              router.push("/consent")
            }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

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
      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log("[v0] Redirect URL:", redirectUrl)

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/auth/callback?next=/consent`,
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
      <header className="px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-body">Back to home</span>
          </Link>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-120px)] w-full items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">W</span>
            </div>
            <h1 className="text-h1 text-neutral-900 mb-2">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-body text-neutral-700">
              {isSignUp 
                ? "Start your 7-day weight tracking challenge" 
                : "Sign in to continue your challenge"
              }
            </p>
          </div>

          <Card className="border-neutral-300">
            <CardContent className="p-8">
              <form onSubmit={handleEmailAuth} className="space-y-6">
                {error && (
                  <div className="p-4 text-sm text-danger-600 bg-danger-50 border border-danger-200 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-body font-medium text-neutral-900">
                      Email address
                    </Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 border-neutral-300 focus:border-primary-600 focus:ring-primary-600"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-body font-medium text-neutral-900">
                      Password
                    </Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 border-neutral-300 focus:border-primary-600 focus:ring-primary-600"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 text-body font-semibold rounded-lg"
                >
                  {isLoading ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-neutral-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full border-neutral-300 hover:bg-neutral-50 py-3 text-body font-medium rounded-lg"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>

                  {isDevelopment && (
                    <Button
                      onClick={handleDevLogin}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full border-neutral-300 hover:bg-neutral-50 py-3 text-body font-medium rounded-lg"
                    >
                      Skip Login (Dev Mode)
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-body text-neutral-700">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {isSignUp ? "Sign in" : "Sign up"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
