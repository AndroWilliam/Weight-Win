import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { challengeId, dayNumber, weight, photoUrl } = await request.json()

    // Validate input
    if (!challengeId || !dayNumber || !weight) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Save tracking entry
    const { data: entry, error: insertError } = await supabase
      .from("tracking_entries")
      .insert({
        challenge_id: challengeId,
        day_number: dayNumber,
        weight_kg: weight,
        photo_url: photoUrl,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error saving tracking entry:", insertError)
      return NextResponse.json({ error: "Failed to save tracking entry" }, { status: 500 })
    }

    // Check if challenge is completed (day 7)
    if (dayNumber === 7) {
      const { error: completeError } = await supabase.rpc("complete_challenge", {
        challenge_uuid: challengeId,
      })

      if (completeError) {
        console.error("Error completing challenge:", completeError)
      }
    }

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
