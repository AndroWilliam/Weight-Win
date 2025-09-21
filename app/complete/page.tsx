import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressCircles } from "@/components/progress-circles"
import Link from "next/link"

export default async function CompletePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get completed challenge data
  const { data: completionData } = await supabase
    .from("challenge_completions")
    .select(`
      *,
      user_challenges!inner(*),
      expert_sessions(*)
    `)
    .eq("user_id", data.user.id)
    .order("completed_at", { ascending: false })
    .limit(1)
    .single()

  if (!completionData) {
    redirect("/dashboard")
  }

  // Get tracking entries for the completed challenge
  const { data: trackingEntries } = await supabase
    .from("tracking_entries")
    .select("*")
    .eq("challenge_id", completionData.challenge_id)
    .order("day_number", { ascending: true })

  const startWeight = trackingEntries?.[0]?.weight_kg || 0
  const endWeight = trackingEntries?.[6]?.weight_kg || 0
  const weightChange = endWeight - startWeight

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-foreground hover:text-muted-foreground">
              ←
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">{data.user.email?.split("@")[0]}</span>
            <form action={handleSignOut}>
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </header>

        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">Week completed</h1>
          <p className="text-base md:text-lg text-muted-foreground mb-6">
            You tracked your weight for 7 consecutive days
          </p>
          <div className="mb-4">
            <ProgressCircles completed={7} total={7} size="lg" />
          </div>
          <p className="text-lg md:text-xl font-bold text-chart-2">7 of 7 days</p>
        </div>

        <Card className="mb-6 md:mb-8">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-lg md:text-xl font-bold text-center mb-6">Your tracking summary</h2>
            <div className="space-y-4 text-center">
              <div className="grid grid-cols-2 gap-4 text-sm md:text-base">
                <div>
                  <p className="text-muted-foreground">Days completed</p>
                  <p className="text-xl md:text-2xl font-bold text-chart-2">7</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Consecutive days</p>
                  <p className="text-xl md:text-2xl font-bold text-chart-2">7</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-3 gap-4 text-sm md:text-base">
                  <div>
                    <p className="text-muted-foreground">Starting weight</p>
                    <p className="text-lg md:text-xl font-bold">{startWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Final weight</p>
                    <p className="text-lg md:text-xl font-bold">{endWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Change</p>
                    <p
                      className={`text-lg md:text-xl font-bold ${weightChange < 0 ? "text-chart-2" : "text-foreground"}`}
                    >
                      {weightChange > 0 ? "+" : ""}
                      {weightChange.toFixed(1)} kg
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-lg md:text-xl font-bold text-center mb-6">Your expert session</h2>
            <div className="text-center space-y-4">
              <div className="bg-muted rounded-lg p-4 md:p-6">
                <h3 className="font-bold text-base md:text-lg mb-3">Nutrition consultation</h3>
                <div className="space-y-2 text-sm md:text-base">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next session date:</span>
                    <span className="font-medium">
                      {completionData.expert_sessions?.session_date
                        ? new Date(completionData.expert_sessions.session_date).toLocaleDateString()
                        : "January 15, 2025"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">30 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="font-medium">Video call</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nutritionist:</span>
                    <span className="font-medium">Certified professional</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                We'll email you details before the next scheduled session date
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 md:space-y-4">
          <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3">
            DOWNLOAD SUMMARY
          </Button>

          <Button variant="outline" size="lg" className="w-full py-3 bg-transparent">
            VIEW TRACKING PHOTOS
          </Button>

          <Button variant="outline" size="lg" className="w-full py-3 bg-transparent">
            SHARE ACHIEVEMENT
          </Button>
        </div>

        <div className="text-center mt-8">
          <Link href="/dashboard">
            <Button variant="outline" className="bg-transparent">
              Start New Challenge
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
