import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { withHandler } from "@/lib/api/with-handler"
import { trackingSchema } from "@/lib/validation/schemas"
import { ok, fail } from "@/lib/api/responses"
import { limitByIp, ipFromRequest } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

export const POST = withHandler(async (req, ctx, requestId) => {
  logger.info("Tracking save request started", { requestId })

  // Rate limiting
  const ip = ipFromRequest(req)
  const { success } = await limitByIp(ip, 'tracking', 60) // 60 req/min
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
    logger.info("Unauthorized tracking request", { requestId, authError })
    return NextResponse.json(fail('UNAUTHORIZED', 'Authentication required', undefined, requestId), { status: 401 })
  }

  // Parse and validate request body
  const body = await req.json()
  const parsed = trackingSchema.safeParse(body)
  if (!parsed.success) {
    logger.info("Invalid tracking payload", { requestId, errors: parsed.error.flatten() })
    return NextResponse.json(fail('BAD_REQUEST', 'Invalid payload', parsed.error.flatten(), requestId), { status: 400 })
  }

  const { challengeId, dayNumber, weight, photoUrl } = parsed.data

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
    logger.error("Failed to save tracking entry", insertError, { requestId, userId: user.id })
    return NextResponse.json(fail('DATABASE_ERROR', 'Failed to save tracking entry', undefined, requestId), { status: 500 })
  }

  // Check if challenge is completed (day 7)
  if (dayNumber === 7) {
    const { error: completeError } = await supabase.rpc("complete_challenge", {
      challenge_uuid: challengeId,
    })

    if (completeError) {
      logger.error("Failed to complete challenge", completeError, { requestId, challengeId })
    } else {
      logger.info("Challenge completed", { requestId, challengeId, userId: user.id })
    }
  }

  logger.info("Tracking entry saved successfully", { requestId, entryId: entry.id })
  return NextResponse.json(ok({ entry }, requestId))
})
