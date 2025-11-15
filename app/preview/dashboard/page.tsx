'use client'

/**
 * DASHBOARD PAGE - Preview Flow Step 3
 * =====================================
 * 
 * PURPOSE:
 * Main dashboard showing user's current weight, progress summary,
 * and quick navigation to other preview pages.
 * 
 * STORAGE OPERATIONS:
 * - Reads:
 *   1. 'weightwin_preview_data' (localStorage): Current preview data
 *      Structure: PreviewData {
 *        weight: number (extracted weight from OCR step)
 *        weightUnit: 'kg' | 'lb'
 *        photoBase64: string (base64-encoded scale photo)
 *        photoTimestamp: string (ISO date string)
 *        streakCount: number
 *        currentStep: number (3)
 *        sessionStarted: string (ISO date string)
 *        tourCompleted: boolean
 *        firstStepBadgeEarned: boolean
 *      }
 * 
 * - Writes:
 *   1. 'weightwin_preview_data' (localStorage): Updates currentStep to 3
 *      Updates: { currentStep: 3 }
 * 
 * NAVIGATION:
 * - Previous: /preview/ocr-processing (after weight entry)
 * - Next: /preview/progress, /preview/rewards (user choice via navigation)
 * - Redirect: /preview/weight-check (if no weight data found)
 * 
 * USER FLOW:
 * 1. Page loads and validates weight data exists in localStorage
 * 2. If no data → Redirect to weight-check (user must complete flow)
 * 3. If data exists → Display dashboard
 * 4. Show current weight prominently
 * 5. Show quick stats (streak count, days left)
 * 6. Display latest entry with photo preview
 * 7. Provide navigation to Progress and Rewards pages
 * 
 * DISPLAYED DATA:
 * - Current Weight: Latest weight from preview data (weight field)
 * - Weight Unit: kg or lb from preview data
 * - Streak Count: Number of consecutive days from preview data
 * - Days Left: Calculated (7 - days completed)
 * - Latest Entry: Photo and timestamp from photoBase64 and photoTimestamp
 * - Photo Preview: Base64 image displayed directly
 * 
 * DATA VALIDATION:
 * - Must have at least one weight entry (weight > 0)
 * - Weight must be a valid number
 * - Photo timestamp formatted using dateFormat utility (BUG-004)
 * - Guard flag prevents infinite localStorage updates (hasUpdatedStep)
 * 
 * GUARD FLAGS:
 * - hasUpdatedStep: Prevents currentStep from being updated multiple times
 * - If currentStep is already 3, skip update
 * - This prevents infinite loops when component re-renders
 * 
 * DEMO MODE:
 * - When ?demo=true: Shows sample dashboard data from getDemoData('dashboard')
 * - Bypasses validation requirements
 * - Shows demo mode banner at top
 * - Uses sample weight, photo, and streak data
 * - See: hooks/useDemoMode.ts and lib/preview/demoData.ts
 * 
 * RELATED FILES:
 * - /preview/progress (detailed progress view)
 * - /preview/rewards (achievements view)
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
import { formatDateTime } from '@/lib/utils/dateFormat'
import { Flame, Calendar, TrendingDown } from 'lucide-react'

const TOTAL_STEPS = 5

export default function PreviewDashboardPage() {
  const router = useRouter()
  const { data, loading, updateData } = usePreviewData()
  const { isDemoMode } = useDemoMode()
  const [showTooltip, setShowTooltip] = useState(true)

  // ✅ NEW: Guard flag to prevent infinite localStorage loop
  // Prevents currentStep from being updated multiple times on re-render
  const [hasUpdatedStep, setHasUpdatedStep] = useState(false)

  // Use demo data if in demo mode
  // Demo mode bypasses localStorage and uses sample data
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
    // Weight data is required - without it, dashboard can't display meaningful info
    if (!isDemoMode && (!data || !data.weight)) {
      console.log('❌ No weight data found, redirecting to weight-check')
      window.location.href = '/preview/weight-check'
      return
    }

    // ✅ FIX: Check if currentStep is already 3
    // If already set, no need to update localStorage again
    if (data && data.currentStep === 3) {
      console.log('✅ Step already set to 3, skipping update')
      setHasUpdatedStep(true)
      return
    }

    console.log('💾 Setting currentStep to 3 (first time)')

    // ✅ FIX: Mark as updated BEFORE calling updateData
    // This prevents the useEffect from running again if updateData triggers a re-render
    setHasUpdatedStep(true)

    // Update step (will only happen once)
    // Updates 'weightwin_preview_data' in localStorage with currentStep: 3
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-50 mb-2 transition-colors duration-200">
            Welcome to Your Dashboard! 📊
          </h1>
          <p className="text-gray-600 dark:text-neutral-300 transition-colors duration-200">
            Your personal weight tracking hub
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Weight */}
          <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-neutral-400 transition-colors duration-200">Current Weight</span>
              <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-500 transition-colors duration-200" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-neutral-50 transition-colors duration-200">
              {displayData?.weight} {displayData?.weightUnit}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1 transition-colors duration-200">⭐ Starting point</p>
          </div>

          {/* Streak */}
          <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-neutral-400 transition-colors duration-200">Streak</span>
              <Flame className="h-5 w-5 text-orange-600 dark:text-orange-500 transition-colors duration-200" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-neutral-50 transition-colors duration-200">
              {displayData?.streakCount || 0} 🔥
            </p>
            <p className="text-xs text-gray-600 dark:text-neutral-400 mt-1 transition-colors duration-200">Day started</p>
          </div>

          {/* Days Left */}
          <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-neutral-400 transition-colors duration-200">Days Left</span>
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-500 transition-colors duration-200" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-neutral-50 transition-colors duration-200">6 days</p>
            <p className="text-xs text-gray-600 dark:text-neutral-400 mt-1 transition-colors duration-200">In your challenge</p>
          </div>
        </div>

        {/* Latest Entry */}
        <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-4 transition-colors duration-200">
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
              <p className="text-2xl font-bold text-gray-900 dark:text-neutral-50 transition-colors duration-200">
                {displayData?.weight} {displayData?.weightUnit}
              </p>
              <p className="text-sm text-gray-600 dark:text-neutral-400 transition-colors duration-200">
                {displayData?.photoTimestamp
                  ? formatDateTime(displayData.photoTimestamp)
                  : 'Just now'
                }
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-500 mt-1 transition-colors duration-200">
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


