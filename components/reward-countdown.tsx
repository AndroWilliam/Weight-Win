"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface RewardCountdownProps {
  currentDay: number
  className?: string
  daysRemaining?: number
}

export function RewardCountdown({ currentDay, className, daysRemaining: propsDaysRemaining }: RewardCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const isCompleted = currentDay > 7
  const calculatedDaysRemaining = Math.max(0, 7 - currentDay)
  
  // Use daysRemaining from props if provided, otherwise calculate
  const actualDaysRemaining = propsDaysRemaining ?? calculatedDaysRemaining

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
      <section className={`rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col justify-center ${className}`} aria-labelledby="reward-heading">
        <div className="text-center space-y-4">
          <span className="text-4xl">🎁</span>
          <h3 id="reward-heading" className="text-2xl font-semibold text-slate-900">Reward Unlocked!</h3>
          <p className="text-slate-700">
            Congratulations! You've completed the 7-day challenge and earned your free nutritionist session.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className={`rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col justify-center ${className}`} aria-labelledby="reward-heading">
      <div className="text-center space-y-4">
        <span className="text-4xl">🎁</span>
        <h3 id="reward-heading" className="text-2xl font-semibold text-slate-900">Your Reward</h3>
                <p className="text-slate-700">
                  {actualDaysRemaining > 0 
                    ? `Only ${actualDaysRemaining} more day${actualDaysRemaining !== 1 ? 's' : ''} to go for your reward 🔥`
                    : "Complete your final check-in to unlock your reward!"
                  }
                </p>
      </div>
    </section>
  )
}
