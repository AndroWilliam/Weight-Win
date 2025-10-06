"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { maybeCompressImage } from "@/lib/images/compress"
import { Camera, Upload, ArrowLeft, RotateCcw, Check, AlertCircle } from "lucide-react"

export function WeightCheckContent() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'camera' | 'preview' | 'processing' | 'success' | 'error'>('upload')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [weight, setWeight] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
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
      alert('Unable to access camera. Please check permissions.')
    }
  }

  const handleUploadPhoto = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        // Compress image if needed (already an image format)
        const compressedFile = await maybeCompressImage(file)
        
        const reader = new FileReader()
        reader.onloadend = () => {
          setCapturedImage(reader.result as string)
          setCurrentStep('preview')
        }
        reader.readAsDataURL(compressedFile)
      } catch (error) {
        console.warn('Compression failed, using original file:', error)
        const reader = new FileReader()
        reader.onloadend = () => {
          setCapturedImage(reader.result as string)
          setCurrentStep('preview')
        }
        reader.readAsDataURL(file)
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
      setIsProcessing(true)
      setCurrentStep('processing')
      
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
        
        // Process with OCR
        const ocrRes = await fetch('/api/weight/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageBase64: capturedImage,
            photoUrl
          })
        })
        
        const result = await ocrRes.json()
        
        console.log('OCR API Response:', result)
        
        // If error includes debug details, log them
        if (result.error?.details?.rawText) {
          console.log('🔍 RAW OCR TEXT FROM GOOGLE VISION:', result.error.details.rawText)
        }
        
        if (!ocrRes.ok || !result.success) {
          const errorMsg = result.error?.message || result.error || 'Failed to process weight'
          const rawText = result.error?.details?.rawText || 'No raw text available'
          console.error('OCR failed with error:', errorMsg)
          console.error('Raw text from OCR:', rawText)
          throw new Error(errorMsg + (rawText !== 'No raw text available' ? `\n\nRaw OCR text: "${rawText}"` : ''))
        }
        
        // Success - show success state
        setWeight(result.data.weight)
        setCurrentStep('success')
        setIsProcessing(false)
        
        // Redirect to progress page after showing success
        setTimeout(() => {
          router.push('/progress')
        }, 2000)
        
      } catch (error: any) {
        console.error('Error processing weight:', error)
        setIsProcessing(false)
        setCurrentStep('error')
        
        // Use the actual error message from the API or OCR
        const errorMsg = error.message || 'Failed to process weight. Please try again.'
        setErrorMessage(errorMsg)
        
        // Allow retry after showing error
        setTimeout(() => {
          setCurrentStep('preview')
          setErrorMessage(null)
        }, 3000)
      }
    }
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
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-neutral-300">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900"
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
                    parseInt(day) > index ? 'bg-primary-600' : 'bg-neutral-300'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Day {day} Weight Check</h1>
            <p className="text-neutral-600">Take or upload a clear photo of your scale</p>
          </div>

          {/* Photo Tips Card */}
          <Card className="border-neutral-300 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Camera className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-neutral-900">Photo Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li>• Point camera directly down at the scale</li>
                <li>• Ensure good lighting so digits are clear</li>
                <li>• Make sure your weight is fully displayed</li>
                <li>• Avoid shadows covering the numbers</li>
              </ul>
            </CardContent>
          </Card>

          {/* Camera View */}
          {currentStep === 'camera' && (
            <Card className="border-neutral-300 mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Camera Preview</h3>
                <div className="relative bg-neutral-100 rounded-lg overflow-hidden">
                  {isCameraLoading ? (
                    <div className="w-full h-80 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-neutral-600">Initializing camera...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-80 object-cover"
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
                          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg"
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
                    className="border-neutral-300"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Area */}
          {currentStep === 'upload' && (
            <Card className="border-neutral-300 mb-6">
              <CardContent className="p-8">
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Take or upload your scale photo</h3>
                  <p className="text-neutral-600 mb-6">Make sure the weight digits are clearly visible</p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={handleTakePhoto}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTakePhoto()}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3"
                      aria-label="Take weight scale photo with camera"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button
                      onClick={handleUploadPhoto}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleUploadPhoto()}
                      variant="outline"
                      className="border-neutral-300 px-6 py-3"
                      aria-label="Upload weight scale photo from device"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                  <p className="text-sm text-neutral-500 mt-4">Drag and drop your photo here, or click to browse</p>
                  <p className="text-xs text-neutral-400 mt-2">JPG, PNG up to 10MB</p>
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

          {/* Photo Preview */}
          {currentStep === 'preview' && capturedImage && (
            <Card className="border-neutral-300 mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Review Photo</h3>
                <div className="relative bg-neutral-100 rounded-lg overflow-hidden mb-4">
                  <img src={capturedImage} alt="Captured Weight" className="w-full h-auto object-cover rounded-lg" />
                </div>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleUsePhoto}
                    disabled={isProcessing}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3"
                  >
                    {isProcessing ? 'Processing...' : <><Check className="w-4 h-4 mr-2" />Use This Photo</>}
                  </Button>
                  <Button
                    onClick={handleRetake}
                    variant="outline"
                    disabled={isProcessing}
                    className="border-neutral-300 px-6 py-3"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing State */}
          {currentStep === 'processing' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600 text-lg">Analyzing your weight...</p>
            </div>
          )}
          
          {/* Success State */}
          {currentStep === 'success' && (
            <Card className="border-green-300 bg-green-50 mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Weight Recorded Successfully!</h3>
                  <p className="text-green-700 text-2xl font-bold mb-2">{weight} kg</p>
                  <p className="text-green-600">Redirecting to your progress...</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Error State */}
          {currentStep === 'error' && (
            <Card className="border-red-300 bg-red-50 mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to Read Weight</h3>
                  <p className="text-red-700 whitespace-pre-line">{errorMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
