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

      <main className="px-4 py-4">
        <div className="mx-auto max-w-[1000px] px-0 sm:px-2 grid grid-cols-12 gap-4">
          <div className="col-span-12 text-center mb-1">
            <h1 className="text-2xl font-semibold text-neutral-900">Ready for today's weigh-in?</h1>
          </div>

          {/* Take Photo */}
          <section className="col-span-12 lg:col-span-6" aria-labelledby="take-photo-heading">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 pt-4 pb-3 text-center space-y-1">
                <h2 id="take-photo-heading" className="text-base font-semibold text-slate-900">Take today's photo</h2>
                <p className="text-xs text-slate-600">
                  Snap a photo of your scale to track day {currentDay}. Keep your streak going and help us calculate your reward.
                </p>
              </div>
              <button
                onClick={handleTakePhoto}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTakePhoto()}
                className="w-full aspect-[4/3] max-h-[300px] min-h-[220px] grid place-content-center bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-base font-semibold shadow-md transition-transform duration-300 hover:scale-[1.005] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-70"
                disabled={!canTrackToday || isCompleted}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">📷</span>
                  <span>Take Photo</span>
                  {!canTrackToday || isCompleted ? (
                    <span className="text-[11px] text-white/80">Challenge complete!</span>
                  ) : (
                    <span className="text-[11px] text-white/80">Tap to capture today's weigh-in</span>
                  )}
                </div>
              </button>
            </div>
          </section>

          {/* Progress under photo */}
          <section className="col-span-12 lg:col-span-6" aria-labelledby="progress-heading">
            <div className="rounded-xl border border-slate-200 bg-white p-4 h-[130px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 id="progress-heading" className="text-sm font-semibold text-slate-800">Your Progress</h3>
                <span className="text-xs text-slate-500">{Math.round((currentDay / 7) * 100)}% complete</span>
              </div>
              <div>
                <ul className="flex items-center gap-1.5 justify-center">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const day = i + 1
                    const done = day <= currentDay
                    return (
                      <li
                        key={day}
                        className={`h-5 w-5 grid place-content-center rounded-full text-[10px] font-medium ${done ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                        aria-label={`Day ${day} ${done ? 'completed' : 'pending'}`}
                      >
                        {day}
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
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

          {/* Reward */}
          <section className="col-span-12 lg:col-span-6" aria-labelledby="reward-heading">
            <RewardCountdown currentDay={currentDay} className="border border-slate-200 rounded-xl h-[210px]" />
          </section>

          {/* Daily Tips */}
          <section className="col-span-12 lg:col-span-6" aria-labelledby="tips-heading">
            <DailyTips className="border border-slate-200 rounded-xl h-[210px]" />
          </section>
        </div>
      </main>
    </div>
  )
}
