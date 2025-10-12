"use client"

import { useState, useEffect } from "react"
import { Clock, Trophy, Award, Star, Crown } from "lucide-react"

interface RewardCountdownProps {
  currentDay: number
  className?: string
  daysRemaining?: number
  currentMilestone?: number
  nextMilestone?: number
}

export function RewardCountdown({ 
  currentDay, 
  className, 
  daysRemaining: propsDaysRemaining,
  currentMilestone = 7,
  nextMilestone = 7
}: RewardCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const isCompleted = currentDay >= 30
  const calculatedDaysRemaining = Math.max(0, currentMilestone - currentDay)
  
  // Use daysRemaining from props if provided, otherwise calculate
  const actualDaysRemaining = propsDaysRemaining ?? calculatedDaysRemaining
  
  // Get badge info based on next milestone
  const getBadgeInfo = (milestone: number) => {
    switch (milestone) {
      case 7:
        return { name: "Week Warrior", icon: Trophy, emoji: "🏆" }
      case 14:
        return { name: "Fortnight Champion", icon: Award, emoji: "🥇" }
      case 21:
        return { name: "Triple Week Legend", icon: Star, emoji: "⭐" }
      case 30:
        return { name: "Monthly Master", icon: Crown, emoji: "👑" }
      default:
        return { name: "Badge", icon: Trophy, emoji: "🎁" }
    }
  }
  
  const badgeInfo = getBadgeInfo(nextMilestone)

  useEffect(() => {
    if (isCompleted) return

    // Calculate target date (7 days from start)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (currentDay - 1)) // Adjust for current day
    const targetDate = new Date(startDate)
    targetDate.setDate(targetDate.getDate() + 7)

    const updateCountdown = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [currentDay, isCompleted])

  if (isCompleted) {
    return (
      <section className={`rounded-2xl border border-border shadow-sm p-8 flex flex-col justify-center ${className}`} aria-labelledby="reward-heading">
        <div className="text-center space-y-4">
          <span className="text-4xl">👑</span>
          <h3 id="reward-heading" className="text-2xl font-semibold text-foreground">All Milestones Complete!</h3>
          <p className="text-muted-foreground">
            Congratulations! You've completed 30 days and earned all milestone badges! Check your Rewards page to see your achievements.
          </p>
        </div>
      </section>
    )
  }

  const BadgeIcon = badgeInfo.icon

  return (
    <section className={`rounded-2xl border border-border shadow-sm p-6 sm:p-8 flex flex-col justify-center ${className}`} aria-labelledby="reward-heading">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <span className="text-4xl sm:text-5xl">{badgeInfo.emoji}</span>
            {actualDaysRemaining <= 3 && actualDaysRemaining > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
        </div>
        <h3 id="reward-heading" className="text-xl sm:text-2xl font-semibold text-foreground">
          Next Milestone
        </h3>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <BadgeIcon className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">{badgeInfo.name}</span>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            {actualDaysRemaining > 0 
              ? `Only ${actualDaysRemaining} more day${actualDaysRemaining !== 1 ? 's' : ''} until you earn this badge! 🔥`
              : "Complete your check-in today to unlock this milestone!"
            }
          </p>
        </div>
      </div>
    </section>
  )
}
