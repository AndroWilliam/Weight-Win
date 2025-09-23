"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Database, Share2, CheckCircle, ExternalLink } from "lucide-react"

export default function ConsentPage() {
  const [consents, setConsents] = useState({
    ocrProcessing: true,
    dataStorage: true,
    shareWithNutritionist: true
  })
  const router = useRouter()

  const handleConsentChange = (key: keyof typeof consents) => {
    setConsents(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    // Save consents to localStorage or send to server
    try {
      setLoading(true)
      localStorage.setItem('userConsents', JSON.stringify(consents))
      // small delay to let animation be visible even on fast nav
      await new Promise(r => setTimeout(r, 250))
      router.push('/setup')
    } finally {
      setLoading(false)
    }
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
              Privacy & Data Consent
            </h1>
            <p className="text-xl text-neutral-600">
              We believe in transparency. Here's exactly how we'll use your data.
            </p>
          </div>

          {/* Consent Cards */}
          <div className="space-y-6 mb-8">
            {/* Photo OCR Processing */}
            <Card className="border-neutral-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Eye className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                        Photo OCR Processing
                      </h3>
                      <p className="text-sm text-neutral-500 mb-2">Required for weight detection</p>
                      <p className="text-neutral-700 mb-4">
                        We process your scale photos using AI to automatically detect and extract weight numbers. 
                        Photos are processed securely and are not stored permanently.
                      </p>
                      <div className="space-y-2 text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success-600" />
                          <span>What we do: Scan photos for numbers, extract weight data</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success-600" />
                          <span>What we don't do: Store photos, share with third parties, use for other purposes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={consents.ocrProcessing}
                    onCheckedChange={() => handleConsentChange('ocrProcessing')}
                    className="ml-4"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Storage */}
            <Card className="border-neutral-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Database className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                        Data Storage
                      </h3>
                      <p className="text-sm text-neutral-500 mb-2">Required for challenge tracking</p>
                      <p className="text-neutral-700 mb-4">
                        We store your weight data and challenge progress to track your 7-day journey. 
                        Data is encrypted and stored securely on our servers.
                      </p>
                      <div className="space-y-2 text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success-600" />
                          <span>Duration: Data retained for 2 years or until you delete your account</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success-600" />
                          <span>Your control: Export or delete your data anytime in Settings</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={consents.dataStorage}
                    onCheckedChange={() => handleConsentChange('dataStorage')}
                    className="ml-4"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Share with Nutritionist */}
            <Card className="border-neutral-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Share2 className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                        Share with Nutritionist
                      </h3>
                      <p className="text-sm text-neutral-500 mb-2">Optional - only after completion</p>
                      <p className="text-neutral-700 mb-4">
                        When you book your free nutrition session, share your 7-day weight data with your 
                        chosen nutritionist to help them provide personalized advice.
                      </p>
                      <div className="space-y-2 text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success-600" />
                          <span>When: Only after you complete the challenge and book a session</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success-600" />
                          <span>What's shared: Weight trends, completion dates (no photos)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={consents.shareWithNutritionist}
                    onCheckedChange={() => handleConsentChange('shareWithNutritionist')}
                    className="ml-4"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card className="border-neutral-300 mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                  <span className="text-neutral-700">WeightWin is not designed for collecting PII or securing sensitive data</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                  <span className="text-neutral-700">All data processing complies with privacy regulations</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                  <span className="text-neutral-700">You can change these settings or delete your data anytime</span>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <a href="#" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                  Privacy Policy
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a href="#" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                  Terms of Service
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Continue Button */}
          <div className="text-center">
            <Button
              onClick={handleContinue}
              disabled={loading}
              className="relative bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-transform duration-200 disabled:opacity-75"
            >
              <span className={`inline-flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-150`}>
                Continue to Setup
              </span>
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                </span>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
