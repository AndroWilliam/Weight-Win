"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { tipsService, type Tip, type DailyTips } from "@/lib/tips-service"

interface DailyTipsProps {
  className?: string
}

export function DailyTips({ className }: DailyTipsProps) {
  const [dailyTips, setDailyTips] = useState<DailyTips | null>(null)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDailyTips()
  }, [])

  const loadDailyTips = async () => {
    try {
      setIsLoading(true)
      const tips = await tipsService.getDailyTips()
      setDailyTips(tips)
    } catch (error) {
      console.error('Error loading daily tips:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-slider effect
  useEffect(() => {
    if (!dailyTips || dailyTips.tips.length <= 1) return

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % dailyTips.tips.length)
    }, 5000) // Change tip every 5 seconds

    return () => clearInterval(interval)
  }, [dailyTips])

  const goToPrevious = () => {
    if (!dailyTips) return
    setCurrentTipIndex((prev) => (prev - 1 + dailyTips.tips.length) % dailyTips.tips.length)
  }

  const goToNext = () => {
    if (!dailyTips) return
    setCurrentTipIndex((prev) => (prev + 1) % dailyTips.tips.length)
  }

  if (isLoading) {
    return (
      <section className={`rounded-2xl border border-border shadow-sm p-5 sm:p-8 flex flex-col ${className}`} aria-labelledby="tips-heading">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-xl sm:text-2xl">📖</span>
          </div>
          <h3 id="tips-heading" className="text-lg sm:text-2xl font-semibold text-foreground">Daily Tips</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm sm:text-base text-muted-foreground">Loading today's tips...</p>
        </div>
      </section>
    )
  }

  if (!dailyTips || dailyTips.tips.length === 0) {
    return (
      <section className={`rounded-2xl border border-border shadow-sm p-5 sm:p-8 flex flex-col ${className}`} aria-labelledby="tips-heading">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-xl sm:text-2xl">📖</span>
          </div>
          <h3 id="tips-heading" className="text-lg sm:text-2xl font-semibold text-foreground">Daily Tips</h3>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">No tips available today.</p>
      </section>
    )
  }

  const currentTip = dailyTips.tips[currentTipIndex]

  return (
    <section className={`rounded-2xl border border-border shadow-sm p-5 sm:p-8 flex flex-col ${className}`} aria-labelledby="tips-heading">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-xl sm:text-2xl">📖</span>
          </div>
          <h3 id="tips-heading" className="text-lg sm:text-2xl font-semibold text-foreground">Daily Tips</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={goToPrevious}
            variant="outline"
            size="icon"
            className="h-10 w-10 sm:h-8 sm:w-8 border-border bg-background/60"
            aria-label="Previous tip"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            onClick={goToNext}
            variant="outline"
            size="icon"
            className="h-10 w-10 sm:h-8 sm:w-8 border-border bg-background/60"
            aria-label="Next tip"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden flex-1">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentTipIndex * 100}%)` }}
        >
          {dailyTips.tips.map((tip) => (
            <div key={tip.id} className="w-full flex-shrink-0 flex flex-col space-y-4">
              <h4 className="font-semibold text-foreground text-base sm:text-lg">{tip.title}</h4>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{tip.content}</p>
              <div className="flex items-center gap-3 mt-auto pt-4">
                <span className="text-[11px] sm:text-xs text-muted-foreground">{currentTip.readTime}</span>
                <div className="flex gap-1.5">
                  {dailyTips.tips.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTipIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentTipIndex ? 'bg-primary' : 'bg-border'
                      }`}
                      aria-label={`Go to tip ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function getCategoryLabel(category: Tip['category']): string {
  const labels = {
    'healthy-diet': 'Diet',
    'healthy-lifestyle': 'Lifestyle',
    'workout': 'Workout',
    'motivational': 'Motivation'
  }
  return labels[category] || 'Tip'
}
