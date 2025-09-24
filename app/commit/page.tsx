"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Target, Clock, Globe, ArrowLeft, ArrowRight } from "lucide-react"

interface UserSettings {
  weightUnit: string
  reminderTime: string
  timezone: string
  locationPermission: string
}

interface UserConsents {
  ocrProcessing: boolean
  dataStorage: boolean
  shareWithNutritionist: boolean
}

export default function CommitPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [consents, setConsents] = useState<UserConsents | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load user settings and consents from localStorage
    const savedSettings = localStorage.getItem('userSettings')
    const savedConsents = localStorage.getItem('userConsents')
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
    if (savedConsents) {
      setConsents(JSON.parse(savedConsents))
    }
    
    setIsLoading(false)
  }, [])

  const handleStartChallenge = () => {
    setIsSubmitting(true)
    // Save challenge start data
    const challengeData = {
      startDate: new Date().toISOString(),
      settings,
      consents,
      currentDay: 1,
      completed: false
    }
    localStorage.setItem('challengeData', JSON.stringify(challengeData))
    
    // Redirect to dashboard
    router.push('/dashboard')
  }

  const handleBackToSettings = () => {
    router.push('/setup')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your settings...</p>
        </div>
      </div>
    )
  }

  if (!settings || !consents) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">Settings not found. Please complete setup first.</p>
          <Button onClick={() => router.push('/setup')}>
            Go to Setup
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-neutral-300">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900">WeightWin</h1>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              Ready to commit?
            </h1>
            <p className="text-xl text-neutral-600">
              You're committing to 7 days of daily scale photos. Consistency is the key to building lasting habits.
            </p>
          </div>

          {/* Challenge Details Card */}
          <Card className="border-neutral-300 mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Your 7-day challenge:</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-neutral-700">Take a scale photo every morning</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-neutral-700">
                    We'll remind you at {settings.reminderTime}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-neutral-700">
                    Track weights in {settings.weightUnit === 'kg' ? 'kilograms (kg)' : 'pounds (lb)'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-neutral-700">Earn your free nutritionist session</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Summary */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Reminder Settings */}
            <Card className="border-neutral-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-neutral-900">Daily Reminder</h3>
                </div>
                <p className="text-neutral-600">
                  {settings.reminderTime} in {settings.timezone || 'your timezone'}
                </p>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card className="border-neutral-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-neutral-900">Data Sharing</h3>
                </div>
                <p className="text-neutral-600">
                  {consents.shareWithNutritionist 
                    ? 'Share data with nutritionist after completion' 
                    : 'Keep data private'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <Button
              onClick={handleStartChallenge}
              loading={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 text-white px-12 py-3 text-lg font-semibold rounded-lg flex items-center gap-2 mx-auto whitespace-nowrap"
            >
              I'm in - Start My Challenge
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleBackToSettings}
                className="text-neutral-600 hover:text-neutral-800 text-sm font-medium"
              >
                Back to settings
              </button>
            </div>
          </div>

          {/* Motivational Footer */}
          <div className="mt-12 text-center">
            <p className="text-neutral-500 italic">
              Remember: You showed up. That's what matters most.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
