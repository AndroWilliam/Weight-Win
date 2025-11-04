"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trophy, Award, Star, Crown, Lock, TrendingUp, Flame, AlertTriangle, RefreshCw, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@/components/ErrorBoundary"

interface Badge {
  badge_id: string
  milestone_day: number
  badge_name: string
  badge_description: string
  badge_icon: string
  earned: boolean
  earned_at: string | null
}

interface BadgesData {
  badges: Badge[]
  total_earned: number
}

interface ProgressData {
  current_day: number
  current_streak: number
  total_days_completed: number
  next_milestone: number
  days_to_next_milestone: number
}

export default function RewardsPage() {
  const router = useRouter()
  const [badgesData, setBadgesData] = useState<BadgesData | null>(null)
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBadges()
  }, [])

  async function loadBadges() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/badges')

      if (!response.ok) {
        throw new Error(`Failed to load badges: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setBadgesData(data.badges)
        setProgressData(data.progress)
      } else {
        throw new Error(data.error || 'Failed to load badges')
      }
    } catch (err) {
      console.error('Error loading badges:', err)
      setError(err instanceof Error ? err.message : 'Failed to load badges')
    } finally {
      setIsLoading(false)
    }
  }

  const getBadgeIcon = (milestone: number) => {
    switch (milestone) {
      case 7:
        return Trophy
      case 14:
        return Award
      case 21:
        return Star
      case 30:
        return Crown
      default:
        return Trophy
    }
  }

  const badges = badgesData?.badges || []
  const totalEarned = badgesData?.total_earned || 0
  const progress = progressData

  return (
    <ErrorBoundary>
      {isLoading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading your badges...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Failed to Load Badges</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {error}
              </p>
            </div>

            <button
              onClick={loadBadges}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      ) : (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Button>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Your Achievements</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          {/* Stats Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{totalEarned}</p>
              <p className="text-xs text-muted-foreground">Badges Earned</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{progress?.total_days_completed || 0}</p>
              <p className="text-xs text-muted-foreground">Days Tracked</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{progress?.current_streak || 0}</p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{progress?.days_to_next_milestone || 0}</p>
              <p className="text-xs text-muted-foreground">Days to Next</p>
            </motion.div>
          </div>

          {/* Badge Gallery */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Milestone Badges</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {badges.map((badge, index) => {
                const BadgeIcon = getBadgeIcon(badge.milestone_day)
                const isEarned = badge.earned

                return (
                  <motion.div
                    key={badge.badge_id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-card border border-border rounded-2xl p-6 text-center transition-all duration-300 ${
                      isEarned 
                        ? 'shadow-lg hover:shadow-xl' 
                        : 'opacity-60 grayscale'
                    }`}
                  >
                    {/* Badge Icon */}
                    <div className={`relative mx-auto mb-4 w-24 h-24 rounded-full flex items-center justify-center ${
                      isEarned 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                        : 'bg-muted'
                    }`}>
                      {isEarned ? (
                        <>
                          <span className="text-5xl">{badge.badge_icon}</span>
                          <motion.div
                            className="absolute inset-0 rounded-full bg-yellow-400"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeOut"
                            }}
                          />
                        </>
                      ) : (
                        <Lock className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>

                    {/* Badge Info */}
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {badge.badge_name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {badge.badge_description}
                    </p>

                    {/* Milestone Day */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      isEarned 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <BadgeIcon className="w-4 h-4" />
                      {badge.milestone_day} Days
                    </div>

                    {/* Earned Date */}
                    {isEarned && badge.earned_at && (
                      <p className="mt-4 text-xs text-muted-foreground">
                        Earned on {new Date(badge.earned_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}

                    {/* Locked Overlay */}
                    {!isEarned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-2xl">
                        <div className="text-center">
                          <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs font-medium text-muted-foreground">
                            {progress && progress.total_days_completed < badge.milestone_day
                              ? `${badge.milestone_day - progress.total_days_completed} days to unlock`
                              : 'Keep tracking to unlock'
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Milestone Journey</h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-muted" />
              <div 
                className="absolute top-8 left-0 h-1 bg-primary transition-all duration-1000"
                style={{ 
                  width: `${Math.min(100, ((progress?.total_days_completed || 0) / 30) * 100)}%` 
                }}
              />

              {/* Timeline Milestones */}
              <div className="relative flex justify-between">
                {[7, 14, 21, 30].map((milestone, index) => {
                  const isReached = (progress?.total_days_completed || 0) >= milestone
                  const BadgeIcon = getBadgeIcon(milestone)

                  return (
                    <div key={milestone} className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.2 }}
                        className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-background z-10 ${
                          isReached 
                            ? 'bg-primary text-white' 
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <BadgeIcon className="w-8 h-8" />
                      </motion.div>
                      <p className={`mt-4 text-sm font-semibold ${
                        isReached ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        Day {milestone}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Motivational Section */}
          {totalEarned < 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center"
            >
              <h3 className="text-xl font-bold text-foreground mb-2">
                Keep Going! 🚀
              </h3>
              <p className="text-muted-foreground">
                You're on your way to earning all milestone badges. Stay consistent and track your progress daily!
              </p>
            </motion.div>
          )}

          {totalEarned === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6 sm:p-8 text-center"
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">
                🎉 Congratulations, Champion! 🎉
              </h3>
              <p className="text-muted-foreground">
                You've earned all milestone badges! You've demonstrated incredible consistency and dedication. Keep up the amazing work!
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
      )}
    </ErrorBoundary>
  )
}

