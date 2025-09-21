"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function StartTrackingButton() {
  const router = useRouter()

  const handleStartTracking = () => {
    console.log("[v0] Starting Day 1 - navigating to /track")
    router.push("/track")
  }

  return (
    <Button onClick={handleStartTracking} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg">
      START DAY 1
    </Button>
  )
}
