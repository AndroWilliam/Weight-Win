"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatedTimePicker } from "@/components/animated-time-picker"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Clock, Globe, ArrowRight, AlertTriangle, Loader2, MapPin } from "lucide-react"

export default function SetupPage() {
  const [weightUnit, setWeightUnit] = useState("kg")
  const [reminderTime, setReminderTime] = useState("08:00")
  const [timezone, setTimezone] = useState("")
  const [tzLocked, setTzLocked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSetup, setIsCheckingSetup] = useState(true)
  const [setupCheckError, setSetupCheckError] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const baseTimezones = useMemo(() => ([
    'Africa/Cairo',
    'Africa/Johannesburg',
    'Africa/Nairobi',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Sao_Paulo',
    'Asia/Dubai',
    'Asia/Jerusalem',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Europe/Amsterdam',
    'Europe/Berlin',
    'Europe/Istanbul',
    'Europe/London',
    'Europe/Madrid',
    'Europe/Moscow',
    'Pacific/Auckland'
  ]), [])
  const [timezones, setTimezones] = useState<string[]>(baseTimezones)
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "not_asked">("not_asked")
  const router = useRouter()

  useEffect(() => {
    // Check if user has already completed setup
    async function checkSetupStatus() {
      setIsCheckingSetup(true)
      setSetupCheckError(null)

      try {
        const response = await fetch('/api/settings/get')
        const data = await response.json()

        if (data.success && data.setupCompleted) {
          // User already completed setup, redirect to dashboard
          console.log('[Setup] User already completed setup, redirecting to dashboard')
          router.push('/dashboard')
          return
        }
      } catch (error) {
        console.error('[Setup] Error checking setup status:', error)
        setSetupCheckError('Failed to check setup status. Please try again.')
      } finally {
        setIsCheckingSetup(false)
      }
    }

    checkSetupStatus()
    
    // Auto-detect timezone
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(detectedTimezone)
    if (!baseTimezones.includes(detectedTimezone)) {
      setTimezones((prev) => [detectedTimezone, ...prev])
    }
  }, [router])

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationPermission("denied")
      setSetupCheckError("Geolocation is not supported by this browser. Please select your timezone manually.")
      return
    }

    setIsGettingLocation(true)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        })
      })

      // Get timezone from coordinates
      const { latitude, longitude } = position.coords
      // Use the browser-resolved IANA timezone. Coordinates
      // are only used to justify locking after permission.
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (!timezones.includes(browserTz)) {
        setTimezones((prev) => [browserTz, ...prev])
      }
      setTimezone(browserTz)
      setTzLocked(true)

      setLocationPermission("granted")
    } catch (error) {
      console.error("Error getting location:", error)
      setLocationPermission("denied")
      setSetupCheckError("Unable to detect your location. Please select your timezone manually.")
    } finally {
      setIsGettingLocation(false)
    }
  }

  // Deprecated: external lookup not required; we rely on browser IANA timezone

  const handleContinue = () => {
    setIsLoading(true)
    // Save settings to localStorage
    const settings = {
      weightUnit,
      reminderTime,
      timezone,
      locationPermission
    }
    localStorage.setItem('userSettings', JSON.stringify(settings))
    router.push('/commit')
  }

  return (
    <ErrorBoundary>
      {isCheckingSetup ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Checking your setup status...
            </p>
          </div>
        </div>
      ) : setupCheckError ? (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Setup Check Failed</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {setupCheckError}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
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

      <main className="px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Let's set you up
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              A few quick settings to personalize your experience.
            </p>
          </div>

          {/* Settings Cards */}
          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            {/* Weight Units */}
            <Card className="border-border">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 pl-2">Weight Units</h3>
                <RadioGroup value={weightUnit} onValueChange={setWeightUnit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 pl-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="kg" id="kg" />
                    <Label htmlFor="kg" className="text-sm sm:text-base text-muted-foreground">Kilograms (kg)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lb" id="lb" />
                    <Label htmlFor="lb" className="text-sm sm:text-base text-muted-foreground">Pounds (lb)</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Daily Reminder */}
            <Card className="border-border">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4 pl-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Daily Reminder</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 pl-2">When should we remind you to weigh in?</p>
                <div className="max-w-xs pl-2">
                  <AnimatedTimePicker
                    value={reminderTime}
                    onChange={setReminderTime}
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 pl-2">
                  Morning weigh-ins are most consistent for tracking progress.
                </p>
              </CardContent>
            </Card>

            {/* Time Zone */}
            <Card className="border-border">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4 pl-2">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Time Zone</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 pl-2">Your time zone (auto-detected)</p>
                
                {locationPermission === "not_asked" && (
                  <div className="mb-3 sm:mb-4 pl-2">
                    <Button
                      onClick={requestLocationPermission}
                      disabled={isGettingLocation}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/10 disabled:opacity-50"
                    >
                      {isGettingLocation ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 mr-2" />
                          Detect My Location
                        </>
                      )}
                    </Button>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                      We'll use your location to automatically detect your timezone for accurate reminders.
                    </p>
                  </div>
                )}

                {locationPermission === "granted" && (
                  <div className="mb-3 sm:mb-4 pl-2">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium">Location detected successfully</span>
                    </div>
                  </div>
                )}

                {locationPermission === "denied" && (
                  <div className="mb-3 sm:mb-4 pl-2">
                    <div className="flex items-center gap-2 text-yellow-600 mb-2">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium">Location access denied - using browser timezone</span>
                    </div>
                  </div>
                )}

                <div className={`max-w-md transition-opacity duration-300 pl-2 ${tzLocked ? 'opacity-60' : 'opacity-100'}`}>
                  <Select value={timezone} onValueChange={setTimezone} disabled={tzLocked}>
                    <SelectTrigger className="border-border focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="Select your timezone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72 overflow-auto">
                      {[
                        'Africa/Cairo',
                        'Africa/Johannesburg',
                        'Africa/Nairobi',
                        'America/New_York',
                        'America/Chicago',
                        'America/Denver',
                        'America/Los_Angeles',
                        'America/Sao_Paulo',
                        'Asia/Dubai',
                        'Asia/Jerusalem',
                        'Asia/Kolkata',
                        'Asia/Singapore',
                        'Asia/Tokyo',
                        'Australia/Sydney',
                        'Europe/Amsterdam',
                        'Europe/Berlin',
                        'Europe/Istanbul',
                        'Europe/London',
                        'Europe/Madrid',
                        'Europe/Moscow',
                        'Pacific/Auckland'
                      ].map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 pl-2">
                  This ensures your daily reminders arrive at the right time.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 rounded-lg text-sm sm:text-base font-medium disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Next: Review Commitment"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
      )}
    </ErrorBoundary>
  )
}
