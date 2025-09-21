import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default async function TrackPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const currentDay = 1 // Simple state - first day of tracking

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="flex items-center mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="mr-4">
            ← Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Today's tracking</h1>
        <div className="ml-auto text-sm text-gray-600">{data.user.email}</div>
      </header>

      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <p className="text-xl font-bold mb-2">Day {currentDay} of 7</p>
          <div className="flex justify-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            {[2, 3, 4, 5, 6, 7].map((day) => (
              <div key={day} className="w-4 h-4 rounded-full bg-gray-300" />
            ))}
          </div>
          <p className="text-sm text-green-600">Great start! Keep it up</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Take today's photo</h2>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 mb-4 text-lg">
              📷 CAPTURE SCALE PHOTO
            </Button>

            <p className="text-sm text-gray-600">Photo required for tracking</p>
          </CardContent>
        </Card>

        {/* Photo tips */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-3">Photo tips</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Good lighting helps with automatic reading</li>
              <li>• Hold camera steady for best results</li>
              <li>• Make sure numbers are fully visible</li>
            </ul>

            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-sm font-medium text-gray-600">Time remaining today</p>
              <p className="text-lg font-bold">14 hours 23 minutes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
