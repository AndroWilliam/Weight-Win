"use client"

import { Button } from "@/components/ui/button"
import { StreakPills } from "@/components/streak-pills"
import { DailyTips } from "@/components/daily-tips"
import { RewardCountdown } from "@/components/reward-countdown"
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
    const savedChallenge = localStorage.getItem('challengeData')
    if (savedChallenge) {
      setChallengeData(JSON.parse(savedChallenge))
    } else {
      router.push('/commit')
      return
    }
    setIsLoading(false)
  }, [router])

  const currentDay = challengeData?.currentDay || 1
  const isCompleted = currentDay > 7
  const canTrackToday = currentDay <= 7
  const progressPercent = Math.min(100, Math.round((currentDay / 7) * 100))

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
      <header className="px-6 py-4 border-b border-neutral-200">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900">WeightWin</h1>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-neutral-700">
            <button onClick={() => router.push('/dashboard')} className="hover:text-neutral-900">Dashboard</button>
            <button onClick={() => router.push('/progress')} className="hover:text-neutral-900">Progress</button>
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white">A</div>
            <button onClick={handleSignOut} className="hover:text-neutral-900">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Home breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span className="text-lg">🏠</span>
            <span>Home</span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold text-neutral-900">Day {Math.min(currentDay, 7)} of 7</h2>
            <p className="text-neutral-600">Ready for today's weigh-in?</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Progress Card */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="progress-heading">
              <div className="flex items-center justify-between mb-6">
                <h3 id="progress-heading" className="text-lg font-semibold text-slate-900">Your Progress</h3>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between">
                  <StreakPills currentDay={currentDay} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Progress</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-[width] duration-700"
                      style={{ width: `${progressPercent}%` }}
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progressPercent}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Reward Card - smaller square */}
            <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm h-[240px] flex flex-col" aria-labelledby="reward-heading">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎁</span>
                <h3 id="reward-heading" className="text-lg font-semibold text-slate-900">Your Reward</h3>
              </div>
              <p className="text-sm text-slate-700 flex-1">
                Complete {Math.max(0, 7 - currentDay)} more day{Math.max(0, 7 - currentDay) !== 1 ? 's' : ''} to unlock your free 30-minute session with a certified nutritionist.
              </p>
            </section>

            {/* Take Photo Card */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="take-photo-heading">
              <div className="space-y-4">
                <div className="space-y-2 text-center">
                  <h3 id="take-photo-heading" className="text-lg font-semibold text-slate-900">Take today's photo</h3>
                  <p className="text-sm text-slate-600">
                    Snap a photo of your scale to track day {currentDay}. Keep your streak going for that free nutritionist session.
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-center text-white space-y-3 shadow-inner">
                  <div className="w-14 h-14 rounded-full bg-white/15 mx-auto flex items-center justify-center text-xl">📷</div>
                  <div className="text-sm opacity-90">Tap to capture today's weigh-in</div>
                  <Button
                    onClick={handleTakePhoto}
                    loading={isNavigating}
                    disabled={!canTrackToday || isCompleted}
                    className="bg-white text-indigo-600 hover:bg-slate-100 border-none"
                  >
                    {isCompleted ? 'Challenge complete!' : 'Take Photo'}
                  </Button>
                </div>
              </div>
            </section>

            {/* Daily Tips Card - smaller square with green background */}
            <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 shadow-sm h-[240px] flex flex-col" aria-labelledby="tips-heading">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📖</span>
                <h3 id="tips-heading" className="text-lg font-semibold text-slate-900">Daily Tips</h3>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="mb-2">
                  <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                    Lifestyle
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 text-sm mb-2">Consistent sleep schedule</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Go to bed and wake up at the same time every day, even on weekends. This regulates your body clock.
                </p>
              </div>
              <div className="mt-3 text-xs text-slate-500">1 min read</div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
