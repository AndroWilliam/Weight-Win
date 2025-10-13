"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink } from "lucide-react"

const dataHighlights = [
  {
    icon: "📸",
    title: "Photo Processing",
    bullets: [
      "We use AI to detect weight numbers from your scale photos",
      "Photos are processed instantly and automatically deleted from our systems",
      "No human ever sees your photos, and they can't be recovered once processed"
    ]
  },
  {
    icon: "📊",
    title: "Weight Data Storage",
    bullets: [
      "We securely store your daily weight entries and challenge progress",
      "Data is encrypted and kept on audited servers for the 7-day challenge + 90 days",
      "You can export or delete all of your data anytime from Settings"
    ]
  },
  {
    icon: "🥗",
    title: "Nutritionist Sharing (Optional)",
    bullets: [
      "Only offered after you finish the challenge and book a free session",
      "We share weight trends and completion dates only – no photos or additional personal info",
      "You decide if you want to share and which nutritionist gets access"
    ]
  }
]

const rights = [
  "Access: Download all of your data whenever you need it",
  "Delete: Remove your account and wipe all data instantly",
  "Correct: Update any information that's inaccurate",
  "Questions: Reach us anytime at privacy@weightwin.com"
]

const commitments = [
  "We never sell your data to anyone",
  "We don't use your information for advertising",
  "We notify you immediately if a security issue ever affects your data",
  "We follow industry-standard security practices",
  "You own your data – we're just temporarily helping you track it"
]

export default function ConsentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    try {
      setLoading(true)
      // Save consent to localStorage
      const consents = {
        ocrProcessing: true,
        dataStorage: true,
        shareWithNutritionist: true
      }
      localStorage.setItem('userConsents', JSON.stringify(consents))
      await new Promise(r => setTimeout(r, 250))
      router.push('/setup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
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
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 md:space-y-10">
          <section className="text-center space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Privacy & Data Consent</h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe in transparency. Here's exactly how we handle your information at every step of your WeightWin journey.
            </p>
          </section>

          <section className="space-y-4 sm:space-y-6">
            {dataHighlights.map(({ icon, title, bullets }) => (
              <Card key={title} className="border-border">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 pl-2">
                    <div className="text-2xl sm:text-3xl" aria-hidden>{icon}</div>
                    <div className="space-y-2 sm:space-y-3">
                      <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground">{title}</h2>
                      <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base text-muted-foreground list-disc list-inside">
                        {bullets.map(bullet => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <Card className="border-border">
            <CardContent className="p-4 sm:p-6 space-y-2 sm:space-y-3">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground pl-2">⚡ Your Rights</h2>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base text-muted-foreground list-disc list-inside pl-2">
                {rights.map(item => (
                  <li key={item}>✨ {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 sm:p-6 space-y-2 sm:space-y-3">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground pl-2">🔒 Our Commitments</h2>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base text-muted-foreground list-disc list-inside pl-2">
                {commitments.map(item => (
                  <li key={item}>💙 {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="text-center pt-3 sm:pt-4">
            <Button
              onClick={handleContinue}
              disabled={loading}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-medium rounded-lg disabled:opacity-50"
            >
              {loading ? "Loading..." : "Continue to Setup"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
