"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { maybeCompressImage } from "@/lib/images/compress"
import { Camera, Upload, ArrowLeft, RotateCcw, Check, AlertCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { ManualWeightEntry } from "./ManualWeightEntry"
import { PhoneCollectionModal } from "./PhoneCollectionModal"
import { SkipWarningModal } from "./SkipWarningModal"
import { fetchWithTimeout, TIMEOUT_PRESETS, RETRY_PRESETS } from "@/lib/fetch-with-timeout"
import { toast } from "sonner"
import { logNetworkError, logOcrError } from "@/lib/error-logger"

// Camera error types
type CameraError =
  | 'permission-denied'
  | 'no-camera'
  | 'in-use'
  | 'unknown'

interface CameraErrorInfo {
  type: CameraError
  message: string
  action: string
}

// OCR error types
type OCRError = 
  | 'no-weight-found'
  | 'image-unclear'
  | 'invalid-weight'
  | 'processing-timeout'
  | 'api-error'

interface OCRErrorInfo {
  type: OCRError
  message: string
  suggestion: string
}

function getCameraErrorMessage(error: any): CameraErrorInfo {
  const errorMessage = error?.message?.toLowerCase() || ''
  const errorName = error?.name?.toLowerCase() || ''

  if (errorMessage.includes('permission') || errorMessage.includes('denied') || errorName === 'notallowederror') {
    return {
      type: 'permission-denied',
      message: 'Camera permission denied',
      action: 'Go to Settings → Safari → Camera and allow access, then refresh this page'
    }
  }

  if (errorMessage.includes('not found') || errorMessage.includes('no device') || errorName === 'notfounderror') {
    return {
      type: 'no-camera',
      message: 'No camera found',
      action: 'Make sure your device has a working camera'
    }
  }

  if (errorMessage.includes('in use') || errorMessage.includes('already') || errorName === 'notreadableerror') {
    return {
      type: 'in-use',
      message: 'Camera is already in use',
      action: 'Close other apps using the camera (like FaceTime or Zoom) and try again'
    }
  }

  return {
    type: 'unknown',
    message: 'Failed to access camera',
    action: 'Try refreshing the page or restarting your browser'
  }
}

function getOCRErrorMessage(error: any): OCRErrorInfo {
  const errorMsg = error?.message?.toLowerCase() || ''
  
  if (errorMsg.includes('no weight') || errorMsg.includes('not detected')) {
    return {
      type: 'no-weight-found',
      message: 'No weight number found in image',
      suggestion: 'Make sure the scale display is clearly visible and well-lit, then try again'
    }
  }

  if (errorMsg.includes('timeout')) {
    return {
      type: 'processing-timeout',
      message: 'Processing took too long',
      suggestion: 'The image may be too large or unclear. Try taking a new photo.'
    }
  }

  if (errorMsg.includes('invalid') || errorMsg.includes('unrealistic')) {
    return {
      type: 'invalid-weight',
      message: 'Detected weight seems unrealistic',
      suggestion: 'Please verify the image or enter the weight manually below'
    }
  }

  if (errorMsg.includes('unclear') || errorMsg.includes('blurry')) {
    return {
      type: 'image-unclear',
      message: 'Image is too unclear to read',
      suggestion: 'Try taking a clearer photo with better lighting'
    }
  }

  return {
    type: 'api-error',
    message: 'Failed to process image',
    suggestion: 'Try taking a new photo or enter the weight manually below'
  }
}

export function WeightCheckContent() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'camera' | 'preview' | 'processing' | 'success' | 'error'>('upload')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [weight, setWeight] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [cameraError, setCameraError] = useState<CameraErrorInfo | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [ocrError, setOcrError] = useState<OCRErrorInfo | null>(null)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [retryAttempt, setRetryAttempt] = useState(0)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [showSkipWarning, setShowSkipWarning] = useState(false)
  const [dayNumber, setDayNumber] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const day = searchParams.get('day') || '1'
  
  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.log('No authenticated user, redirecting to login')
          router.push('/auth/login')
          return
        }
        
        console.log('User authenticated:', user.id)
        setIsAuthChecking(false)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/login')
      }
    }
    
    checkAuth()
  }, [router])

  const handleTakePhoto = async () => {
    try {
      setIsCameraLoading(true)
      setCameraError(null) // Clear any previous errors
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      streamRef.current = stream
      setCurrentStep('camera')
      
      // Fallback timeout to prevent infinite loading
      const loadingTimeout = setTimeout(() => {
        console.log('Camera loading timeout - forcing display')
        // Automatically run the debug action
        if (videoRef.current && streamRef.current) {
          console.log('Auto-debug: Re-attaching stream and forcing play')
          videoRef.current.srcObject = streamRef.current
          videoRef.current.load()
          videoRef.current.play().then(() => {
            console.log('Auto-debug: Video started playing')
            setIsCameraLoading(false)
          }).catch((error) => {
            console.error('Auto-debug: Error playing video:', error)
            // Try one more time with different approach
            setTimeout(() => {
              if (videoRef.current && streamRef.current) {
                console.log('Auto-debug: Second attempt')
                videoRef.current.srcObject = null
                videoRef.current.srcObject = streamRef.current
                videoRef.current.play().then(() => {
                  console.log('Auto-debug: Second attempt successful')
                  setIsCameraLoading(false)
                }).catch((err) => {
                  console.error('Auto-debug: Second attempt failed:', err)
                  setIsCameraLoading(false)
                })
              }
            }, 500)
          })
        } else {
          setIsCameraLoading(false)
        }
      }, 3000) // Reduced timeout to 3 seconds
      
      // Wait for the next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Setting up video element with stream')
          videoRef.current.srcObject = stream
          
          // Force video to load
          videoRef.current.load()
          
          // Try to play immediately
          videoRef.current.play().then(() => {
            console.log('Video started playing immediately')
            clearTimeout(loadingTimeout)
            setIsCameraLoading(false)
          }).catch((error) => {
            console.log('Immediate play failed, waiting for metadata:', error)
          })
          
          // Add event listeners for video loading
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
            clearTimeout(loadingTimeout)
            videoRef.current?.play().then(() => {
              console.log('Video started playing after metadata')
              setIsCameraLoading(false)
            }).catch((error) => {
              console.error('Error playing video after metadata:', error)
              setIsCameraLoading(false)
            })
          }
          
          videoRef.current.oncanplay = () => {
            console.log('Video can play')
            clearTimeout(loadingTimeout)
            setIsCameraLoading(false)
          }
          
          videoRef.current.onplaying = () => {
            console.log('Video is playing')
            clearTimeout(loadingTimeout)
            setIsCameraLoading(false)
          }
          
          videoRef.current.onerror = (error) => {
            console.error('Video error:', error)
            clearTimeout(loadingTimeout)
            setIsCameraLoading(false)
            alert('Error loading camera feed. Please try again.')
          }
          
          // Additional fallback - try again after 1 second
          setTimeout(() => {
            if (isCameraLoading && videoRef.current && streamRef.current) {
              console.log('Fallback: Re-attaching stream after 1 second')
              videoRef.current.srcObject = streamRef.current
              videoRef.current.load()
              videoRef.current.play().then(() => {
                console.log('Fallback: Video started playing')
                setIsCameraLoading(false)
              }).catch((error) => {
                console.error('Fallback: Error playing video:', error)
              })
            }
          }, 1000)
        }
      }, 100)
    } catch (error) {
      console.error('Error accessing camera:', error)
      setIsCameraLoading(false)
      const errorInfo = getCameraErrorMessage(error)
      setCameraError(errorInfo)
    }
  }

  const handleUploadPhoto = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null)
    const file = event.target.files?.[0]

    if (!file) return

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB. Please choose a smaller image.')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file (JPG, PNG, etc.)')
      return
    }

    try {
      setIsProcessing(true)
      
      // Compress with timeout (30 seconds)
      const compressedFile = await Promise.race([
        maybeCompressImage(file),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Compression timeout')), 30000)
        )
      ]) as File

      const reader = new FileReader()
      reader.onloadend = () => {
        setCapturedImage(reader.result as string)
        setCurrentStep('preview')
        setIsProcessing(false)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error: any) {
      setIsProcessing(false)
      if (error.message === 'Compression timeout') {
        setUploadError('Image processing timed out. Try a smaller image.')
      } else if (error.message?.includes('compression')) {
        setUploadError('Failed to compress image. Try another photo.')
      } else {
        setUploadError('Failed to process image. Please try again.')
      }
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // Draw the video frame to canvas (mirrored for consistency)
        context.save()
        context.scale(-1, 1)
        context.drawImage(video, -video.videoWidth, 0, video.videoWidth, video.videoHeight)
        context.restore()
        
        // Convert to image data
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageData)
        setCurrentStep('preview')
        
        // Stop camera
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      } else {
        console.error('Video not ready for capture')
        alert('Camera not ready. Please try again.')
      }
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setCurrentStep('upload')
  }

  const handleUsePhoto = async () => {
    if (capturedImage) {
      setOcrError(null)
      setShowManualEntry(false)
      setIsProcessing(true)
      setCurrentStep('processing')
      setRetryAttempt(0)
      
      try {
        // Upload image to Supabase Storage
        const timestamp = new Date().getTime()
        const fileName = `weight-${timestamp}.jpg`
        const filePath = `weights/${fileName}`
        
        // Convert base64 to blob
        const response = await fetch(capturedImage)
        const blob = await response.blob()
        
        // Get current user for authenticated upload
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.error('User not authenticated during photo upload')
          throw new Error('Please log in to continue')
        }
        
        // Upload to Supabase Storage
        const userPath = `${user.id}/${fileName}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('weight-photos')
          .upload(userPath, blob)
        
        if (uploadError) {
          throw uploadError
        }
        
        const photoUrl = uploadData.path

        // Process with OCR using fetchWithTimeout with retry
        const ocrRes = await fetchWithTimeout(
          '/api/weight/process',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              imageBase64: capturedImage,
              photoUrl
            })
          },
          TIMEOUT_PRESETS.LONG, // 30s timeout for OCR
          {
            retry: RETRY_PRESETS.PATIENT, // 3 attempts with exponential backoff
            onRetry: (attempt, delay, error) => {
              setRetryAttempt(attempt)
              toast.info(`Retrying... (Attempt ${attempt}/3)`, {
                description: 'The request is taking longer than expected',
                duration: 3000
              })
            }
          }
        )
        
        const result = await ocrRes.json()
        
        console.log('OCR API Response:', result)
        
        // If error includes debug details, log them
        if (result.error?.details?.rawText) {
          console.log('🔍 RAW OCR TEXT FROM GOOGLE VISION:', result.error.details.rawText)
        }
        
        if (!ocrRes.ok || !result.success) {
          const errorMsg = result.error?.message || result.error || 'Failed to process weight'
          console.error('OCR failed with error:', errorMsg)
          
          const errorInfo = getOCRErrorMessage(new Error(errorMsg))
          setOcrError(errorInfo)
          setShowManualEntry(true)
          setIsProcessing(false)
          setCurrentStep('preview')
          return
        }
        
        // Success - show success state
        setWeight(result.data.weight)
        setDayNumber(result.data.dayNumber)
        setCurrentStep('success')
        setIsProcessing(false)

        // Check if a new badge was earned and store for notification
        if (result.data.newBadgeEarned && result.data.badgeName) {
          localStorage.setItem('newBadgeEarned', JSON.stringify({
            name: result.data.badgeName,
            icon: result.data.badgeIcon || '🏆'
          }))
        }

        // Phase 2: Check if Day 7 completed - show phone modal FIRST
        if (result.data.dayNumber === 7 && result.data.isNewDay) {
          // Show phone modal after success message (2 seconds)
          setTimeout(() => {
            setShowPhoneModal(true)
          }, 2000)
        } else {
          // Redirect to dashboard after showing success for non-Day-7 completions
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        }
        
      } catch (error: any) {
        console.error('Error processing weight:', error)
        setIsProcessing(false)
        setCurrentStep('preview')
        
        // Log errors for analytics
        if (error.message?.includes('offline') || error.message?.includes('network') || error.message?.includes('Connection lost')) {
          await logNetworkError('/api/weight/process', 'POST', error.message || 'Network error during OCR')
        } else {
          await logOcrError(error.message || 'OCR processing failed', {
            errorType: error.name,
            retryAttempts: retryAttempt
          })
        }
        
        if (error.name === 'AbortError') {
          const errorInfo: OCRErrorInfo = {
            type: 'processing-timeout',
            message: 'Processing took too long',
            suggestion: 'Try taking a new photo or enter the weight manually below'
          }
          setOcrError(errorInfo)
        } else {
          const errorInfo = getOCRErrorMessage(error)
          setOcrError(errorInfo)
        }
        
        setShowManualEntry(true)
      }
    }
  }

  const handleManualWeightSubmit = (weight: number) => {
    setWeight(weight)
    setOcrError(null)
    setShowManualEntry(false)
    setCurrentStep('success')
    
    // Redirect to dashboard after showing success
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  const handleCancelManualEntry = () => {
    setOcrError(null)
    setShowManualEntry(false)
    setCapturedImage(null)
    setCurrentStep('upload')
  }

  // Phase 2: Phone Collection Handlers
  const handlePhoneSubmit = async (phoneNumber: string) => {
    try {
      const response = await fetch('/api/user/phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone_number: phoneNumber })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to save phone number')
      }

      // Success - close phone modal and redirect to dashboard
      setShowPhoneModal(false)
      toast.success('Phone number saved successfully!')

      // Redirect to dashboard (badge modal will show there)
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error: any) {
      console.error('Phone save error:', error)
      throw error // Re-throw to let modal handle the error
    }
  }

  const handlePhoneSkip = () => {
    // Show warning modal
    setShowSkipWarning(true)
  }

  const handleSkipWarningBack = () => {
    // Return to phone input
    setShowSkipWarning(false)
  }

  const handleSkipWarningConfirm = () => {
    // Close all modals and redirect
    setShowSkipWarning(false)
    setShowPhoneModal(false)
    router.push('/dashboard')
  }

  const handleBack = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    router.push('/dashboard')
  }

  useEffect(() => {
    // Additional safety check - if we have a stream but no video, try to attach it
    const checkVideo = () => {
      if (streamRef.current && videoRef.current && !videoRef.current.srcObject) {
        console.log('Safety check: Attaching stream to video element')
        videoRef.current.srcObject = streamRef.current
        videoRef.current.play().then(() => {
          console.log('Safety check: Video started playing')
          setIsCameraLoading(false)
        }).catch((error) => {
          console.error('Safety check: Error playing video:', error)
        })
      }
    }
    
    const interval = setInterval(checkVideo, 1000)
    
    return () => {
      clearInterval(interval)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Show loading while checking auth
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    parseInt(day) > index ? 'bg-primary' : 'bg-border'
                  }`}
                ></div>
              ))}
            </div>
          </div>
          {/* Spacer to balance the back button */}
          <div style={{ width: '80px' }} />
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Day {day} Weight Check</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Take or upload a clear photo of your scale</p>
          </div>

          {/* Photo Tips Card */}
          <Card className="border-border mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Camera className="w-5 h-5 text-primary" />
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Photo Tips</h3>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>• Point camera directly down at the scale</li>
                <li>• Ensure good lighting so digits are clear</li>
                <li>• Make sure your weight is fully displayed</li>
                <li>• Avoid shadows covering the numbers</li>
              </ul>
            </CardContent>
          </Card>

          {/* Camera View */}
          {currentStep === 'camera' && (
            <Card className="border-border mb-6">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Camera Preview</h3>
                <div className="relative bg-muted rounded-lg overflow-hidden">
                  {isCameraLoading ? (
                    <div className="w-full h-48 sm:h-64 md:h-80 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Initializing camera...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-48 sm:h-64 md:h-80 object-cover"
                        style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
                        onLoadedMetadata={() => {
                          console.log('Video metadata loaded in JSX')
                          setIsCameraLoading(false)
                        }}
                        onCanPlay={() => {
                          console.log('Video can play in JSX')
                          setIsCameraLoading(false)
                        }}
                        onPlaying={() => {
                          console.log('Video is playing in JSX')
                          setIsCameraLoading(false)
                        }}
                        onError={(e) => {
                          console.error('Video error in JSX:', e)
                          setIsCameraLoading(false)
                        }}
                        onLoadStart={() => {
                          console.log('Video load started in JSX')
                        }}
                        onLoadedData={() => {
                          console.log('Video data loaded in JSX')
                          setIsCameraLoading(false)
                        }}
                      />
                      {/* Camera overlay with capture button */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <Button
                          onClick={capturePhoto}
                          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg"
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Capture Photo
                        </Button>
                      </div>
                      {/* Instructions overlay */}
                      <div className="absolute top-4 left-4 right-4">
                        <div className="bg-black bg-opacity-50 text-white p-3 rounded-lg">
                          <p className="text-sm font-medium">Position your scale in the center</p>
                          <p className="text-xs opacity-90">Make sure the weight is clearly visible</p>
                        </div>
                      </div>
                    </>
                  )}
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                </div>
                <div className="mt-4 text-center">
                  <Button
                    onClick={() => {
                      if (streamRef.current) {
                        streamRef.current.getTracks().forEach(track => track.stop())
                      }
                      setCurrentStep('upload')
                    }}
                    variant="outline"
                    className="border-border"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Error Display */}
          {uploadError && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 mb-6">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800 dark:text-red-200 text-sm">{uploadError}</h4>
                    <button 
                      onClick={() => setUploadError(null)} 
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline mt-2"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Area */}
          {currentStep === 'upload' && (
            <Card className="border-border mb-6">
              <CardContent className="p-6 sm:p-8">
                <div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center">
                  <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Take or upload your scale photo</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6">Make sure the weight digits are clearly visible</p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Button
                      onClick={handleTakePhoto}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTakePhoto()}
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-3"
                      aria-label="Take weight scale photo with camera"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button
                      onClick={handleUploadPhoto}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleUploadPhoto()}
                      variant="outline"
                      className="border-border px-6 py-3"
                      aria-label="Upload weight scale photo from device"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-4">Drag and drop your photo here, or click to browse</p>
                  <p className="text-xs text-muted-foreground/80 mt-2">JPG, PNG up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </CardContent>
            </Card>
          )}

          {/* Camera Error Display */}
          {cameraError && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-red-800 dark:text-red-200 mb-1">
                      {cameraError.message}
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                      {cameraError.action}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleTakePhoto}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                      </button>
                      <button
                        onClick={() => setCameraError(null)}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photo Preview */}
          {currentStep === 'preview' && capturedImage && (
            <>
              {/* Manual Weight Entry (if OCR failed) */}
              {showManualEntry && ocrError && (
                <ManualWeightEntry
                  errorMessage={ocrError.message}
                  errorSuggestion={ocrError.suggestion}
                  onSubmit={handleManualWeightSubmit}
                  onCancel={handleCancelManualEntry}
                />
              )}

              <Card className="border-border mb-6">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Review Photo</h3>
                  <div className="relative bg-muted rounded-lg overflow-hidden mb-4">
                    <img src={capturedImage} alt="Captured Weight" className="w-full h-auto object-cover rounded-lg" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Button
                      onClick={handleUsePhoto}
                      disabled={isProcessing}
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-3"
                    >
                      {isProcessing ? 'Processing...' : <><Check className="w-4 h-4 mr-2" />Use This Photo</>}
                    </Button>
                    <Button
                      onClick={handleRetake}
                      variant="outline"
                      disabled={isProcessing}
                      className="border-border px-6 py-3"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retake
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Processing State */}
          {currentStep === 'processing' && (
            <div className="text-center py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground text-base sm:text-lg">Analyzing your weight...</p>
              {retryAttempt > 0 && (
                <p className="text-sm text-orange-500 mt-2">
                  Retry attempt {retryAttempt}/3
                </p>
              )}
            </div>
          )}
          
          {/* Success State */}
          {currentStep === 'success' && (
            <Card className="border-green-300 bg-green-50 dark:bg-green-900/20 mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-2">Weight Recorded Successfully!</h3>
                  <p className="text-green-700 dark:text-green-400 text-2xl font-bold mb-2">{weight} kg</p>
                  <p className="text-green-600 dark:text-green-500">Redirecting to your progress...</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Error State */}
          {currentStep === 'error' && (
            <Card className="border-red-300 bg-red-50 dark:bg-red-900/20 mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">Unable to Read Weight</h3>
                  <p className="text-red-700 dark:text-red-400 whitespace-pre-line">{errorMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Phase 2: Phone Collection Modals */}
      <PhoneCollectionModal
        isOpen={showPhoneModal}
        onClose={() => {}}  // Prevent closing by clicking outside
        onSubmit={handlePhoneSubmit}
        onSkip={handlePhoneSkip}
      />

      <SkipWarningModal
        isOpen={showSkipWarning}
        onBack={handleSkipWarningBack}
        onConfirmSkip={handleSkipWarningConfirm}
      />
    </div>
  )
}
