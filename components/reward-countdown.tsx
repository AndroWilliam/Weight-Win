"use client"

import { useState, useEffect } from "react"
import { Gift, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

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
      <Card className={`border-neutral-300 rounded-xl h-full ${className}`}>
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">Reward Unlocked!</h3>
          </div>
          <p className="text-neutral-700 mb-3 text-xs leading-relaxed">
            Congratulations! You've completed the 7-day challenge and earned your free nutritionist session.
          </p>
          <div className="bg-success-50 border border-success-200 rounded-lg p-3 mt-auto">
            <p className="text-success-700 font-medium text-[11px]">
              Your free 30-minute session with a certified nutritionist is ready to be scheduled.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-neutral-300 rounded-xl h-full ${className}`}>
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-5 h-5 text-primary-600" />
          <h3 className="text-sm font-semibold text-neutral-900">Your Reward</h3>
        </div>
        
        <p className="text-neutral-700 mb-3 text-xs leading-relaxed">
          Complete {daysRemaining} more day{daysRemaining !== 1 ? 's' : ''} to unlock your free 30-minute session with a certified nutritionist.
        </p>

        {daysRemaining > 0 && (
          <div className="space-y-3 mt-auto">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary-600" />
                <span className="text-[11px] font-medium text-primary-700 uppercase tracking-wide">Time remaining</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white rounded-lg p-2">
                  <div className="text-base font-bold text-primary-600 leading-none">{timeLeft.days}</div>
                  <div className="text-[10px] text-neutral-500">Days</div>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <div className="text-base font-bold text-primary-600 leading-none">{timeLeft.hours}</div>
                  <div className="text-[10px] text-neutral-500">Hours</div>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <div className="text-base font-bold text-primary-600 leading-none">{timeLeft.minutes}</div>
                  <div className="text-[10px] text-neutral-500">Minutes</div>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <div className="text-base font-bold text-primary-600 leading-none">{timeLeft.seconds}</div>
                  <div className="text-[10px] text-neutral-500">Seconds</div>
                </div>
              </div>
            </div>

            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((7 - daysRemaining) / 7) * 100}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-neutral-500 text-center">
              {Math.round(((7 - daysRemaining) / 7) * 100)}% complete
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
