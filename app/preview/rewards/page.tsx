'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PreviewBanner } from '@/components/preview/PreviewBanner'
import { PreviewTooltip } from '@/components/preview/PreviewTooltip'
import { PreviewStepIndicator } from '@/components/preview/PreviewStepIndicator'
import { PreviewNavigation } from '@/components/preview/PreviewNavigation'
import { usePreviewData } from '@/hooks/usePreviewData'
import { Lock } from 'lucide-react'

const TOTAL_STEPS = 5

export default function PreviewRewardsPage() {
  const router = useRouter()
  const { data, updateData } = usePreviewData()
  const [showTooltip, setShowTooltip] = useState(true)

  useEffect(() => {
    if (!data) {
      router.push('/preview/weight-check')
      return
    }

    // Mark badge as earned and tour as completed
    updateData({ 
      firstStepBadgeEarned: true,
      tourCompleted: true,
      currentStep: 5
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePrevious = () => {
    router.push('/preview/progress')
  }

  const handleFinish = () => {
    router.push('/preview-signup')
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-50">
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
              Earned {new Date().toLocaleDateString()}
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


