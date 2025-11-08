'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PreviewBanner } from '@/components/preview/PreviewBanner'
import { PreviewTooltip } from '@/components/preview/PreviewTooltip'
import { PreviewStepIndicator } from '@/components/preview/PreviewStepIndicator'
import { PreviewNavigation } from '@/components/preview/PreviewNavigation'
import { usePreviewData } from '@/hooks/usePreviewData'
import { Flame, Calendar, TrendingDown } from 'lucide-react'

const TOTAL_STEPS = 5

export default function PreviewDashboardPage() {
  const router = useRouter()
  const { data, updateData } = usePreviewData()
  const [showTooltip, setShowTooltip] = useState(true)

  useEffect(() => {
    if (!data) {
      router.push('/preview/weight-check')
      return
    }

    updateData({ currentStep: 3 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePrevious = () => {
    router.push('/preview/ocr-processing')
  }

  const handleNext = () => {
    router.push('/preview/progress')
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <PreviewBanner currentStep={3} totalSteps={TOTAL_STEPS} />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Tooltip */}
        {showTooltip && (
          <PreviewTooltip
            title="This is your command center!"
            description="Track your weight, see your streak, and monitor your progress all in one place."
            onDismiss={() => setShowTooltip(false)}
          />
        )}

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard! 📊
          </h1>
          <p className="text-gray-600">
            Your personal weight tracking hub
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Weight */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Current Weight</span>
              <TrendingDown className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data.weight} {data.weightUnit}
            </p>
            <p className="text-xs text-green-600 mt-1">⭐ Starting point</p>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Streak</span>
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data.streakCount} 🔥
            </p>
            <p className="text-xs text-gray-600 mt-1">Day started</p>
          </div>

          {/* Days Left */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Days Left</span>
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">6 days</p>
            <p className="text-xs text-gray-600 mt-1">In your challenge</p>
          </div>
        </div>

        {/* Latest Entry */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Latest Entry
          </h2>
          
          <div className="flex items-center gap-4">
            {data.photoBase64 && (
              <img
                src={data.photoBase64}
                alt="Your scale"
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
            
            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">
                {data.weight} {data.weightUnit}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(data.photoTimestamp).toLocaleString()}
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                ✅ Verified by AI
              </span>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <PreviewStepIndicator currentStep={2} totalSteps={TOTAL_STEPS} />

        {/* Navigation */}
        <PreviewNavigation
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </div>
  )
}


