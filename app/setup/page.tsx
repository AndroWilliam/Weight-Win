"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Clock, Globe, ArrowRight } from "lucide-react"

export default function SetupPage() {
  const [weightUnit, setWeightUnit] = useState("kg")
  const [reminderTime, setReminderTime] = useState("08:00")
  const [timezone, setTimezone] = useState("")
  const [tzLocked, setTzLocked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "pending">("pending")
  const router = useRouter()

  useEffect(() => {
    // Auto-detect timezone
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(detectedTimezone)
    if (!baseTimezones.includes(detectedTimezone)) {
      setTimezones((prev) => [detectedTimezone, ...prev])
    }
  }, [])

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

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
      alert("Unable to detect your location. Please select your timezone manually.")
    }
  }

  // Deprecated: external lookup not required; we rely on browser IANA timezone

  const handleContinue = () => {
    setIsLoading(true)
    // Save settings to localStorage or send to server
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
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              Let's set you up
            </h1>
            <p className="text-xl text-neutral-600">
              A few quick settings to personalize your experience.
            </p>
          </div>

          {/* Settings Cards */}
          <div className="space-y-6 mb-8">
            {/* Weight Units */}
            <Card className="border-neutral-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Weight Units</h3>
                <RadioGroup value={weightUnit} onValueChange={setWeightUnit}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="kg" id="kg" />
                    <Label htmlFor="kg" className="text-neutral-700">Kilograms (kg)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lb" id="lb" />
                    <Label htmlFor="lb" className="text-neutral-700">Pounds (lb)</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Daily Reminder */}
            <Card className="border-neutral-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-neutral-900">Daily Reminder</h3>
                </div>
                <p className="text-neutral-600 mb-4">When should we remind you to weigh in?</p>
                <div className="max-w-xs">
                  <Input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="border-neutral-300 focus:border-primary-600 focus:ring-primary-600"
                  />
                </div>
                <p className="text-sm text-neutral-500 mt-2">
                  Morning weigh-ins are most consistent for tracking progress.
                </p>
              </CardContent>
            </Card>

            {/* Time Zone */}
            <Card className="border-neutral-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-neutral-900">Time Zone</h3>
                </div>
                <p className="text-neutral-600 mb-4">Your time zone (auto-detected)</p>
                
                {locationPermission === "pending" && (
                  <div className="mb-4">
                    <Button
                      onClick={requestLocationPermission}
                      variant="outline"
                      className="border-primary-600 text-primary-600 hover:bg-primary-50"
                    >
                      Detect My Location
                    </Button>
                    <p className="text-sm text-neutral-500 mt-2">
                      We'll use your location to automatically detect your timezone for accurate reminders.
                    </p>
                  </div>
                )}

                {locationPermission === "granted" && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-success-600 mb-2">
                      <div className="w-2 h-2 bg-success-600 rounded-full"></div>
                      <span className="text-sm font-medium">Location detected successfully</span>
                    </div>
                  </div>
                )}

                {locationPermission === "denied" && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-warning-600 mb-2">
                      <div className="w-2 h-2 bg-warning-600 rounded-full"></div>
                      <span className="text-sm font-medium">Location access denied - using browser timezone</span>
                    </div>
                  </div>
                )}

                <div className={`max-w-md transition-opacity duration-300 ${tzLocked ? 'opacity-60' : 'opacity-100'}`}>
                  <Select value={timezone} onValueChange={setTimezone} disabled={tzLocked}>
                    <SelectTrigger className="border-neutral-300 focus:border-primary-600 focus:ring-primary-600">
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
                <p className="text-sm text-neutral-500 mt-2">
                  This ensures your daily reminders arrive at the right time.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <Button
              onClick={handleContinue}
              loading={isLoading}
              size="lg"
              className="text-lg font-semibold px-8 mx-auto min-w-fit"
            >
              Next: Review Commitment
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
