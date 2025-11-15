'use client'

/**
 * OCR PROCESSING PAGE - Preview Flow Step 2
 * ==========================================
 * 
 * PURPOSE:
 * Simulates OCR (Optical Character Recognition) processing of the scale photo.
 * Extracts weight value from photo and stores it for use in dashboard/progress.
 * 
 * STORAGE OPERATIONS:
 * - Reads:
 *   1. 'weightwin_preview_data' (localStorage): Gets preview data including photo
 *      Structure: PreviewData {
 *        photoBase64: string (base64-encoded image from weight-check step)
 *        photoTimestamp: string (ISO date string)
 *        weight: number (0 initially, updated here)
 *        ...other fields
 *      }
 * 
 * - Writes:
 *   1. 'weightwin_preview_data' (localStorage): Updates weight field after OCR
 *      Updates: { weight: number (extracted weight value) }
 * 
 * NAVIGATION:
 * - Previous: /preview/weight-check (back button)
 * - Next: /preview/dashboard (after processing complete)
 * - Redirect: /preview/weight-check (if no photo data found)
 * 
 * USER FLOW:
 * 1. Page loads and checks for photo data in localStorage
 * 2. If no photo → Redirect to weight-check (user must capture photo first)
 * 3. If photo exists → Show processing animation
 * 4. Call /api/preview/ocr endpoint with photo base64
 * 5. Simulate OCR processing (2-3 seconds delay)
 * 6. Extract weight from photo (simulated in preview mode)
 * 7. Update preview data with extracted weight
 * 8. Store weight in localStorage
 * 9. Navigate to dashboard
 * 
 * OCR SIMULATION:
 * In preview mode, OCR is simulated with:
 * - API call to /api/preview/ocr endpoint
 * - Random weight between 70-80 kg (for demo purposes)
 * - 2-second processing delay for realistic UX
 * - Success rate: 100% (no errors in preview)
 * 
 * NOTE: Real OCR integration would happen here in production
 * using a service like Google Cloud Vision API or Tesseract.js
 * See: lib/ocr/google-vision.ts for production OCR implementation
 * 
 * DATA VALIDATION:
 * - Photo must exist in localStorage (photoBase64 field)
 * - Weight must be extracted successfully from API response
 * - Weight must be a valid number > 0
 * - Guard flag prevents infinite loops (hasProcessed)
 * 
 * GUARD FLAGS:
 * - hasProcessed: Prevents OCR from running multiple times
 * - If weight already exists in data, skip OCR and show success screen
 * - This prevents infinite loops when component re-renders
 * 
 * DEMO MODE:
 * - When ?demo=true: Uses predefined weight value from getDemoData('ocr')
 * - Skips photo validation
 * - Skips API call
 * - Still shows processing animation for consistency
 * - See: hooks/useDemoMode.ts and lib/preview/demoData.ts
 * 
 * RELATED FILES:
 * - /preview/weight-check (previous step, stores photo)
 * - /preview/dashboard (next step, displays weight)
 * - /api/preview/ocr (OCR processing endpoint)
 * - lib/ocr/google-vision.ts (production OCR implementation)
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { PreviewBanner } from '@/components/preview/PreviewBanner'
import { PreviewStepIndicator } from '@/components/preview/PreviewStepIndicator'
import { usePreviewData } from '@/hooks/usePreviewData'
import { useDemoMode } from '@/hooks/useDemoMode'
import { getDemoData } from '@/lib/preview/demoData'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const TOTAL_STEPS = 5

export default function PreviewOCRProcessingPage() {
  const router = useRouter()
  const { data, loading, updateData } = usePreviewData()
  const { isDemoMode } = useDemoMode()

  const [processing, setProcessing] = useState(true)
  const [weight, setWeight] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ✅ NEW: Guard flag to prevent infinite loop
  const [hasProcessed, setHasProcessed] = useState(false)

  // Use demo data if in demo mode
  const displayData = isDemoMode ? getDemoData('ocr') : data

  useEffect(() => {
    // Log demo mode status and skip processing
    if (isDemoMode) {
      console.log('🎭 Demo mode active - using sample data for OCR')
      console.log('📊 Demo data:', displayData)
      // Show demo result immediately
      setWeight(displayData?.weight || 0)
      setProcessing(false)
      setHasProcessed(true)
      return
    }

    // Wait for data to load from localStorage
    // usePreviewData hook loads 'weightwin_preview_data' from localStorage
    if (loading) {
      console.log('⏳ Waiting for preview data to load...')
      return
    }

    console.log('📊 Preview data loaded:', data ? 'Data found' : 'No data')

    // ✅ FIX: If we already processed, don't process again
    // Guard flag prevents infinite loops when component re-renders
    if (hasProcessed) {
      console.log('⏭️ Already processed, skipping OCR call')
      return
    }

    // Check if we have photo data AFTER loading is complete (skip validation in demo mode)
    // Photo data is required - without it, we can't process OCR
    if (!isDemoMode && !data?.photoBase64) {
      console.log('❌ No photo data found, redirecting back to weight-check')
      window.location.href = '/preview/weight-check'
      return
    }

    // ✅ FIX: If weight already exists in data, OCR was already completed
    // This handles page refresh or direct navigation to this page
    // If weight > 0, OCR was successful in a previous visit
    if (data && data.weight && data.weight > 0) {
      console.log('✅ Weight already exists in localStorage:', data.weight, 'kg')
      console.log('⏭️ Skipping OCR processing, showing success screen')
      setHasProcessed(true)
      setWeight(data.weight)
      setProcessing(false)
      return
    }

    console.log('✅ Photo data found, starting OCR processing (first time)')

    // ✅ FIX: Mark as processed BEFORE calling processImage
    setHasProcessed(true)

    // Process with OCR (will only happen once)
    processImage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data, hasProcessed])

  const processImage = async () => {
    try {
      setProcessing(true)
      setError(null)

      console.log('🔄 Starting OCR processing for preview')

      // Validate photo data exists before making API call
      // This should never happen due to earlier checks, but good to be safe
      if (!data?.photoBase64) {
        throw new Error('No photo data found in preview localStorage')
      }

      // Call PREVIEW OCR API (not the authenticated endpoint)
      // This endpoint doesn't require authentication and has rate limiting
      // See: app/api/preview/ocr/route.ts
      const ocrResponse = await fetch('/api/preview/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageBase64: data.photoBase64
        })
      })

      console.log('📡 OCR API response status:', ocrResponse.status)

      if (!ocrResponse.ok) {
        const errorData = await ocrResponse.json().catch(() => ({}))
        console.error('❌ OCR API error:', errorData)
        throw new Error(errorData.error?.message || 'OCR processing failed')
      }

      const result = await ocrResponse.json()
      console.log('✅ OCR result:', result)

      if (!result.data?.success || !result.data?.weight) {
        throw new Error('No weight detected in image')
      }

      // Success! Save weight to preview data
      const detectedWeight = parseFloat(result.data.weight)
      setWeight(detectedWeight)

      console.log('💾 Saving weight to localStorage:', detectedWeight)

      updateData({
        weight: detectedWeight,
        weightUnit: 'kg',
        currentStep: 2
      })

      // Wait to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100))

      console.log('✅ Weight saved to localStorage, OCR complete')

      setProcessing(false)

    } catch (error: any) {
      console.error('❌ OCR processing error:', error)
      setError(error.message || 'Failed to process image')
      setProcessing(false)

      toast.error('Could not read weight', {
        description: 'Make sure your scale display is clearly visible'
      })
    }
  }

  const handleContinue = () => {
    console.log('✅ [OCRProcessing] OCR complete, navigating to dashboard')
    window.location.href = '/preview/dashboard'
  }

  const handleRetry = () => {
    console.log('🔄 [OCRProcessing] Retrying, navigating back to weight-check')
    window.location.href = '/preview/weight-check'
  }

  if (processing) {
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

        <PreviewBanner currentStep={2} totalSteps={TOTAL_STEPS} />

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-50 transition-colors duration-200">
              🤖 AI is reading your scale...
            </h1>

            {/* Image Preview */}
            {displayData?.photoBase64 && (
              <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-700 transition-colors duration-200">
                <img
                  src={displayData.photoBase64}
                  alt="Your scale"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}

            {/* Loading */}
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-gray-600 dark:text-neutral-300 transition-colors duration-200">Processing your image...</p>
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors duration-200">
              <p className="text-sm text-blue-800 dark:text-blue-200 transition-colors duration-200">
                ✨ Our AI analyzes your scale photo<br />
                No manual entry needed - just snap and go!
              </p>
            </div>
          </div>

          <PreviewStepIndicator currentStep={1} totalSteps={TOTAL_STEPS} />
        </div>
      </div>
    )
  }

  if (error) {
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

        <PreviewBanner currentStep={2} totalSteps={TOTAL_STEPS} />

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-6">
            <AlertTriangle className="h-16 w-16 text-orange-600 dark:text-orange-500 mx-auto transition-colors duration-200" />

            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-50 mb-2 transition-colors duration-200">
                Could not detect weight
              </h1>
              <p className="text-gray-600 dark:text-neutral-300 transition-colors duration-200">
                Make sure your scale display is clearly visible and try again
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={handleRetry} className="w-full">
                Try Another Photo
              </Button>
              <Button 
                variant="outline" 
                onClick={handleContinue}
                className="w-full"
              >
                Skip and Continue Demo
              </Button>
            </div>
          </div>

          <PreviewStepIndicator currentStep={1} totalSteps={TOTAL_STEPS} />
        </div>
      </div>
    )
  }

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

      <PreviewBanner currentStep={2} totalSteps={TOTAL_STEPS} />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-6">
          <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-500 mx-auto transition-colors duration-200" />

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-50 mb-2 transition-colors duration-200">
              ✅ Weight Detected!
            </h1>
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-500 my-4 transition-colors duration-200">
              {weight} kg
            </p>
          </div>

          {/* Image with highlight */}
          {displayData?.photoBase64 && (
            <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-700 transition-colors duration-200">
              <img
                src={displayData.photoBase64}
                alt="Your scale with detected weight"
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          {/* Success message */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 transition-colors duration-200">
            <p className="text-sm text-green-800 dark:text-green-200 transition-colors duration-200">
              🎉 Perfect! We found your weight in just 2 seconds.<br />
              Let&apos;s see this in your dashboard!
            </p>
          </div>

          <Button onClick={handleContinue} className="w-full" size="lg">
            Continue to Dashboard →
          </Button>
        </div>

        <PreviewStepIndicator currentStep={1} totalSteps={TOTAL_STEPS} />
      </div>
    </div>
  )
}


