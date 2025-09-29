import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { withHandler } from "@/lib/api/with-handler"
import { ok, fail } from "@/lib/api/responses"
import { limitByIp, ipFromRequest } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

export const POST = withHandler(async (req, ctx, requestId) => {
  logger.info("Challenge start request", { requestId })

  // Rate limiting
  const ip = ipFromRequest(req)
  const { success } = await limitByIp(ip, 'challenge', 10) // 10 req/min
  if (!success) {
    logger.info("Rate limit exceeded", { requestId, ip })
    return NextResponse.json(fail('RATE_LIMITED', 'Too many requests', undefined, requestId), { status: 429 })
  }

  const supabase = await createClient()

  // Verify user authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    logger.info("Unauthorized challenge start request", { requestId, authError })
    return NextResponse.json(fail('UNAUTHORIZED', 'Authentication required', undefined, requestId), { status: 401 })
  }

  // Check if user has an active challenge
  const { data: existingChallenge } = await supabase
    .from("user_challenges")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  if (existingChallenge) {
    logger.info("Active challenge already exists", { requestId, userId: user.id, challengeId: existingChallenge.id })
    return NextResponse.json(fail('CONFLICT', 'Active challenge already exists', undefined, requestId), { status: 400 })
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
    logger.error("Failed to create challenge", insertError, { requestId, userId: user.id })
    return NextResponse.json(fail('DATABASE_ERROR', 'Failed to create challenge', undefined, requestId), { status: 500 })
  }

  logger.info("Challenge created successfully", { requestId, challengeId: newChallenge.id, userId: user.id })
  return NextResponse.json(ok({ challenge: newChallenge }, requestId))
})
