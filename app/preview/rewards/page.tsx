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
import { formatWeightCheckDate } from '@/lib/utils/dateFormat'
import { Lock } from 'lucide-react'

const TOTAL_STEPS = 5

export default function PreviewRewardsPage() {
  const router = useRouter()
  const { data, loading, updateData } = usePreviewData()
  const { isDemoMode } = useDemoMode()
  const [showTooltip, setShowTooltip] = useState(true)

  // ✅ NEW: Guard flag to prevent infinite localStorage loop
  const [hasUpdatedStep, setHasUpdatedStep] = useState(false)

  // Use demo data if in demo mode
  const displayData = isDemoMode ? getDemoData('rewards') : data

  useEffect(() => {
    // Log demo mode status
    if (isDemoMode) {
      console.log('🎭 Demo mode active - using sample data for rewards')
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

    // ✅ FIX: Check if step is already 5 and badges are set
    if (data && data.currentStep === 5 && data.firstStepBadgeEarned && data.tourCompleted) {
      console.log('✅ Step already set to 5 with badges, skipping update')
      setHasUpdatedStep(true)
      return
    }

    console.log('💾 Setting currentStep to 5 and marking badges (first time)')

    // ✅ FIX: Mark as updated BEFORE calling updateData
    setHasUpdatedStep(true)

    // Mark badge as earned and tour as completed (will only happen once)
    updateData({
      firstStepBadgeEarned: true,
      tourCompleted: true,
      currentStep: 5
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data, hasUpdatedStep])

  const handlePrevious = () => {
    try {
      console.log('🔄 Navigating back to progress page')
      // Use window.location as router.push is hanging
      window.location.href = '/preview/progress'
    } catch (error) {
      console.error('❌ Navigation error:', error)
    }
  }

  const handleFinish = () => {
    try {
      console.log('✅ Navigating to signup page')
      // Use window.location as router.push is hanging
      window.location.href = '/preview-signup'
    } catch (error) {
      console.error('❌ Navigation error:', error)
    }
  }

  // Show loading state while data is being fetched
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

      <PreviewBanner currentStep={5} totalSteps={TOTAL_STEPS} />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Tooltip */}
        {showTooltip && (
          <PreviewTooltip
            title="Earn badges and rewards throughout your journey!"
            description="Complete daily uploads, maintain streaks, and unlock achievements as you progress."
            onDismiss={() => setShowTooltip(false)}
          />
        )}

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎁 You Earned a Reward!
          </h1>
          <p className="text-gray-600">
            Celebrate your first step to success
          </p>
        </div>

        {/* Badge Card */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-8 shadow-lg border-2 border-yellow-200">
          <div className="text-center space-y-4">
            {/* Badge Image */}
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-md mb-4">
              <span className="text-6xl">🥇</span>
            </div>

            {/* Badge Title */}
            <h2 className="text-2xl font-bold text-gray-900">
              FIRST STEP
            </h2>

            {/* Badge Description */}
            <p className="text-gray-700 max-w-md mx-auto">
              Congratulations! You took your first step to success!
              This is just the beginning of your amazing journey.
            </p>

            {/* Earned Date */}
            <p className="text-sm text-gray-600">
              Earned {formatWeightCheckDate(new Date())}
            </p>
          </div>
        </div>

        {/* Upcoming Badges */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            More Badges to Unlock
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: '🔥', name: '3-Day Streak' },
              { icon: '⚡', name: 'Week Warrior' },
              { icon: '🎯', name: 'Perfect Week' },
              { icon: '👑', name: 'Month Master' },
              { icon: '💎', name: 'Consistency King' }
            ].map((badge, index) => (
              <div 
                key={index}
                className="bg-gray-100 rounded-lg p-4 text-center opacity-50"
              >
                <div className="relative">
                  <span className="text-4xl grayscale">{badge.icon}</span>
                  <Lock className="h-4 w-4 absolute top-0 right-0 text-gray-500" />
                </div>
                <p className="text-xs text-gray-600 mt-2">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Indicator */}
        <PreviewStepIndicator currentStep={4} totalSteps={TOTAL_STEPS} />

        {/* Navigation */}
        <PreviewNavigation
          onPrevious={handlePrevious}
          onNext={handleFinish}
          nextLabel="Finish Demo →"
        />
      </div>
    </div>
  )
}


