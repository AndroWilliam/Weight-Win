"use client"

import { useState } from "react"
import { PhotoCapture } from "@/components/photo-capture"
import { WeightConfirmation } from "@/components/weight-confirmation"
import { useRouter } from "next/navigation"
import { fetchWithTimeout, TIMEOUT_PRESETS } from "@/lib/fetch-with-timeout"
import { toast } from "sonner"

interface TrackingInterfaceProps {
  challengeId: string
  dayNumber: number
  userId: string
}

export function TrackingInterface({ challengeId, dayNumber, userId }: TrackingInterfaceProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [detectedWeight, setDetectedWeight] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePhotoTaken = async (url: string) => {
    setPhotoUrl(url)
    setIsLoading(true)

    // Simulate OCR weight detection (MVP implementation)
    setTimeout(() => {
      // Generate realistic weight reading (between 50-150 kg)
      const simulatedWeight = Math.round((Math.random() * 100 + 50) * 10) / 10
      setDetectedWeight(simulatedWeight)
      setIsLoading(false)
    }, 2000)
  }

  const handleWeightConfirm = async (weight: number) => {
    setIsLoading(true)

    try {
      // Save tracking entry to database with timeout
      const response = await fetchWithTimeout(
        "/api/tracking/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            challengeId,
            dayNumber,
            weight,
            photoUrl,
          }),
        },
        TIMEOUT_PRESETS.MEDIUM // 10s for tracking save
      )

      if (response.ok) {
        toast.success("Weight saved successfully!")
        // Redirect to dashboard or progress page
        router.push("/dashboard")
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = errorData.error || "Failed to save tracking entry"
        console.error(errorMsg)
        toast.error("Failed to save weight", {
          description: errorMsg
        })
      }
    } catch (error: any) {
      console.error("Error saving tracking entry:", error)
      if (error.message.includes('timed out')) {
        toast.error('Request timed out', {
          description: 'Please check your internet connection and try again.'
        })
      } else {
        toast.error('Network error', {
          description: error.message || 'Failed to connect to server'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetakePhoto = () => {
    setPhotoUrl(null)
    setDetectedWeight(null)
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{photoUrl ? "Reading your scale..." : "Processing photo..."}</p>
      </div>
    )
  }

  if (photoUrl && detectedWeight) {
    return (
      <WeightConfirmation
        photoUrl={photoUrl}
        detectedWeight={detectedWeight}
        onConfirm={handleWeightConfirm}
        onRetake={handleRetakePhoto}
      />
    )
  }

  return <PhotoCapture onPhotoTaken={handlePhotoTaken} />
}
