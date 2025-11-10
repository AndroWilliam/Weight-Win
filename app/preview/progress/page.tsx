'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PreviewBanner } from '@/components/preview/PreviewBanner'
import { PreviewTooltip } from '@/components/preview/PreviewTooltip'
import { PreviewStepIndicator } from '@/components/preview/PreviewStepIndicator'
import { PreviewNavigation } from '@/components/preview/PreviewNavigation'
import { usePreviewData } from '@/hooks/usePreviewData'
import { SAMPLE_PROGRESS_DATA } from '@/lib/preview/previewData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const TOTAL_STEPS = 5

export default function PreviewProgressPage() {
  const router = useRouter()
  const { data, loading, updateData } = usePreviewData()
  const [showTooltip, setShowTooltip] = useState(true)

  // ✅ NEW: Guard flag to prevent infinite localStorage loop
  const [hasUpdatedStep, setHasUpdatedStep] = useState(false)

  useEffect(() => {
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

    // Check if we have required data
    if (!data || !data.weight) {
      console.log('❌ No weight data found, redirecting to weight-check')
      window.location.href = '/preview/weight-check'
      return
    }

    // ✅ FIX: Check if currentStep is already 4
    if (data.currentStep === 4) {
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

  // Show loading state while data is being fetched
  if (loading) return <div>Loading...</div>
  if (!data) return null

  // Update first day with actual weight if valid, otherwise keep sample data
  const chartData = SAMPLE_PROGRESS_DATA.map((item, index) =>
    index === 0 && data.weight > 0 ? { ...item, weight: data.weight } : item
  )

  // Use chart data for calculations to ensure consistency
  const startingWeight = chartData[0].weight
  const currentWeight = chartData[chartData.length - 1].weight
  const averageWeight = chartData.reduce((sum, item) => sum + item.weight, 0) / chartData.length
  const totalChange = currentWeight - startingWeight

  return (
    <div className="min-h-screen bg-gray-50">
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
              {startingWeight.toFixed(1)} kg
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Current</p>
            <p className="text-lg font-bold text-gray-900">
              {currentWeight.toFixed(1)} kg
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Average</p>
            <p className="text-lg font-bold text-gray-900">
              {averageWeight.toFixed(1)} kg
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Change</p>
            <p className={`text-lg font-bold ${totalChange < 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)} kg
            </p>
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


