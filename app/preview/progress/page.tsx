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
 * Weight entry type for statistics calculation
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
  let weightEntries: WeightEntry[] = []
  
  if (isDemoMode && displayData && 'weights' in displayData && displayData.weights) {
    // Demo mode: use weights array with date field
    weightEntries = displayData.weights.map((item: any) => ({
      weight: item.weight,
      date: item.date,
      timestamp: item.date ? new Date(item.date).getTime() : undefined
    }))
  } else {
    // Normal mode: use SAMPLE_PROGRESS_DATA with date field
    weightEntries = SAMPLE_PROGRESS_DATA.map((item, index) => ({
      weight: index === 0 && data && data.weight > 0 ? data.weight : item.weight,
      date: item.date,
      timestamp: item.date ? new Date(item.date).getTime() : undefined
    }))
  }

  // Sort weights by date/timestamp (oldest first) for consistent display
  const sortedWeights = sortWeightsByDate(weightEntries)

  // Calculate statistics using helper functions (by timestamp, not array position)
  const startingWeight = getStartingWeight(sortedWeights)
  const currentWeight = getCurrentWeight(sortedWeights)
  const weightChange = calculateWeightChange(currentWeight, startingWeight)

  // Calculate average weight
  const averageWeight = sortedWeights.length > 0
    ? sortedWeights.reduce((sum: number, item: WeightEntry) => sum + item.weight, 0) / sortedWeights.length
    : 0

  // Calculate days completed
  const daysCompleted = sortedWeights.length

  // Log for debugging
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
  const chartData = sortedWeights.map((item, index) => ({
    day: `Day ${index + 1}`,
    weight: item.weight
  }))

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Progress 📈
          </h1>
          <p className="text-gray-600">
            See your weight journey visualized
          </p>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Starting</p>
            <p className="text-lg font-bold text-gray-900">
              {startingWeight !== null ? `${startingWeight.toFixed(1)} kg` : 'N/A'}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Current</p>
            <p className="text-lg font-bold text-gray-900">
              {currentWeight !== null ? `${currentWeight.toFixed(1)} kg` : 'N/A'}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Average</p>
            <p className="text-lg font-bold text-gray-900">
              {averageWeight > 0 ? `${averageWeight.toFixed(1)} kg` : 'N/A'}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Change</p>
            <p className={`text-lg font-bold ${weightChange < 0 ? 'text-green-600' : weightChange > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
              {weightChange !== 0 
                ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`
                : '0.0 kg'}
            </p>
            {weightChange !== 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {weightChange < 0 ? '↓ Lost' : '↑ Gained'}
              </p>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
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


