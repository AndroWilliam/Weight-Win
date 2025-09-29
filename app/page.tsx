import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, TrendingUp, Award, ArrowRight, Users } from "lucide-react"
import { NavigationHeader } from "@/components/navigation-header"

export const revalidate = 3600 // 1 hour

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <NavigationHeader />

      {/* Hero Section */}
      <section className="text-center py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-4">
            7 days. Daily scale photo.
          </h1>
          <h2 className="text-5xl md:text-6xl font-bold text-primary-600 mb-6">
            Free nutrition session.
          </h2>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            No calorie counting, no overwhelm. Just show up for a week.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button 
                size="lg"
                className="text-lg font-semibold px-8 min-w-fit"
              >
                Start the 7-Day Challenge
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="border-neutral-300 px-8 py-4 text-lg font-semibold rounded-lg"
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
      <section className="px-6 mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-neutral-100 rounded-2xl p-8 text-center">
            <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center overflow-hidden">
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
      <section className="py-16 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-neutral-900 mb-16">
            Why WeightWin works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">Simple</h3>
                <p className="text-neutral-600 leading-relaxed">
                  One photo of your scale each day. Our OCR technology reads the weight automatically. No manual logging.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">Consistent</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Build the habit that matters most. Daily consistency beats perfect nutrition every time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">Rewarding</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Complete 7 days and earn a free 30-minute session with a certified nutritionist.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-neutral-900 mb-16">
            How it works
          </h2>
          
          <div className="space-y-12">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">Sign in with Google</h3>
                <p className="text-neutral-600 text-lg">
                  Quick one-click sign up. We use Google's secure authentication so you're ready to start in seconds.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">Take a picture of your scale daily</h3>
                <p className="text-neutral-600 text-lg">
                  Each morning, take a photo of your bathroom scale. Our AI reads the weight automatically - no typing required.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">Get rewarded</h3>
                <p className="text-neutral-600 text-lg">
                  Complete all 7 days and unlock your free 30-minute session with a certified nutritionist to plan your next steps.
                </p>
              </div>
            </div>
          </div>

          {/* Motivational Section */}
          <div className="mt-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-6 h-6 text-neutral-600" />
              <p className="text-xl font-semibold text-neutral-900">70% quit in a week—don't be one of them</p>
            </div>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Most people give up on health goals within days. WeightWin's simple approach and meaningful reward help you build the consistency that leads to lasting change.
            </p>
          </div>
        </div>
      </section>

      {/* For Nutritionists */}
      <section id="for-nutritionists" className="py-16 px-6 bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">
            For Nutritionists
          </h2>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Connect with pre-qualified clients who've already demonstrated commitment. Join our network of certified nutritionists.
          </p>
          <Link href="/apply/nutritionist">
            <Button 
              variant="outline" 
              className="border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg font-semibold rounded-lg"
            >
              Apply as a Nutritionist
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <h3 className="text-xl font-bold">WeightWin</h3>
              </div>
              <p className="text-neutral-400 mb-6">
                Simple, consistent, rewarding weight tracking.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <a 
                  href="#how-it-works"
                  className="block text-neutral-400 hover:text-white transition-colors"
                >
                  How it works
                </a>
                <a 
                  href="#for-nutritionists"
                  className="block text-neutral-400 hover:text-white transition-colors"
                >
                  For Nutritionists
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <a href="#" className="block text-neutral-400 hover:text-white">Help Center</a>
                <a href="#" className="block text-neutral-400 hover:text-white">Contact Us</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center">
            <p className="text-neutral-400">© 2024 WeightWin. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

