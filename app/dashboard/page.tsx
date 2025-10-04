"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StreakPills } from "@/components/streak-pills"
import { DailyTips } from "@/components/daily-tips"
import { RewardCountdown } from "@/components/reward-countdown"
import { Camera, Target, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface ChallengeData {
  currentDay: number
  startDate: string
  completed: boolean
  settings: any
}

export default function DashboardPage() {
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load challenge data from localStorage
    const savedChallenge = localStorage.getItem('challengeData')
    if (savedChallenge) {
      setChallengeData(JSON.parse(savedChallenge))
    } else {
      // If no challenge data, redirect to commit page
      router.push('/commit')
      return
    }
    setIsLoading(false)
  }, [router])

  const currentDay = challengeData?.currentDay || 1
  const isCompleted = currentDay > 7
  const canTrackToday = currentDay <= 7

  const handleTakePhoto = () => {
    setIsNavigating(true)
    router.push(`/weight-check?day=${currentDay}`)
  }

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem('challengeData')
    localStorage.removeItem('userSettings')
    localStorage.removeItem('userConsents')
    router.push('/auth/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your challenge...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-neutral-300">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900">WeightWin</h1>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-neutral-700 hover:text-neutral-900 font-medium"
            >
              Dashboard
            </button>
            <button 
              onClick={() => router.push('/progress')}
              className="text-neutral-700 hover:text-neutral-900 font-medium"
            >
              Progress
            </button>
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <button 
              onClick={handleSignOut}
              className="text-neutral-700 hover:text-neutral-900 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-neutral-900">Ready for today's weigh-in?</h1>
          </div>

          {/* Take Photo */}
          <section className="rounded-2xl border border-slate-200 bg-white p-0 overflow-hidden">
            <div className="p-6">
              <div className="mb-6 text-center space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">Take today's photo</h2>
                <p className="text-sm text-slate-600 max-w-xl mx-auto">
                  Snap a photo of your scale to track day {currentDay}. This keeps your streak alive
                  and helps us calculate your reward.
                </p>
              </div>
              <button
                onClick={handleTakePhoto}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTakePhoto()}
                className="w-full aspect-square rounded-2xl grid place-content-center bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                disabled={!canTrackToday || isCompleted}
              >
                <div className="flex flex-col items-center gap-3">
                  <span className="text-4xl">📷</span>
                  <span className="text-lg font-semibold">Take Photo</span>
                  {!canTrackToday || isCompleted ? (
                    <span className="text-xs text-white/80">Challenge complete!</span>
                  ) : (
                    <span className="text-xs text-white/80">Tap to capture today's weigh-in</span>
                  )}
                </div>
              </button>
            </div>
          </section>

          {/* Progress */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Your Progress</h3>
                <span className="text-sm text-slate-500">{Math.round((currentDay / 7) * 100)}% complete</span>
              </div>
              <div className="flex justify-center">
                <StreakPills currentDay={currentDay} />
              </div>
              <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-700 ease-out"
                  style={{ width: `${(currentDay / 7) * 100}%` }}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={(currentDay / 7) * 100}
                />
              </div>
            </div>
          </section>

          {/* Reward & Tips */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden aspect-square">
              <RewardCountdown currentDay={currentDay} className="h-full border-none" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden aspect-square">
              <DailyTips className="h-full border-none" />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
