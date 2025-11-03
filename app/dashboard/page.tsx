"use client"

import { Button } from "@/components/ui/button"
import { StreakPills } from "@/components/streak-pills"
import { DailyTips } from "@/components/daily-tips"
import { RewardCountdown } from "@/components/reward-countdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Camera, Home, Shield } from "lucide-react"
import { toast } from "sonner"

interface ChallengeData {
  currentDay: number
  startDate: string
  completed: boolean
  settings: any
  currentMilestone?: number
  totalDaysCompleted?: number
  nextMilestone?: number
  completedDaysArray?: number[]
  checkedInToday?: boolean
  daysRemaining?: number
  currentStreak?: number
}

export default function DashboardPage() {
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check for new badge notification from weight check
    const newBadgeData = localStorage.getItem('newBadgeEarned')
    if (newBadgeData) {
      try {
        const badgeInfo = JSON.parse(newBadgeData)
        toast.success('🎉 New Badge Unlocked!', {
          description: `You earned the ${badgeInfo.name} badge! ${badgeInfo.icon}`,
          duration: 5000,
        })
        localStorage.removeItem('newBadgeEarned')
      } catch (e) {
        console.error('Error parsing badge data:', e)
      }
    }

    // Check if user is admin
    async function checkAdminStatus() {
      try {
        const response = await fetch('/api/admin/check')
        const data = await response.json()
        setIsAdmin(data.isAdmin || false)
      } catch (error) {
        console.error('Failed to check admin status:', error)
        setIsAdmin(false)
      }
    }
    checkAdminStatus()
  }, [])

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
        
        // Check if user has completed setup
        const settingsResponse = await fetch('/api/settings/get')
        const settingsData = await settingsResponse.json()
        
        if (!settingsData.success || !settingsData.setupCompleted) {
          // User hasn't completed setup, redirect to setup flow
          router.push('/setup')
          return
        }
        
        // Get challenge progress from database
        const { data: progressResult, error } = await supabase
          .rpc('get_challenge_progress', { p_user_id: user.id })
        
        if (error) {
          console.error('Error loading challenge progress:', error)
          // If RPC fails, create default challenge data for Day 1
          const defaultChallengeData = {
            currentDay: 1,
            startDate: null,
            completed: false,
            checkedInToday: false,
            completedDays: [],
            daysRemaining: 7,
            currentStreak: 0,
            settings: settingsData.settings || {}
          }
          localStorage.setItem('challengeData', JSON.stringify(defaultChallengeData))
          setChallengeData(defaultChallengeData)
          setIsLoading(false)
          return
        }
        
        // The function returns a table, so get the first row
        const progress = Array.isArray(progressResult) ? progressResult[0] : progressResult
        
        // If status is 'not_started', they haven't started the challenge yet
        // But they have completed setup, so show the dashboard with Day 1 ready
        const challengeData = {
          currentDay: progress.current_day || 1,
          startDate: progress.challenge_start_date,
          completed: progress.challenge_status === 'completed',
          checkedInToday: progress.checked_in_today || false,
          completedDays: progress.completed_days || [],
          daysRemaining: progress.days_remaining || 7,
          currentStreak: progress.current_streak || 0,
          currentMilestone: progress.current_milestone || 7,
          totalDaysCompleted: progress.total_days_completed || 0,
          nextMilestone: progress.next_milestone || 7,
          completedDaysArray: progress.completed_days || [],
          settings: settingsData.settings || {}
        }
        
        localStorage.setItem('challengeData', JSON.stringify(challengeData))
        setChallengeData(challengeData)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading challenge:', error)
        // On unexpected error, show default Day 1 state instead of redirecting
        const defaultChallengeData = {
          currentDay: 1,
          startDate: null,
          completed: false,
          checkedInToday: false,
          completedDays: [],
          daysRemaining: 7,
          currentStreak: 0,
          settings: {}
        }
        setChallengeData(defaultChallengeData)
        setIsLoading(false)
      }
    }
    
    loadChallengeProgress()
  }, [router])

  const currentDay = challengeData?.currentDay || 1
  const currentMilestone = challengeData?.currentMilestone || 7
  const nextMilestone = challengeData?.nextMilestone || 7
  const totalDaysCompleted = challengeData?.totalDaysCompleted || 0
  const completedDaysArray = challengeData?.completedDaysArray || []
  const isCompleted = challengeData?.completed || currentDay >= 30
  const checkedInToday = challengeData?.checkedInToday || false
  const canTrackToday = currentDay <= 30 && !isCompleted
  const daysCompleted = completedDaysArray.length || 0
  const progressPercent = Math.min(100, Math.round((currentDay / currentMilestone) * 100))

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
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your challenge...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-3 sm:px-6 py-3 sm:py-4 border-b border-border">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <h1 className="text-base sm:text-xl font-bold text-foreground">WeightWin</h1>
          </div>

          {/* Mobile Admin Button (visible on mobile only) */}
          {isAdmin && (
            <button
              onClick={() => router.push('/admin/users')}
              className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-indigo-500 rounded-lg text-zinc-300 hover:text-white transition-all text-sm"
              aria-label="Go to Admin Dashboard"
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-2 sm:gap-4 text-sm font-medium text-muted-foreground">
            <ThemeToggle />
            <button onClick={() => router.push('/dashboard')} className="hover:text-foreground">Dashboard</button>
            <button onClick={() => router.push('/progress')} className="hover:text-foreground">Progress</button>
            {isAdmin && (
              <button
                onClick={() => router.push('/admin/users')}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-indigo-500 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 relative overflow-hidden group"
                aria-label="Go to Admin Dashboard"
              >
                <span className="absolute inset-0 bg-indigo-500/30 scale-0 group-active:scale-100 rounded-full transition-transform duration-400" />
                <Shield className="w-4 h-4 relative z-10" />
                <span className="relative z-10 hidden lg:inline">Admin Dashboard</span>
                <span className="relative z-10 lg:hidden">Admin</span>
              </button>
            )}
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">A</div>
            <button onClick={handleSignOut} className="hover:text-foreground">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-6 py-5 sm:py-8">
        <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
          {/* Home breadcrumb */}
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
            aria-label="Go to home page"
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            <span className="group-hover:underline">Home</span>
          </button>

          <div className="text-center space-y-1.5 mb-5 sm:mb-8">
            <h2 className="text-xl sm:text-3xl font-semibold text-foreground">
              Day {currentDay} of {currentMilestone}
            </h2>
            <p className="text-[13px] sm:text-base text-muted-foreground">
              {checkedInToday 
                ? "Come back tomorrow for your weigh-in 🔥🎉" 
                : "Ready for today's weigh-in?"
              }
            </p>
            {nextMilestone > currentMilestone && (
              <p className="text-[12px] text-primary font-medium">
                {nextMilestone - currentDay} days until next milestone! 🎯
              </p>
            )}
          </div>

          {/* Take Photo Card - Full Width at Top */}
          <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-5 sm:p-8 shadow-sm" aria-labelledby="take-photo-heading">
            <div className="max-w-xl mx-auto text-center space-y-3 sm:space-y-4">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                <Camera className="w-7 h-7 sm:w-10 sm:h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 id="take-photo-heading" className="text-lg sm:text-2xl font-semibold text-foreground">
                  {checkedInToday ? "Today's check-in complete!" : "Take today's photo"}
                </h3>
                <p className="text-[13px] sm:text-base text-muted-foreground">
                  {checkedInToday 
                    ? `You've recorded your weight for day ${currentDay}. Come back tomorrow! 🎉`
                    : `Snap a photo of your scale to track day ${currentDay}`
                  }
                </p>
              </div>
              <Button
                onClick={handleTakePhoto}
                disabled={!canTrackToday || isCompleted || checkedInToday}
                className="bg-primary hover:bg-primary/90 text-white px-5 sm:px-8 py-3 rounded-lg text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isCompleted ? 'Challenge complete!' : checkedInToday ? 'Already checked in ✓' : 'Take Photo'}
              </Button>
            </div>
          </section>

          {/* Progress Card - Full Width */}
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-sm" aria-labelledby="progress-heading">
            <div className="text-center mb-5 sm:mb-8">
              <h3 id="progress-heading" className="text-lg sm:text-2xl font-semibold text-card-foreground">Your Progress</h3>
            </div>
            <div className="max-w-2xl mx-auto space-y-3 sm:space-y-6">
              <div className="flex justify-center">
                <StreakPills 
                  currentDay={currentDay} 
                  currentMilestone={currentMilestone}
                  completedDaysArray={completedDaysArray}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[13px] sm:text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span className="text-primary font-semibold">{progressPercent}%</span>
                </div>
                {/* Responsive progress bar height */}
                <div className="h-2 md:h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-[width] duration-700"
                    style={{ width: `${progressPercent}%` }}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progressPercent}
                  />
                </div>
                
                {/* Milestone Indicators */}
                <div className="flex items-center justify-between pt-2 text-[11px] sm:text-xs">
                  <div className={`flex items-center gap-1 ${currentDay >= 7 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {currentDay >= 7 ? '✓' : '○'} 7 days
                  </div>
                  <div className={`flex items-center gap-1 ${currentDay >= 14 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {currentDay >= 14 ? '✓' : '○'} 14 days
                  </div>
                  <div className={`flex items-center gap-1 ${currentDay >= 21 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {currentDay >= 21 ? '✓' : '○'} 21 days
                  </div>
                  <div className={`flex items-center gap-1 ${currentDay >= 30 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {currentDay >= 30 ? '✓' : '○'} 30 days
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Cards - Reward and Daily Tips Side by Side */}
          <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
            {/* Reward Card */}
            <RewardCountdown 
              currentDay={currentDay} 
              daysRemaining={challengeData?.daysRemaining || 7}
              currentMilestone={currentMilestone}
              nextMilestone={nextMilestone}
              className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" 
            />

            {/* Daily Tips Card */}
            <DailyTips className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20" />
          </div>
        </div>
      </main>
    </div>
  )
}
