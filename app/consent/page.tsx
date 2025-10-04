"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, ShieldCheck, Mail, FileText, Globe } from "lucide-react"

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

const finePrint = [
  "WeightWin is designed for adults 18+ pursuing personal wellness goals",
  "We comply with privacy laws including GDPR and CCPA",
  "Data may be processed on secure servers located in the US/EU",
  "Full details live in our Privacy Policy and Terms of Service"
]

const implementationNotes = [
  {
    title: "For Development",
    items: [
      "Ensure privacy@weightwin.com is active and monitored",
      "Implement automatic deletion of challenge data after 90 days",
      "Add user-controlled data export tools in Settings",
      "Publish dedicated Privacy Policy and Terms of Service pages",
      "Verify photo deletion happens immediately after OCR"
    ],
    Icon: ShieldCheck
  },
  {
    title: "For Legal Review",
    items: [
      "Confirm compliance with privacy laws in your operating regions",
      "Document where data is processed and the legal basis for doing so",
      "Validate that retention periods match business and regulatory requirements",
      "Confirm age restriction enforcement (18+)"
    ],
    Icon: FileText
  },
  {
    title: "Localization Notes",
    items: [
      "Translate the page while keeping the warm, transparent tone",
      "Adapt legal references for local regulations (e.g., GDPR, CCPA)",
      "Ensure emoji usage aligns with local expectations",
      "Localize privacy notice formatting conventions"
    ],
    Icon: Globe
  }
]

export default function ConsentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    try {
      setLoading(true)
      await new Promise(r => setTimeout(r, 250))
      router.push('/setup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
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
        <div className="max-w-3xl mx-auto space-y-10">
          <section className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-neutral-900">Privacy &amp; Data Consent</h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We believe in transparency. Here's exactly how we handle your information at every step of your WeightWin journey.
            </p>
          </section>

          <section className="space-y-6">
            {dataHighlights.map(({ icon, title, bullets }) => (
              <Card key={title} className="border-neutral-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl" aria-hidden>{icon}</div>
                    <div className="space-y-3">
                      <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
                      <ul className="space-y-2 text-neutral-700 list-disc list-inside">
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

          <Card className="border-neutral-300">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-xl font-semibold text-neutral-900">⚡ Your Rights</h2>
              <ul className="space-y-2 text-neutral-700 list-disc list-inside">
                {rights.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-neutral-300">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-xl font-semibold text-neutral-900">🔒 Our Commitments</h2>
              <ul className="space-y-2 text-neutral-700 list-disc list-inside">
                {commitments.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-neutral-300">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-xl font-semibold text-neutral-900">📋 The Fine Print</h2>
              <ul className="space-y-2 text-neutral-700 list-disc list-inside">
                {finePrint.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4 pt-4">
                <a href="#" className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1">
                  Privacy Policy
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a href="#" className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1">
                  Terms of Service
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-6">
            {implementationNotes.map(({ title, items, Icon }) => (
              <Card key={title} className="border-dashed border-neutral-300">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
                  </div>
                  <ul className="space-y-2 text-neutral-700 list-disc list-inside">
                    {items.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </section>

          <Card className="border-neutral-300">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-neutral-900">Questions?</h3>
              </div>
              <p className="text-neutral-700">
                We're here to help. Email us anytime at <a className="text-primary-600 font-medium" href="mailto:privacy@weightwin.com">privacy@weightwin.com</a> and our team will respond promptly.
              </p>
            </CardContent>
          </Card>

          <div className="text-center pt-4">
            <Button
              onClick={handleContinue}
              loading={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg font-semibold rounded-lg"
            >
              Continue to Setup
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
