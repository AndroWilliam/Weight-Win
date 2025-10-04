"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface RewardCountdownProps {
  currentDay: number
  className?: string
}

export function RewardCountdown({ currentDay, className }: RewardCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const isCompleted = currentDay > 7
  const daysRemaining = Math.max(0, 7 - currentDay)

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
      <section className={`rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col ${className}`} aria-labelledby="reward-heading">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🎁</span>
          <h3 id="reward-heading" className="text-lg font-semibold text-slate-900">Reward Unlocked!</h3>
        </div>
        <p className="text-sm text-slate-700 mb-3 flex-1">
          Congratulations! You've completed the 7-day challenge and earned your free nutritionist session.
        </p>
        <div className="bg-white/60 border border-emerald-200 rounded-lg p-3">
          <p className="text-emerald-700 font-medium text-xs">
            Your free 30-minute session with a certified nutritionist is ready to be scheduled.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className={`rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col ${className}`} aria-labelledby="reward-heading">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎁</span>
        <h3 id="reward-heading" className="text-lg font-semibold text-slate-900">Your Reward</h3>
      </div>
      
      <p className="text-sm text-slate-700 mb-4 flex-1">
        Complete {daysRemaining} more day{daysRemaining !== 1 ? 's' : ''} to unlock your free 30-minute session with a certified nutritionist.
      </p>

      {daysRemaining > 0 && (
        <div className="space-y-3 mt-auto">
          <div className="bg-white/60 border border-emerald-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Time remaining</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-base font-bold text-emerald-600 leading-none">{timeLeft.days}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Days</div>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-base font-bold text-emerald-600 leading-none">{timeLeft.hours}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Hours</div>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-base font-bold text-emerald-600 leading-none">{timeLeft.minutes}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Minutes</div>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-base font-bold text-emerald-600 leading-none">{timeLeft.seconds}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Seconds</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
