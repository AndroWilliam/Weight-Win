"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

interface StreakPillsProps {
  currentDay: number
  currentMilestone: number
  completedDaysArray?: number[]
  className?: string
}

export function StreakPills({ 
  currentDay, 
  currentMilestone = 7, 
  completedDaysArray = [],
  className 
}: StreakPillsProps) {
  const totalPills = currentMilestone
  
  return (
    <div className={cn(
      "grid gap-2 justify-center",
      className,
      {
        "grid-cols-7": totalPills === 7,
        "grid-cols-7 sm:grid-cols-14": totalPills === 14,
        "grid-cols-7 sm:grid-cols-14 md:grid-cols-21": totalPills === 21,
        "grid-cols-6 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-30": totalPills === 30,
      }
    )}>
      {Array.from({ length: totalPills }, (_, index) => {
        const dayNumber = index + 1
        const isCompleted = completedDaysArray.includes(dayNumber) || dayNumber < currentDay
        const isCurrent = dayNumber === currentDay
        
        return (
          <motion.div
            key={dayNumber}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: index * 0.02,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 relative",
              {
                "bg-green-500 text-white shadow-lg": isCompleted && !isCurrent,
                "bg-primary text-white shadow-lg ring-4 ring-primary/30 animate-pulse": isCurrent,
                "bg-muted text-muted-foreground border-2 border-border": !isCompleted && !isCurrent,
              }
            )}
          >
            {isCompleted && !isCurrent ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <span>{dayNumber}</span>
            )}
            
            {/* Pulse animation for current day */}
            {isCurrent && (
              <motion.div
                className="absolute inset-0 rounded-full bg-primary"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
