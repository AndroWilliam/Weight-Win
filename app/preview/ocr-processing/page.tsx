'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { PreviewBanner } from '@/components/preview/PreviewBanner'
import { PreviewStepIndicator } from '@/components/preview/PreviewStepIndicator'
import { usePreviewData } from '@/hooks/usePreviewData'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const TOTAL_STEPS = 5

export default function PreviewOCRProcessingPage() {
  const router = useRouter()
  const { data, updateData } = usePreviewData()
  
  const [processing, setProcessing] = useState(true)
  const [weight, setWeight] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we have photo data
    if (!data?.photoBase64) {
      router.push('/preview/weight-check')
      return
    }

    // Process with OCR
    processImage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const processImage = async () => {
    try {
      setProcessing(true)
      setError(null)

      // Convert base64 to blob
      const response = await fetch(data!.photoBase64!)
      const blob = await response.blob()
      
      // Create FormData
      const formData = new FormData()
      formData.append('image', blob, 'scale-photo.jpg')

      // Call your existing OCR API
      const ocrResponse = await fetch('/api/weight/process', {
        method: 'POST',
        body: formData
      })

      if (!ocrResponse.ok) {
        throw new Error('OCR processing failed')
      }

      const result = await ocrResponse.json()

      if (!result.success || !result.weight) {
        throw new Error('No weight detected in image')
      }

      // Success! Save weight to preview data
      const detectedWeight = parseFloat(result.weight)
      setWeight(detectedWeight)

      updateData({
        weight: detectedWeight,
        weightUnit: 'kg',
        currentStep: 2
      })

      setProcessing(false)

    } catch (error: any) {
      console.error('OCR error:', error)
      setError(error.message || 'Failed to process image')
      setProcessing(false)
      
      toast.error('Could not read weight', {
        description: 'You can enter it manually in the next step'
      })
    }
  }

  const handleContinue = () => {
    router.push('/preview/dashboard')
  }

  const handleRetry = () => {
    router.push('/preview/weight-check')
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PreviewBanner currentStep={2} totalSteps={TOTAL_STEPS} />

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🤖 AI is reading your scale...
            </h1>

            {/* Image Preview */}
            {data?.photoBase64 && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <img
                  src={data.photoBase64}
                  alt="Your scale"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}

            {/* Loading */}
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-gray-600">Processing your image...</p>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
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
      <div className="min-h-screen bg-gray-50">
        <PreviewBanner currentStep={2} totalSteps={TOTAL_STEPS} />

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-6">
            <AlertTriangle className="h-16 w-16 text-orange-600 mx-auto" />
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Could not detect weight
              </h1>
              <p className="text-gray-600">
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
    <div className="min-h-screen bg-gray-50">
      <PreviewBanner currentStep={2} totalSteps={TOTAL_STEPS} />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-6">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ✅ Weight Detected!
            </h1>
            <p className="text-5xl font-bold text-blue-600 my-4">
              {weight} kg
            </p>
          </div>

          {/* Image with highlight */}
          {data?.photoBase64 && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <img
                src={data.photoBase64}
                alt="Your scale with detected weight"
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          {/* Success message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
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


