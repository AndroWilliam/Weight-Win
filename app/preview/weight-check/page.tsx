'use client'

/**
 * WEIGHT CHECK PAGE - Preview Flow Step 1
 * ========================================
 * 
 * PURPOSE:
 * This page allows users to capture their scale weight by taking a photo.
 * The photo is stored for OCR processing, and user proceeds to OCR page.
 * 
 * STORAGE OPERATIONS:
 * - Reads: None (first step in flow, initializes data if needed)
 * - Writes:
 *   1. 'weightwin_preview_data' (localStorage): Stores preview session data
 *      Structure: PreviewData {
 *        photoBase64: string (base64-encoded image, can be large)
 *        photoTimestamp: string (ISO date string)
 *        currentStep: number (1)
 *        weight: number (0 initially, updated in OCR step)
 *        weightUnit: 'kg' | 'lb'
 *        streakCount: number
 *        sessionStarted: string (ISO date string)
 *        tourCompleted: boolean
 *        firstStepBadgeEarned: boolean
 *      }
 * 
 * NAVIGATION:
 * - Previous: / (homepage) or /preview (via preview banner exit)
 * - Next: /preview/ocr-processing (after photo captured)
 * 
 * USER FLOW:
 * 1. User arrives at weight-check page
 * 2. Page initializes preview data if not exists (via usePreviewData hook)
 * 3. User clicks "Take Photo" or uploads image from gallery
 * 4. Photo is validated (size < 10MB, image type)
 * 5. Photo is converted to base64 string
 * 6. Preview data is saved to localStorage with photoBase64
 * 7. Data is verified to ensure it was saved correctly
 * 8. User clicks "Continue" → Navigate to OCR processing
 * 
 * DATA VALIDATION:
 * - Photo must be captured before continuing
 * - Photo size must be under 10MB (to avoid localStorage limits)
 * - Only image formats accepted (image/*)
 * - Base64 conversion must succeed
 * - localStorage save must be verified before navigation
 * 
 * STORAGE NOTES:
 * - Uses localStorage instead of cookies because base64 images exceed 4KB cookie limit
 * - localStorage supports 5-10MB which is needed for base64-encoded images
 * - Data persists until manually cleared or expires (2 days)
 * - Storage key: 'weightwin_preview_data' (from PREVIEW_COOKIE_NAME constant)
 * 
 * DEMO MODE:
 * - When ?demo=true: Uses sample photo data from getDemoData('ocr')
 * - Skips photo capture requirement
 * - Still navigates through flow normally
 * - See: hooks/useDemoMode.ts and lib/preview/demoData.ts
 * 
 * RELATED FILES:
 * - /preview/ocr-processing (next step, reads photo data)
 * - components/preview/PreviewBanner.tsx (exit demo button)
 * - hooks/usePreviewData.ts (data management hook)
 * - lib/preview/previewCookies.ts (localStorage utilities)
 */

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Upload, Loader2 } from 'lucide-react'
import { PreviewBanner } from '@/components/preview/PreviewBanner'
import { PreviewTooltip } from '@/components/preview/PreviewTooltip'
import { PreviewStepIndicator } from '@/components/preview/PreviewStepIndicator'
import { PreviewNavigation } from '@/components/preview/PreviewNavigation'
import { Button } from '@/components/ui/button'
import { usePreviewData } from '@/hooks/usePreviewData'
import { getPreviewData } from '@/lib/preview/previewCookies'
import { toast } from 'sonner'

const TOTAL_STEPS = 5

export default function PreviewWeightCheckPage() {
  const router = useRouter()
  const { data, updateData, initializeData } = usePreviewData()
  
  const [showTooltip, setShowTooltip] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Initialize preview data if not exists
    // This ensures we have a valid PreviewData object in localStorage
    // before the user starts the flow
    if (!data) {
      initializeData()
    }
  }, [data, initializeData])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (!file) return

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Please choose an image under 10MB'
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file (JPG, PNG, etc.)'
      })
      return
    }

    setSelectedFile(file)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleNext = async () => {
    if (!selectedFile) {
      toast.error('Please upload a scale photo first')
      return
    }

    setIsProcessing(true)

    try {
      // Step 1: Convert image to base64
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
          const result = reader.result as string
          resolve(result)
        }

        reader.onerror = () => {
          reject(new Error('Failed to read file'))
        }

        reader.readAsDataURL(selectedFile)
      })

      console.log('✅ Image converted to base64, size:', base64String.length, 'bytes')

      // Step 2: Save to localStorage FIRST (before navigation)
      // Note: Using localStorage instead of cookies because cookies have 4KB limit
      // Base64-encoded images can be several MB, exceeding cookie storage limits
      const previewData = {
        photoBase64: base64String, // Base64-encoded image string (large, can be 1-5MB)
        photoTimestamp: new Date().toISOString(), // ISO date string for when photo was taken
        currentStep: 1, // Current step in preview flow (1 = weight-check)
        weight: 0, // Will be updated in OCR step when weight is extracted
        weightUnit: 'kg' as const, // Default unit, can be changed by user
        streakCount: 1, // Starting streak count
        sessionStarted: data?.sessionStarted || new Date().toISOString(), // When preview session started
        tourCompleted: false, // Whether user completed the preview tour
        firstStepBadgeEarned: false // Whether first step badge was earned
      }

      // Save to localStorage via usePreviewData hook
      // This updates the 'weightwin_preview_data' key in localStorage
      // The hook handles serialization and error handling
      updateData(previewData)

      console.log('✅ Preview data saved to localStorage')

      // Step 3: Wait a moment to ensure storage is written
      await new Promise(resolve => setTimeout(resolve, 100))

      // Step 4: Verify data was saved successfully
      // This is critical - we must ensure data is persisted before navigation
      // Otherwise, the OCR page won't have the photo data
      const savedData = getPreviewData()
      if (!savedData || !savedData.photoBase64) {
        throw new Error('Failed to save preview data to localStorage. Please ensure your browser allows localStorage and is not in private/incognito mode.')
      }

      console.log('✅ Preview data verified, navigating to OCR page')

      // Step 5: Navigate to OCR processing
      console.log('📸 [WeightCheck] Navigating to OCR processing')
      window.location.href = '/preview/ocr-processing'

    } catch (error: any) {
      console.error('❌ Error in handleNext:', error)
      toast.error('Failed to process image', {
        description: error.message || 'Please try again'
      })
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Banner */}
      <PreviewBanner currentStep={1} totalSteps={TOTAL_STEPS} />

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Tooltip */}
        {showTooltip && (
          <div className="animate-in slide-in-from-top duration-300">
            <PreviewTooltip
              title="Let's start your journey!"
              description="Take a photo of your scale. Our AI will read the weight automatically. Try it now!"
              onDismiss={() => setShowTooltip(false)}
            />
          </div>
        )}

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            📸 Take Your First Photo
          </h1>
          <p className="text-gray-600">
            Upload a photo of your scale and watch the AI extract your weight
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 space-y-4">
          {previewUrl ? (
            // Show preview
            <div className="space-y-4">
              <img
                src={previewUrl}
                alt="Selected scale"
                className="w-full h-auto rounded-lg"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setPreviewUrl(null)
                  setSelectedFile(null)
                }}
              >
                Choose Different Photo
              </Button>
            </div>
          ) : (
            // Show upload options
            <div className="space-y-6">
              <div className="text-center py-8">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-6">
                  Take or upload a photo of your scale display
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    Take Photo
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    Upload from Gallery
                  </Button>
                </div>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <PreviewStepIndicator currentStep={0} totalSteps={TOTAL_STEPS} />

        {/* Navigation */}
        <PreviewNavigation
          onNext={handleNext}
          nextLabel={isProcessing ? 'Processing...' : 'Continue'}
          nextDisabled={!selectedFile || isProcessing}
          loading={isProcessing}
        />
      </div>
    </div>
  )
}


