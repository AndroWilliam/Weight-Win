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
    async function loadSettings() {
      try {
        // Try localStorage first (for new users coming from setup flow)
        const savedSettings = localStorage.getItem('userSettings')
        const savedConsents = localStorage.getItem('userConsents')
        
        if (savedSettings && savedConsents) {
          console.log('[Commit] Loading settings from localStorage (setup flow)')
          setSettings(JSON.parse(savedSettings))
          setConsents(JSON.parse(savedConsents))
          setIsLoading(false)
          return
        }
        
        // Fallback: Try to load from database (for returning users)
        console.log('[Commit] Attempting to load settings from database')
        const response = await fetch('/api/settings/get')
        
        // If unauthorized (401), user needs to complete setup flow first
        if (response.status === 401) {
          console.log('[Commit] Unauthorized - redirecting to consent page')
          router.push('/consent')
          return
        }
        
        const data = await response.json()
        
        if (data.success && data.settings) {
          // Settings found in database
          console.log('[Commit] Loaded settings from database')
          setSettings({
            weightUnit: data.settings.weightUnit,
            reminderTime: data.settings.reminderTime,
            timezone: data.settings.timezone,
            locationPermission: data.settings.locationPermission
          })
          setConsents({
            ocrProcessing: data.settings.consentOcr,
            dataStorage: data.settings.consentStorage,
            shareWithNutritionist: data.settings.consentNutritionist
          })
          setIsLoading(false)
          return
        }
        
        // No settings found anywhere - redirect to setup
        console.log('[Commit] No settings found - redirecting to consent')
        router.push('/consent')
        
      } catch (error) {
        console.error('Error loading settings:', error)
        // On error, redirect to consent to start fresh
        router.push('/consent')
      }
    }
    
    loadSettings()
  }, [router])

  const handleStartChallenge = async () => {
    setIsSubmitting(true)
    
    try {
      // Save settings to database
      if (settings && consents) {
        const response = await fetch('/api/settings/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            weightUnit: settings.weightUnit,
            reminderTime: settings.reminderTime,
            timezone: settings.timezone,
            locationPermission: settings.locationPermission,
            consentOcr: consents.ocrProcessing,
            consentStorage: consents.dataStorage,
            consentNutritionist: consents.shareWithNutritionist,
            setupCompleted: true
          })
        })
        
        const data = await response.json()
        
        if (!data.success) {
          console.error('Failed to save settings:', data.error)
          alert('Failed to save settings. Please try again.')
          setIsSubmitting(false)
          return
        }
      }
      
      // Save to localStorage as backup
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
    } catch (error) {
      console.error('Error starting challenge:', error)
      alert('Failed to start challenge. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleBackToSettings = () => {
    router.push('/setup')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    )
  }

  if (!settings || !consents) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Settings not found. Please complete setup first.</p>
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
      <header className="px-4 sm:px-6 py-4 border-b border-border">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">WeightWin</h1>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Ready to commit?
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              You're committing to 7 days of daily scale photos. Consistency is the key to building lasting habits.
            </p>
          </div>

          {/* Challenge Details Card */}
          <Card className="border-border mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 pl-2">Your 7-day challenge:</h2>
              
              <div className="space-y-3 sm:space-y-4 pl-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-xs sm:text-sm md:text-base text-muted-foreground">Take a scale photo every morning</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-xs sm:text-sm md:text-base text-muted-foreground">
                    We'll remind you at {settings.reminderTime}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-xs sm:text-sm md:text-base text-muted-foreground">
                    Track weights in {settings.weightUnit === 'kg' ? 'kilograms (kg)' : 'pounds (lb)'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-xs sm:text-sm md:text-base text-muted-foreground">Earn your free nutritionist session</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Reminder Settings */}
            <Card className="border-border">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4 pl-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Daily Reminder</h3>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground pl-2">
                  {settings.reminderTime} in {settings.timezone || 'your timezone'}
                </p>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card className="border-border">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4 pl-2">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Data Sharing</h3>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground pl-2">
                  {consents.shareWithNutritionist 
                    ? 'Share data with nutritionist after completion' 
                    : 'Keep data private'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-3 sm:space-y-4">
            <Button
              onClick={handleStartChallenge}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 rounded-lg text-sm sm:text-base md:text-lg font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Starting..." : "I'm in - Start My Challenge"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleBackToSettings}
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground font-medium"
              >
                Back to settings
              </button>
            </div>
          </div>

          {/* Motivational Footer */}
          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground italic">
              Remember: You showed up. That's what matters most.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
