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
    async function loadChallengeProgress() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        // Get user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }
        
        // Get challenge progress from database
        const { data: progressResult, error } = await supabase
          .rpc('get_challenge_progress', { p_user_id: user.id })
        
        if (error || !progressResult) {
          console.error('Error loading challenge progress:', error)
          router.push('/commit')
          return
        }
        
        // The function returns a table, so get the first row
        const progress = Array.isArray(progressResult) ? progressResult[0] : progressResult
        
        // Update local storage and state
        const challengeData = {
          currentDay: progress.current_day,
          startDate: progress.challenge_start_date,
          completed: progress.challenge_status === 'completed',
          checkedInToday: progress.checked_in_today,
          completedDays: progress.completed_days || [],
          daysRemaining: progress.days_remaining,
          currentStreak: progress.current_streak,
          settings: JSON.parse(localStorage.getItem('userSettings') || '{}')
        }
        
        localStorage.setItem('challengeData', JSON.stringify(challengeData))
        setChallengeData(challengeData)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading challenge:', error)
        router.push('/commit')
      }
    }
    
    loadChallengeProgress()
  }, [router])

  const currentDay = challengeData?.currentDay || 1
  const isCompleted = challengeData?.completed || currentDay > 7
  const checkedInToday = challengeData?.checkedInToday || false
  const canTrackToday = currentDay <= 7 && !isCompleted
  const daysCompleted = challengeData?.completedDays?.length || 0
  const progressPercent = Math.min(100, Math.round((daysCompleted / 7) * 100))

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

                  <div className="text-center space-y-2 mb-8">
                    <h2 className="text-3xl font-semibold text-neutral-900">Day {Math.min(currentDay, 7)} of 7</h2>
                    <p className="text-neutral-600">
                      {checkedInToday 
                        ? "Come back tomorrow for your weigh-in 🔥🎉" 
                        : "Ready for today's weigh-in?"
                      }
                    </p>
                  </div>

          {/* Take Photo Card - Full Width at Top */}
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-8 shadow-sm" aria-labelledby="take-photo-heading">
            <div className="max-w-xl mx-auto text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-indigo-100 mx-auto flex items-center justify-center">
                <svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
                      <div className="space-y-2">
                        <h3 id="take-photo-heading" className="text-2xl font-semibold text-slate-900">
                          {checkedInToday ? "Today's check-in complete!" : "Take today's photo"}
                        </h3>
                        <p className="text-slate-600">
                          {checkedInToday 
                            ? `You've recorded your weight for day ${currentDay}. Come back tomorrow! 🎉`
                            : `Snap a photo of your scale to track day ${currentDay}`
                          }
                        </p>
                      </div>
                      <Button
                        onClick={handleTakePhoto}
                        loading={isNavigating}
                        disabled={!canTrackToday || isCompleted || checkedInToday}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCompleted ? 'Challenge complete!' : checkedInToday ? 'Already checked in ✓' : 'Take Photo'}
                      </Button>
            </div>
          </section>

          {/* Progress Card - Full Width */}
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm" aria-labelledby="progress-heading">
            <div className="text-center mb-8">
              <h3 id="progress-heading" className="text-2xl font-semibold text-slate-900">Your Progress</h3>
            </div>
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex justify-center">
                <StreakPills currentDay={currentDay} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Progress</span>
                  <span className="text-indigo-600 font-semibold">{progressPercent}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
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

                  {/* Bottom Cards - Reward and Daily Tips Side by Side */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Reward Card */}
                    <RewardCountdown 
                      currentDay={currentDay} 
                      daysRemaining={challengeData?.daysRemaining || 7} 
                      className="bg-gradient-to-br from-green-50 to-emerald-50" 
                    />

            {/* Daily Tips Card */}
            <DailyTips className="bg-gradient-to-br from-indigo-50 to-violet-50" />
          </div>
        </div>
      </main>
    </div>
  )
}
