"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface PhotoCaptureProps {
  onPhotoTaken: (photoUrl: string) => void
}

export function PhotoCapture({ onPhotoTaken }: PhotoCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
    try {
      setIsCapturing(true)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setIsCapturing(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        const photoUrl = canvas.toDataURL("image/jpeg", 0.8)
        onPhotoTaken(photoUrl)
        stopCamera()
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
  }

  if (!isCapturing) {
    return (
      <Card>
        <CardContent className="p-6 md:p-8 text-center">
          <h2 className="text-lg md:text-xl font-bold mb-6">Take today's photo</h2>

          <Button
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 md:py-8 text-lg md:text-xl mb-4 min-h-[60px] md:min-h-[70px]"
            onClick={startCamera}
          >
            📷 CAPTURE SCALE PHOTO
          </Button>

          <p className="text-sm md:text-base text-muted-foreground">Photo required for tracking</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg bg-black"
            style={{ maxHeight: "400px" }}
          />
          <canvas ref={canvasRef} className="hidden" />

          <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-lg pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm bg-black/50 px-2 py-1 rounded">
              Position scale in frame
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={stopCamera} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={capturePhoto} className="flex-1 bg-chart-2 hover:bg-chart-2/90 text-white">
            Capture
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
