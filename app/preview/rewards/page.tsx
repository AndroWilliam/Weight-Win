'use client'

/**
 * REWARDS PAGE - Preview Flow Step 5 (Final Step)
 * ================================================
 * 
 * PURPOSE:
 * Shows user's achievements and unlocked rewards based on
 * completed steps in the preview flow. This is the final step
 * before prompting user to sign up.
 * 
 * STORAGE OPERATIONS:
 * - Reads:
 *   1. 'weightwin_preview_data' (localStorage): Preview data including badges
 *      Structure: PreviewData {
 *        weight: number
 *        firstStepBadgeEarned: boolean (whether first step badge was earned)
 *        tourCompleted: boolean (whether preview tour was completed)
 *        currentStep: number (5)
 *        ...other fields
 *      }
 * 
 * - Writes:
 *   1. 'weightwin_preview_data' (localStorage): Updates badges and completion status
 *      Updates: {
 *        firstStepBadgeEarned: true,
 *        tourCompleted: true,
 *        currentStep: 5
 *      }
 * 
 * NAVIGATION:
 * - Previous: /preview/progress or /preview/dashboard
 * - Next: /preview-signup (final step, prompts user to create account)
 * - Redirect: /preview/weight-check (if no weight data found)
 * 
 * USER FLOW:
 * 1. Page loads and checks for weight data
 * 2. If none → Redirect to weight-check
 * 3. If data exists → Display rewards
 * 4. Show earned badge (First Step badge)
 * 5. Show locked rewards (future achievements)
 * 6. Mark badges as earned and tour as completed
 * 7. User clicks "Finish Demo" → Navigate to signup page
 * 
 * REWARDS LOGIC:
 * - First Step badge: Earned when user completes first weight entry
 * - Badge earned date: Current date (formatted using dateFormat utility)
 * - Locked rewards: Shown in gray/disabled state
 * - Unlocked rewards: Shown in color/enabled state
 * - Progress indicator: Shows completion status
 * 
 * DISPLAYED DATA:
 * - Earned Badge: First Step badge with earned date
 * - Locked Rewards: List of future achievements (3-Day Streak, Week Warrior, etc.)
 * - Badge Icons: Visual representation of each reward
 * - Completion Status: Visual indicator of tour completion
 * 
 * DATA VALIDATION:
 * - Must have at least one weight entry (weight > 0)
 * - Badge earned date formatted using dateFormat utility (BUG-004)
 * - Guard flag prevents multiple badge updates (hasUpdatedStep)
 * 
 * GUARD FLAGS:
 * - hasUpdatedStep: Prevents badges from being marked multiple times
 * - If badges already set and step is 5, skip update
 * - This prevents infinite loops when component re-renders
 * 
 * DEMO MODE:
 * - When ?demo=true: Shows sample rewards data from getDemoData('rewards')
 * - Demonstrates 4 days completed with partial progress
 * - Shows mix of locked/unlocked rewards
 * - See: hooks/useDemoMode.ts and lib/preview/demoData.ts
 * 
 * RELATED FILES:
 * - /preview-signup (next page, prompts account creation)
 * - lib/utils/dateFormat.ts (date formatting - BUG-004)
 * - hooks/usePreviewData.ts (data management hook)
 */

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
  // Prevents badges from being marked multiple times on re-render
  const [hasUpdatedStep, setHasUpdatedStep] = useState(false)

  // Use demo data if in demo mode
  // Demo mode bypasses localStorage and uses sample data
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
    // If already completed, no need to update localStorage again
    if (data && data.currentStep === 5 && data.firstStepBadgeEarned && data.tourCompleted) {
      console.log('✅ Step already set to 5 with badges, skipping update')
      setHasUpdatedStep(true)
      return
    }

    console.log('💾 Setting currentStep to 5 and marking badges (first time)')

    // ✅ FIX: Mark as updated BEFORE calling updateData
    // This prevents the useEffect from running again if updateData triggers a re-render
    setHasUpdatedStep(true)

    // Mark badge as earned and tour as completed (will only happen once)
    // Updates 'weightwin_preview_data' in localStorage with completion status
    // This data is used by /preview-signup page to show completion summary
    updateData({
      firstStepBadgeEarned: true, // First Step badge earned
      tourCompleted: true, // Preview tour completed
      currentStep: 5 // Final step
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
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 transition-colors duration-200">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-b-2 border-yellow-400 dark:border-yellow-600 text-yellow-900 dark:text-yellow-200 px-4 py-2 flex items-center justify-between transition-colors duration-200">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-50 mb-2 transition-colors duration-200">
            🎁 You Earned a Reward!
          </h1>
          <p className="text-gray-600 dark:text-neutral-300 transition-colors duration-200">
            Celebrate your first step to success
          </p>
        </div>

        {/* Badge Card */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-8 shadow-lg border-2 border-yellow-200 dark:border-yellow-700 transition-colors duration-200">
          <div className="text-center space-y-4">
            {/* Badge Image */}
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white dark:bg-neutral-800 rounded-full shadow-md mb-4 transition-colors duration-200">
              <span className="text-6xl">🥇</span>
            </div>

            {/* Badge Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-50 transition-colors duration-200">
              FIRST STEP
            </h2>

            {/* Badge Description */}
            <p className="text-gray-700 dark:text-neutral-300 max-w-md mx-auto transition-colors duration-200">
              Congratulations! You took your first step to success!
              This is just the beginning of your amazing journey.
            </p>

            {/* Earned Date */}
            <p className="text-sm text-gray-600 dark:text-neutral-400 transition-colors duration-200">
              Earned {formatWeightCheckDate(new Date())}
            </p>
          </div>
        </div>

        {/* Upcoming Badges */}
        <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-4 transition-colors duration-200">
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
                className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-4 text-center opacity-50 transition-colors duration-200"
              >
                <div className="relative">
                  <span className="text-4xl grayscale">{badge.icon}</span>
                  <Lock className="h-4 w-4 absolute top-0 right-0 text-gray-500 dark:text-neutral-400 transition-colors duration-200" />
                </div>
                <p className="text-xs text-gray-600 dark:text-neutral-400 mt-2 transition-colors duration-200">{badge.name}</p>
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


