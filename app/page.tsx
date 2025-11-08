'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, TrendingUp, Award, ArrowRight, Users } from "lucide-react"
import { NavigationHeader } from "@/components/navigation-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from '@/lib/supabase/client'
import { isPreviewCompleted } from '@/lib/preview/previewCookies'

export default function HomePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleStartTrial = () => {
    // Check if user already completed preview
    const completed = isPreviewCompleted()
    
    if (completed) {
      // Redirect to signup prompt with message
      router.push('/preview-signup?returning=true')
    } else {
      // Start fresh preview
      router.push('/preview/weight-check')
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <NavigationHeader />

      {/* Hero Section */}
      <section className="text-center py-8 sm:py-12 md:py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-4">
            7 days. Daily scale photo.
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-primary mb-6">
            Free nutrition session.
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            No calorie counting, no overwhelm. Just show up for a week.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!loading && !isAuthenticated && (
              <Button 
                size="lg"
                className="text-lg font-semibold px-8 min-w-fit"
                onClick={handleStartTrial}
              >
                Start Free Trial 🚀
              </Button>
            )}

            {!loading && isAuthenticated && (
              <Link href="/dashboard">
                <Button 
                  size="lg"
                  className="text-lg font-semibold px-8 min-w-fit"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}

            {loading && (
              <Button 
                size="lg"
                className="text-lg font-semibold px-8 min-w-fit"
                disabled
              >
                Loading...
              </Button>
            )}

            <Button 
              variant="outline" 
              className="border-border px-8 py-4 text-lg font-semibold rounded-lg"
              asChild
            >
              <a href="#how-it-works">
                See how it works
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Scale Image */}
      <section className="px-6 mb-8 sm:mb-12 md:mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-muted rounded-2xl p-4 sm:p-6 md:p-8 text-center">
            <div className="w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center&auto=format&q=80"
                alt="Vintage mechanical scale with blue body and cream dial"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why WeightWin Works */}
      <section className="py-8 sm:py-12 md:py-16 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-foreground mb-8 sm:mb-12 md:mb-16">
            Why WeightWin works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Simple</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  One photo of your scale each day. Our OCR technology reads the weight automatically. No manual logging.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Consistent</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Build the habit that matters most. Daily consistency beats perfect nutrition every time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Rewarding</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Complete 7 days and earn a free 30-minute session with a certified nutritionist.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-8 sm:py-12 md:py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-foreground mb-8 sm:mb-12 md:mb-16">
            How it works
          </h2>
          
          <div className="space-y-8 sm:space-y-12">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base sm:text-lg">1</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">Sign in with Google</h3>
                <p className="text-sm sm:text-base sm:text-lg text-muted-foreground">
                  Quick one-click sign up. We use Google's secure authentication so you're ready to start in seconds.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base sm:text-lg">2</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">Take a picture of your scale daily</h3>
                <p className="text-sm sm:text-base sm:text-lg text-muted-foreground">
                  Each morning, take a photo of your bathroom scale. Our AI reads the weight automatically - no typing required.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base sm:text-lg">3</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">Get rewarded</h3>
                <p className="text-sm sm:text-base sm:text-lg text-muted-foreground">
                  Complete all 7 days and unlock your free 30-minute session with a certified nutritionist to plan your next steps.
                </p>
              </div>
            </div>
          </div>

          {/* Motivational Section */}
          <div className="mt-8 sm:mt-12 md:mt-16 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
              <p className="text-lg sm:text-xl font-semibold text-foreground">70% quit in a week—don't be one of them</p>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Most people give up on health goals within days. WeightWin's simple approach and meaningful reward help you build the consistency that leads to lasting change.
            </p>
          </div>
        </div>
      </section>

      {/* For Nutritionists */}
      <section id="for-nutritionists" className="py-8 sm:py-12 md:py-16 px-6 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6">
            For Nutritionists
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Connect with pre-qualified clients who've already demonstrated commitment. Join our network of certified nutritionists.
          </p>
          <Link href="/apply/nutritionist">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary/10 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg"
            >
              Apply as a Nutritionist
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card text-card-foreground py-8 sm:py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <h3 className="text-xl font-bold">WeightWin</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Simple, consistent, rewarding weight tracking.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <a 
                  href="#how-it-works"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  How it works
                </a>
                <a 
                  href="#for-nutritionists"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  For Nutritionists
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-foreground">Help Center</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground">Contact Us</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">© 2024 WeightWin. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Theme:</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

