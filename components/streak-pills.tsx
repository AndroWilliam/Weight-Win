"use client"

import { cn } from "@/lib/utils"

interface StreakPillsProps {
  currentDay: number
  className?: string
}

export function StreakPills({ currentDay, className }: StreakPillsProps) {
  return (
    <div className={cn("flex justify-center gap-2", className)}>
      {Array.from({ length: 7 }, (_, index) => {
        const dayNumber = index + 1
        const isCompleted = dayNumber <= currentDay
        const isCurrent = dayNumber === currentDay
        
        return (
          <div
            key={dayNumber}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200",
              {
                "bg-primary-600 text-white": isCompleted,
                "bg-primary-50 text-primary-600 border-2 border-primary-600": isCurrent && !isCompleted,
                "bg-neutral-100 text-neutral-500": !isCompleted && !isCurrent,
              }
            )}
          >
            {dayNumber}
          </div>
        )
      })}
    </div>
  )
}
