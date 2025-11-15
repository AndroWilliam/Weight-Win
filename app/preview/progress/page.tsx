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
import { SAMPLE_PROGRESS_DATA } from '@/lib/preview/previewData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const TOTAL_STEPS = 5

/**
 * PROGRESS PAGE - Preview Flow Step 4
 * ====================================
 * 
 * PURPOSE:
 * Detailed progress tracking showing weight history, statistics,
 * and visual charts of weight change over time.
 * 
 * STORAGE OPERATIONS:
 * - Reads:
 *   1. 'weightwin_preview_data' (localStorage): Current preview data
 *      Structure: PreviewData {
 *        weight: number (current weight from OCR step)
 *        weightUnit: 'kg' | 'lb'
 *        ...other fields
 *      }
 * 
 * - Writes:
 *   1. 'weightwin_preview_data' (localStorage): Updates currentStep to 4
 *      Updates: { currentStep: 4 }
 * 
 * DATA PROCESSING:
 * - Uses SAMPLE_PROGRESS_DATA for chart display (7-day sample data)
 * - Replaces first day's weight with actual weight if available
 * - Calculates statistics using helper functions (BUG-005):
 *   - getStartingWeight(weights): Finds earliest weight by timestamp
 *   - getCurrentWeight(weights): Finds latest weight by timestamp
 *   - calculateWeightChange(current, starting): Calculates difference
 *   - sortWeightsByDate(weights): Sorts chronologically
 * 
 * STATISTICS CALCULATED:
 * - Starting Weight: Earliest weight by timestamp (not array position)
 * - Current Weight: Latest weight by timestamp (not array position)
 * - Weight Change: Current - Starting (can be negative for loss)
 * - Average Weight: Mean of all weight entries
 * - Days Completed: Count of weight entries (from sample data: 7)
 * 
 * NAVIGATION:
 * - Previous: /preview/dashboard (back button)
 * - Next: /preview/rewards (user choice via navigation)
 * - Redirect: /preview/weight-check (if no weight data found)
 * 
 * USER FLOW:
 * 1. Page loads and validates weight data exists
 * 2. If no data → Redirect to weight-check
 * 3. If data exists → Prepare chart data
 * 4. Calculate statistics using BUG-005 helper functions
 * 5. Display weight chart/graph (7-day sample data)
 * 6. Show detailed statistics cards
 * 7. Display progress information
 * 
 * CHART DATA:
 * - Uses SAMPLE_PROGRESS_DATA for consistent 7-day display
 * - First day's weight replaced with actual weight if available
 * - Chart shows "Day 1" through "Day 7" on x-axis
 * - Weight values on y-axis
 * - Line chart visualization using recharts library
 * 
 * DATA VALIDATION:
 * - All dates formatted using dateFormat utility (BUG-004)
 * - Weights validated as numbers
 * - Handles single entry case
 * - Handles empty data case
 * - Statistics handle null values gracefully
 * 
 * GUARD FLAGS:
 * - hasUpdatedStep: Prevents currentStep from being updated multiple times
 * - If currentStep is already 4, skip update
 * - This prevents infinite loops when component re-renders
 * 
 * DEMO MODE:
 * - When ?demo=true: Shows sample progress data from getDemoData('progress')
 * - Sample data has 4 weight entries with dates
 * - Demonstrates weight loss trend (76.8 → 75.5 kg)
 * - Shows demo mode banner at top
 * - See: hooks/useDemoMode.ts and lib/preview/demoData.ts
 * 
 * RELATED FILES:
 * - lib/utils/dateFormat.ts (date formatting - BUG-004)
 * - lib/preview/previewData.ts (SAMPLE_PROGRESS_DATA constant)
 * - lib/preview/demoData.ts (demo mode sample data)
 * - BUG-005 helper functions (statistics calculation in this file)
 */

/**
 * Weight entry type for statistics calculation
 * Used internally for processing weight data
 */
type WeightEntry = {
  weight: number
  date?: string
  timestamp?: string | number | Date
}

/**
 * Helper function to find the starting (earliest) weight entry
 * Finds the weight with the oldest timestamp/date
 */
function getStartingWeight(weights: WeightEntry[]): number | null {
  if (!weights || weights.length === 0) {
    return null
  }

  // Find weight entry with earliest timestamp/date
  const earliestWeight = weights.reduce((earliest, current) => {
    const earliestTime = getTimestamp(earliest)
    const currentTime = getTimestamp(current)
    
    return currentTime < earliestTime ? current : earliest
  })

  return earliestWeight?.weight ?? null
}

/**
 * Helper function to find the current (latest) weight entry
 * Finds the weight with the most recent timestamp/date
 */
function getCurrentWeight(weights: WeightEntry[]): number | null {
  if (!weights || weights.length === 0) {
    return null
  }

  // Find weight entry with most recent timestamp/date
  const latestWeight = weights.reduce((latest, current) => {
    const latestTime = getTimestamp(latest)
    const currentTime = getTimestamp(current)
    
    return currentTime > latestTime ? current : latest
  })

  return latestWeight?.weight ?? null
}

/**
 * Helper function to get timestamp from weight entry
 * Handles date, timestamp, or converts to timestamp
 */
function getTimestamp(entry: WeightEntry): number {
  if (entry.timestamp) {
    const ts = typeof entry.timestamp === 'number' 
      ? entry.timestamp 
      : new Date(entry.timestamp).getTime()
    return ts
  }
  
  if (entry.date) {
    return new Date(entry.date).getTime()
  }
  
  // Fallback: use current time (shouldn't happen)
  return Date.now()
}

/**
 * Helper function to calculate weight change
 * Returns the difference between current and starting weight
 */
function calculateWeightChange(
  currentWeight: number | null,
  startingWeight: number | null
): number {
  if (currentWeight === null || startingWeight === null) {
    return 0
  }

  return currentWeight - startingWeight
}

/**
 * Helper function to sort weights by timestamp/date (oldest first)
 * Returns a new sorted array
 */
function sortWeightsByDate(weights: WeightEntry[]): WeightEntry[] {
  return [...weights].sort((a, b) => {
    const timeA = getTimestamp(a)
    const timeB = getTimestamp(b)
    return timeA - timeB  // Ascending order (oldest first)
  })
}

export default function PreviewProgressPage() {
  const router = useRouter()
  const { data, loading, updateData } = usePreviewData()
  const { isDemoMode } = useDemoMode()
  const [showTooltip, setShowTooltip] = useState(true)

  // ✅ NEW: Guard flag to prevent infinite localStorage loop
  const [hasUpdatedStep, setHasUpdatedStep] = useState(false)

  // Use demo data if in demo mode
  const displayData = isDemoMode ? getDemoData('progress') : data

  useEffect(() => {
    // Log demo mode status
    if (isDemoMode) {
      console.log('🎭 Demo mode active - using sample data for progress')
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

    // ✅ FIX: Check if currentStep is already 4
    if (data && data.currentStep === 4) {
      console.log('✅ Step already set to 4, skipping update')
      setHasUpdatedStep(true)
      return
    }

    console.log('💾 Setting currentStep to 4 (first time)')

    // ✅ FIX: Mark as updated BEFORE calling updateData
    setHasUpdatedStep(true)

    // Update step (will only happen once)
    updateData({ currentStep: 4 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data, hasUpdatedStep])

  const handlePrevious = () => {
    try {
      console.log('🔄 Navigating back to dashboard')
      // Use window.location as router.push is hanging
      window.location.href = '/preview/dashboard'
    } catch (error) {
      console.error('❌ Navigation error:', error)
    }
  }

  const handleNext = () => {
    try {
      console.log('➡️ Navigating to rewards page')
      // Use window.location as router.push is hanging
      window.location.href = '/preview/rewards'
    } catch (error) {
      console.error('❌ Navigation error:', error)
    }
  }

  // Show loading state while data is being fetched (skip in demo mode)
  if (!isDemoMode && loading) return <div>Loading...</div>
  if (!isDemoMode && !data) return null

  // Prepare weight entries for statistics calculation
  // Demo mode uses different data source than normal mode
  let weightEntries: WeightEntry[] = []
  
  if (isDemoMode && displayData && 'weights' in displayData && displayData.weights) {
    // Demo mode: use weights array with date field from getDemoData('progress')
    // Demo data has 4 entries with ISO date strings
    weightEntries = displayData.weights.map((item: any) => ({
      weight: item.weight,
      date: item.date, // ISO date string
      timestamp: item.date ? new Date(item.date).getTime() : undefined // Convert to timestamp
    }))
  } else {
    // Normal mode: use SAMPLE_PROGRESS_DATA with date field
    // Replace first day's weight with actual weight from localStorage if available
    weightEntries = SAMPLE_PROGRESS_DATA.map((item, index) => ({
      weight: index === 0 && data && data.weight > 0 ? data.weight : item.weight,
      date: item.date, // Date string like '2024-01-01'
      timestamp: item.date ? new Date(item.date).getTime() : undefined // Convert to timestamp
    }))
  }

  // Sort weights by date/timestamp (oldest first) for consistent display
  // This ensures statistics are calculated correctly regardless of array order
  // See BUG-005: Statistics calculation fix
  const sortedWeights = sortWeightsByDate(weightEntries)

  // Calculate statistics using helper functions (by timestamp, not array position)
  // These functions find earliest/latest by timestamp, not by array index
  // This fixes the bug where statistics were wrong if data wasn't sorted
  const startingWeight = getStartingWeight(sortedWeights) // Earliest weight by timestamp
  const currentWeight = getCurrentWeight(sortedWeights)   // Latest weight by timestamp
  const weightChange = calculateWeightChange(currentWeight, startingWeight) // Current - Starting

  // Calculate average weight across all entries
  const averageWeight = sortedWeights.length > 0
    ? sortedWeights.reduce((sum: number, item: WeightEntry) => sum + item.weight, 0) / sortedWeights.length
    : 0

  // Calculate days completed (number of weight entries)
  const daysCompleted = sortedWeights.length

  // Log for debugging - helps verify calculations are correct
  console.log('📊 === STATISTICS CALCULATION START ===')
  console.log('Raw weight entries:', weightEntries)
  console.log('Sorted weights:', sortedWeights)
  console.log('Starting Weight:', startingWeight, 'kg')
  console.log('Current Weight:', currentWeight, 'kg')
  console.log('Weight Change:', weightChange, 'kg')
  console.log('Average Weight:', averageWeight.toFixed(1), 'kg')
  console.log('Days Completed:', daysCompleted)
  console.log('📊 === STATISTICS CALCULATION END ===')

  // Prepare chart data (sorted by date)
  // Chart uses "Day 1", "Day 2", etc. as labels
  // Weight values are plotted on y-axis
  const chartData = sortedWeights.map((item, index) => ({
    day: `Day ${index + 1}`, // Chart label
    weight: item.weight // Chart value
  }))

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

      <PreviewBanner currentStep={4} totalSteps={TOTAL_STEPS} />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Tooltip */}
        {showTooltip && (
          <PreviewTooltip
            title="Visualize your journey!"
            description="This shows how your weight changes over the 7 days. We've added sample data to show you what it looks like in action."
            onDismiss={() => setShowTooltip(false)}
          />
        )}

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-50 mb-2 transition-colors duration-200">
            Your Progress 📈
          </h1>
          <p className="text-gray-600 dark:text-neutral-300 transition-colors duration-200">
            See your weight journey visualized
          </p>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-4 transition-colors duration-200">
            7-Day Weight Progress
          </h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-lg p-4 shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <p className="text-xs text-gray-600 dark:text-neutral-400 mb-1 transition-colors duration-200">Starting</p>
            <p className="text-lg font-bold text-gray-900 dark:text-neutral-50 transition-colors duration-200">
              {startingWeight !== null ? `${startingWeight.toFixed(1)} kg` : 'N/A'}
            </p>
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-lg p-4 shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <p className="text-xs text-gray-600 dark:text-neutral-400 mb-1 transition-colors duration-200">Current</p>
            <p className="text-lg font-bold text-gray-900 dark:text-neutral-50 transition-colors duration-200">
              {currentWeight !== null ? `${currentWeight.toFixed(1)} kg` : 'N/A'}
            </p>
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-lg p-4 shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <p className="text-xs text-gray-600 dark:text-neutral-400 mb-1 transition-colors duration-200">Average</p>
            <p className="text-lg font-bold text-gray-900 dark:text-neutral-50 transition-colors duration-200">
              {averageWeight > 0 ? `${averageWeight.toFixed(1)} kg` : 'N/A'}
            </p>
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-lg p-4 shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <p className="text-xs text-gray-600 dark:text-neutral-400 mb-1 transition-colors duration-200">Change</p>
            <p className={`text-lg font-bold transition-colors duration-200 ${weightChange < 0 ? 'text-green-600 dark:text-green-500' : weightChange > 0 ? 'text-orange-600 dark:text-orange-500' : 'text-gray-600 dark:text-neutral-400'}`}>
              {weightChange !== 0
                ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`
                : '0.0 kg'}
            </p>
            {weightChange !== 0 && (
              <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1 transition-colors duration-200">
                {weightChange < 0 ? '↓ Lost' : '↑ Gained'}
              </p>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors duration-200">
          <p className="text-sm text-blue-800 dark:text-blue-200 transition-colors duration-200">
            📊 This is sample data showing what your real progress will look like over 7 days.
            Your actual results will be based on your daily weight-ins!
          </p>
        </div>

        {/* Step Indicator */}
        <PreviewStepIndicator currentStep={3} totalSteps={TOTAL_STEPS} />

        {/* Navigation */}
        <PreviewNavigation
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </div>
  )
}


