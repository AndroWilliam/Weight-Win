import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function LandingPage() {
  console.log("[v0] Landing page accessed")

  const supabase = await createClient()

  console.log("[v0] Checking user authentication...")
  const { data, error } = await supabase.auth.getUser()

  console.log("[v0] Auth check result:", {
    hasUser: !!data?.user,
    userEmail: data?.user?.email,
    error: error?.message,
  })

  if (error || !data?.user) {
    console.log("[v0] User not authenticated, redirecting to login")
    redirect("/auth/login")
  }

  console.log("[v0] User authenticated successfully:", data.user.email)

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Health n Fitness</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {data.user.email}</span>
            <form action={handleSignOut}>
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Fitness Journey</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your workouts, monitor your progress, and achieve your health goals with our comprehensive fitness
            platform.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">💪</div>
                Workout Tracking
              </CardTitle>
              <CardDescription>Log your exercises, sets, and reps with our intuitive workout tracker.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Workout</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">📊</div>
                Progress Analytics
              </CardTitle>
              <CardDescription>Visualize your fitness journey with detailed charts and insights.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                View Progress
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">🎯</div>
                Goal Setting
              </CardTitle>
              <CardDescription>Set and track your fitness goals to stay motivated and focused.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                Set Goals
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
              <CardDescription>
                Your fitness transformation begins with a single step. Let's make it count!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 justify-center">
                <Button size="lg">Create Workout Plan</Button>
                <Button variant="outline" size="lg">
                  Browse Exercises
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
