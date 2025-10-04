"use client"

import { useState, useEffect } from "react"
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
      <Card className={`border-neutral-300 h-full ${className}`}>
        <CardContent className="p-5 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <h3 className="text-base font-semibold text-neutral-900">Daily Tips</h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-neutral-600 text-sm">Loading today's tips...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!dailyTips || dailyTips.tips.length === 0) {
    return (
      <Card className={`border-neutral-300 h-full ${className}`}>
        <CardContent className="p-5 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <h3 className="text-base font-semibold text-neutral-900">Daily Tips</h3>
          </div>
          <p className="text-neutral-600 text-sm">No tips available today.</p>
        </CardContent>
      </Card>
    )
  }

  const currentTip = dailyTips.tips[currentTipIndex]

  return (
    <Card className={`border-neutral-300 h-full ${className}`}>
      <CardContent className="p-5 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <h3 className="text-base font-semibold text-neutral-900">Daily Tips</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={goToPrevious}
              variant="outline"
              size="icon"
              className="h-8 w-8 border-neutral-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={goToNext}
              variant="outline"
              size="icon"
              className="h-8 w-8 border-neutral-300"
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
              <div key={tip.id} className="w-full flex-shrink-0 flex flex-col">
                <div className="space-y-3 flex-1">
                  <span className="inline-flex px-2 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded-full w-min">
                    {getCategoryLabel(tip.category)}
                  </span>
                  <h4 className="font-medium text-neutral-900 text-sm leading-snug">{tip.title}</h4>
                  <p className="text-neutral-700 text-sm leading-relaxed line-clamp-6">{tip.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-neutral-500">{currentTip.readTime}</span>
          <div className="flex gap-1">
            {dailyTips.tips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTipIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTipIndex ? 'bg-primary-600' : 'bg-neutral-300'
                }`}
                aria-label={`Go to tip ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
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
