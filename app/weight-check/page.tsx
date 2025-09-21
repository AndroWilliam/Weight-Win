"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Camera, Upload, ArrowLeft, RotateCcw, Check } from "lucide-react"

export default function WeightCheckPage() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'camera' | 'preview' | 'processing'>('upload')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [weight, setWeight] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const day = searchParams.get('day') || '1'

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string)
        setCurrentStep('preview')
      }
      reader.readAsDataURL(file)
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
    setIsProcessing(true)
    setCurrentStep('processing')
    
    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock OCR result - in real app, this would call your OCR API
    const mockWeight = Math.floor(Math.random() * 20) + 60 // Random weight between 60-80
    setWeight(mockWeight)
    
    // Save weight data
    const weightData = {
      day: parseInt(day),
      weight: mockWeight,
      timestamp: new Date().toISOString(),
      image: capturedImage
    }
    
    // Save to localStorage (in real app, save to database)
    const existingWeights = JSON.parse(localStorage.getItem('weightData') || '[]')
    existingWeights.push(weightData)
    localStorage.setItem('weightData', JSON.stringify(existingWeights))
    
    // Update challenge progress
    const challengeData = JSON.parse(localStorage.getItem('challengeData') || '{}')
    challengeData.currentDay = parseInt(day) + 1
    localStorage.setItem('challengeData', JSON.stringify(challengeData))
    
    // Redirect to dashboard
    router.push('/dashboard')
  }

  const goBack = () => {
    if (currentStep === 'camera' && streamRef.current) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-neutral-300">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button 
            onClick={goBack}
            className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
              <div className="w-2 h-2 bg-neutral-300 rounded-full"></div>
              <div className="w-2 h-2 bg-neutral-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Day {day} Weight Check
            </h1>
            <p className="text-neutral-600">
              Take or upload a clear photo of your scale
            </p>
          </div>

          {/* Photo Tips */}
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
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    Take or upload your scale photo
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    Make sure the weight digits are clearly visible
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={handleTakePhoto}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button
                      onClick={handleUploadPhoto}
                      variant="outline"
                      className="border-neutral-300 px-6 py-3"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                  
                  <p className="text-sm text-neutral-500 mt-4">
                    Drag and drop your photo here, or click to browse
                  </p>
                  <p className="text-xs text-neutral-400 mt-2">
                    JPG, PNG up to 10MB
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {currentStep === 'preview' && capturedImage && (
            <Card className="border-neutral-300 mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Preview Your Photo</h3>
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Captured scale photo"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={handleRetake}
                    variant="outline"
                    className="flex-1 border-neutral-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake
                  </Button>
                  <Button
                    onClick={handleUsePhoto}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Use This Photo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing */}
          {currentStep === 'processing' && (
            <Card className="border-neutral-300 mb-6">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Analyzing your photo...
                </h3>
                <p className="text-neutral-600">
                  Our AI is reading the weight from your scale
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
