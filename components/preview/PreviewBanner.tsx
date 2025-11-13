'use client'

import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PreviewBannerProps {
  currentStep: number
  totalSteps: number
}

export function PreviewBanner({ currentStep, totalSteps }: PreviewBannerProps) {
  const router = useRouter()

  const handleExit = () => {
    if (confirm('Exit demo mode? Your progress will be saved.')) {
      console.log('🚪 [PreviewBanner] Exiting demo, navigating to homepage')
      window.location.href = '/'
    }
  }

  return (
    <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg">🎯</span>
        <div>
          <p className="font-semibold text-sm">DEMO MODE - Step {currentStep} of {totalSteps}</p>
          <p className="text-xs opacity-90">Try all features without signing up</p>
        </div>
      </div>
      
      <button
        onClick={handleExit}
        className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
        aria-label="Exit demo"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}


