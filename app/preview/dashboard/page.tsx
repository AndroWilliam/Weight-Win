'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PreviewBanner } from '@/components/preview/PreviewBanner'
import { PreviewTooltip } from '@/components/preview/PreviewTooltip'
import { PreviewStepIndicator } from '@/components/preview/PreviewStepIndicator'
import { PreviewNavigation } from '@/components/preview/PreviewNavigation'
import { usePreviewData } from '@/hooks/usePreviewData'
import { useDemoMode } from '@/hooks/useDemoMode'
import { getDemoData } from '@/lib/preview/demoData'
import { formatDateTime } from '@/lib/utils/dateFormat'
import { Flame, Calendar, TrendingDown } from 'lucide-react'

const TOTAL_STEPS = 5

export default function PreviewDashboardPage() {
  const router = useRouter()
  const { data, loading, updateData } = usePreviewData()
  const { isDemoMode } = useDemoMode()
  const [showTooltip, setShowTooltip] = useState(true)

  // ✅ NEW: Guard flag to prevent infinite localStorage loop
  const [hasUpdatedStep, setHasUpdatedStep] = useState(false)

  // Use demo data if in demo mode
  const displayData = isDemoMode ? getDemoData('dashboard') : data

  useEffect(() => {
    // Log demo mode status
    if (isDemoMode) {
      console.log('🎭 Demo mode active - using sample data for dashboard')
      console.log('📊 Demo data:', displayData)
      return
    }

    // Wait for data to load
    if (loading) {
      console.log('⏳ Waiting for preview data to load...')
      return
    }

    console.log('📊 Preview data loaded:', data ? 'Data found' : 'No data')

    // ✅ FIX: If we already updated the step, don't update again
    if (hasUpdatedStep) {
      console.log('⏭️ Already updated step, skipping')
      return
    }

    // Check if we have required data (skip validation in demo mode)
    if (!isDemoMode && (!data || !data.weight)) {
      console.log('❌ No weight data found, redirecting to weight-check')
      window.location.href = '/preview/weight-check'
      return
    }

    // ✅ FIX: Check if currentStep is already 3
    if (data && data.currentStep === 3) {
      console.log('✅ Step already set to 3, skipping update')
      setHasUpdatedStep(true)
      return
    }

    console.log('💾 Setting currentStep to 3 (first time)')

    // ✅ FIX: Mark as updated BEFORE calling updateData
    setHasUpdatedStep(true)

    // Update step (will only happen once)
    updateData({ currentStep: 3 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data, hasUpdatedStep])

  const handlePrevious = () => {
    try {
      console.log('🔄 Navigating back to OCR page')
      // Use window.location as router.push is hanging
      window.location.href = '/preview/ocr-processing'
    } catch (error) {
      console.error('❌ Navigation error:', error)
    }
  }

  const handleNext = () => {
    try {
      console.log('➡️ Navigating to progress page')
      // Use window.location as router.push is hanging
      window.location.href = '/preview/progress'
    } catch (error) {
      console.error('❌ Navigation error:', error)
    }
  }

  // Show loading state while data is being fetched (skip in demo mode)
  if (!isDemoMode && loading) return <div>Loading...</div>
  if (!isDemoMode && !data) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-yellow-100 border-b-2 border-yellow-400 text-yellow-900 px-4 py-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-lg">🎭</span>
            <span className="font-medium text-sm sm:text-base">DEMO MODE - Using Sample Data</span>
          </span>
        </div>
      )}

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
              {displayData?.weight} {displayData?.weightUnit}
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
              {displayData?.streakCount || 0} 🔥
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
            {displayData?.photoBase64 && (
              <img
                src={displayData.photoBase64}
                alt="Your scale"
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}

            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">
                {displayData?.weight} {displayData?.weightUnit}
              </p>
              <p className="text-sm text-gray-600">
                {displayData?.photoTimestamp
                  ? formatDateTime(displayData.photoTimestamp)
                  : 'Just now'
                }
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


