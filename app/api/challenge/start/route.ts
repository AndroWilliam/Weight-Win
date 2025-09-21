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

    // Check if user has an active challenge
    const { data: existingChallenge } = await supabase
      .from("user_challenges")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (existingChallenge) {
      return NextResponse.json({ error: "Active challenge already exists" }, { status: 400 })
    }

    // Create new challenge
    const { data: newChallenge, error: insertError } = await supabase
      .from("user_challenges")
      .insert({
        user_id: user.id,
        start_date: new Date().toISOString().split("T")[0], // Today's date
        status: "active",
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating challenge:", insertError)
      return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 })
    }

    return NextResponse.json({ success: true, challenge: newChallenge })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
