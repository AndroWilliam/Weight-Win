import { Suspense } from "react"
import { WeightCheckContent } from "@/components/weight-check-content"

function WeightCheckLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-neutral-600">Loading weight check...</p>
      </div>
    </div>
  )
}

export default function WeightCheckPage() {
  return (
    <Suspense fallback={<WeightCheckLoading />}>
      <WeightCheckContent />
    </Suspense>
  )
}