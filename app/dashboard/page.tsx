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

      <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Ready for today's weigh-in?
            </h1>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Your Progress Card */}
            <Card className="border-neutral-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Your Progress</h3>
                <StreakPills currentDay={currentDay} className="mb-4" />
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentDay / 7) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-neutral-600 mt-2">
                  {Math.round((currentDay / 7) * 100)}% complete
                </p>
              </CardContent>
            </Card>

            {/* Your Reward Card */}
            <RewardCountdown currentDay={currentDay} />

            {/* Take Today's Photo Card */}
            <Card className="border-neutral-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Camera className="w-6 h-6 text-primary-600" />
                  <h3 className="text-lg font-semibold text-neutral-900">Take today's photo</h3>
                </div>
                <p className="text-neutral-700 mb-4">
                  Snap a photo of your scale to track day {currentDay}.
                </p>
                {canTrackToday && !isCompleted && (
                  <Button
                    onClick={handleTakePhoto}
                    loading={isNavigating}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 h-auto"
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Camera className="w-5 h-5" />
                      <span>Take Photo</span>
                    </div>
                  </Button>
                )}
                {isCompleted && (
                  <div className="text-center py-4">
                    <p className="text-success-600 font-medium">Challenge Complete!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Tips Card */}
            <DailyTips />
          </div>
        </div>
      </main>
    </div>
  )
}
