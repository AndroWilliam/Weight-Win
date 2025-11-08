'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Upload, Loader2 } from 'lucide-react'
import { PreviewBanner } from '@/components/preview/PreviewBanner'
import { PreviewTooltip } from '@/components/preview/PreviewTooltip'
import { PreviewStepIndicator } from '@/components/preview/PreviewStepIndicator'
import { PreviewNavigation } from '@/components/preview/PreviewNavigation'
import { Button } from '@/components/ui/button'
import { usePreviewData } from '@/hooks/usePreviewData'
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
      // Convert image to base64
      const reader = new FileReader()
      
      reader.onload = async () => {
        const base64String = reader.result as string
        
        // Update preview data with photo
        updateData({
          photoBase64: base64String,
          photoTimestamp: new Date().toISOString(),
          currentStep: 1
        })

        // Navigate to OCR processing page
        router.push('/preview/ocr-processing')
      }

      reader.onerror = () => {
        toast.error('Failed to process image')
        setIsProcessing(false)
      }

      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Error processing image:', error)
      toast.error('Failed to process image')
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


