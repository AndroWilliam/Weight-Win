import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractWeightFromImage } from '@/lib/ocr/google-vision'
import { withHandler } from '@/lib/api/with-handler'
import { weightProcessSchema } from '@/lib/validation/schemas'
import { ok, fail } from '@/lib/api/responses'
import { limitByIp, ipFromRequest } from '@/lib/rate-limit'
import { approxBase64Bytes, MAX_IMAGE_BYTES } from '@/lib/images/base64'
import { logger } from '@/lib/logger'

export const POST = withHandler(async (req, ctx, requestId) => {
  logger.info("Weight process request started", { requestId })

  // Rate limiting
  const ip = ipFromRequest(req)
  const { success } = await limitByIp(ip, 'weight-ocr', 20) // 20 req/min
  if (!success) {
    logger.info("Rate limit exceeded", { requestId, ip })
    return NextResponse.json(fail('RATE_LIMITED', 'Too many requests', undefined, requestId), { status: 429 })
  }

  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    logger.info("Unauthorized weight process request", { requestId, authError })
    return NextResponse.json(fail('UNAUTHORIZED', 'Authentication required', undefined, requestId), { status: 401 })
  }
  
  // Parse and validate request body
  const body = await req.json()
  const parsed = weightProcessSchema.safeParse(body)
  if (!parsed.success) {
    logger.info("Invalid weight process payload", { requestId, errors: parsed.error.flatten() })
    return NextResponse.json(fail('BAD_REQUEST', 'Invalid payload', parsed.error.flatten(), requestId), { status: 400 })
  }

  const { imageBase64, photoUrl } = parsed.data

  // Validate base64 image size
  if (approxBase64Bytes(imageBase64) > MAX_IMAGE_BYTES) {
    logger.info("Image too large", { requestId, size: approxBase64Bytes(imageBase64) })
    return NextResponse.json(fail('PAYLOAD_TOO_LARGE', 'Image too large (max 10MB)', undefined, requestId), { status: 413 })
  }
  
  // Process image with OCR
  const ocrResult = await extractWeightFromImage(imageBase64)
  
  if (!ocrResult.success || !ocrResult.weight) {
    logger.info("OCR failed", { requestId, error: ocrResult.error, rawText: ocrResult.rawText })
    // Include raw OCR text in error details for debugging
    return NextResponse.json(fail('OCR_FAILED', ocrResult.error || 'Unable to extract weight from image', { rawText: ocrResult.rawText }, requestId), { status: 400 })
  }
  
  // Record daily check-in using new database function
  const { data: checkInData, error: checkInError } = await supabase
    .rpc('record_daily_weight_checkin', {
      p_user_id: user.id,
      p_weight_kg: ocrResult.weight,
      p_photo_url: photoUrl,
      p_ocr_confidence: ocrResult.confidence
    })
  
  if (checkInError || !checkInData) {
    logger.error('Failed to record daily check-in', checkInError, { requestId, userId: user.id, checkInData })
    return NextResponse.json(fail('DATABASE_ERROR', 'Failed to save weight entry', { error: checkInError?.message, data: checkInData }, requestId), { status: 500 })
  }
  
  // The function returns a table, so get the first row
  const checkInResult = Array.isArray(checkInData) ? checkInData[0] : checkInData
  
  // Get challenge progress
  const { data: progressResult } = await supabase
    .rpc('get_challenge_progress', { p_user_id: user.id })
  
  const progressData = Array.isArray(progressResult) ? progressResult[0] : progressResult
  
  logger.info("Weight processed successfully", { 
    requestId, 
    weight: ocrResult.weight, 
    confidence: ocrResult.confidence,
    dayNumber: checkInResult.day_number,
    isNewDay: checkInResult.is_new_day,
    currentStreak: checkInResult.current_streak
  })

  return NextResponse.json(ok({
    weight: ocrResult.weight,
    confidence: ocrResult.confidence,
    dayNumber: checkInResult.day_number,
    isNewDay: checkInResult.is_new_day,
    currentStreak: checkInResult.current_streak,
    daysRemaining: checkInResult.days_remaining,
    progress: progressData,
    message: checkInResult.is_new_day 
      ? `Day ${checkInResult.day_number} completed! 🎉` 
      : `Weight updated for today (Day ${checkInResult.day_number})`
  }, requestId))
})
