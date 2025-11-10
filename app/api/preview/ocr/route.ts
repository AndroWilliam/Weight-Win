import { NextRequest, NextResponse } from 'next/server'
import { extractWeightFromImage } from '@/lib/ocr/google-vision'
import { withHandler } from '@/lib/api/with-handler'
import { ok, fail } from '@/lib/api/responses'
import { limitByIp, ipFromRequest } from '@/lib/rate-limit'
import { approxBase64Bytes, MAX_IMAGE_BYTES } from '@/lib/images/base64'
import { logger } from '@/lib/logger'

/**
 * Preview OCR endpoint - NO AUTHENTICATION REQUIRED
 * Used for demo/preview flow only
 * More restrictive rate limiting to prevent abuse
 */
export const POST = withHandler(async (req, ctx, requestId) => {
  logger.info("Preview OCR request started", { requestId })

  // Strict rate limiting for unauthenticated requests
  const ip = ipFromRequest(req)
  const { success } = await limitByIp(ip, 'preview-ocr', 5) // Only 5 req/min for preview
  if (!success) {
    logger.info("Preview rate limit exceeded", { requestId, ip })
    return NextResponse.json(
      fail('RATE_LIMITED', 'Too many preview requests. Please wait before trying again.', undefined, requestId),
      { status: 429 }
    )
  }

  // Parse request body
  const body = await req.json()
  const { imageBase64 } = body

  if (!imageBase64) {
    return NextResponse.json(
      fail('BAD_REQUEST', 'Image data required', undefined, requestId),
      { status: 400 }
    )
  }

  // Validate base64 image size (stricter limit for preview)
  const imageSize = approxBase64Bytes(imageBase64)
  if (imageSize > MAX_IMAGE_BYTES) {
    logger.info("Preview image too large", { requestId, size: imageSize })
    return NextResponse.json(
      fail('PAYLOAD_TOO_LARGE', 'Image too large (max 10MB)', undefined, requestId),
      { status: 413 }
    )
  }

  // Process image with OCR
  const ocrResult = await extractWeightFromImage(imageBase64)

  if (!ocrResult.success || !ocrResult.weight) {
    logger.info("Preview OCR failed", { requestId, error: ocrResult.error, rawText: ocrResult.rawText })
    return NextResponse.json(
      fail('OCR_FAILED', ocrResult.error || 'Unable to detect weight in image. Please ensure the scale display is clearly visible.',
      { rawText: ocrResult.rawText },
      requestId),
      { status: 400 }
    )
  }

  logger.info("Preview OCR successful", {
    requestId,
    weight: ocrResult.weight,
    confidence: ocrResult.confidence
  })

  // Return ONLY the weight and confidence (no database operations)
  return NextResponse.json(ok({
    success: true,
    weight: ocrResult.weight,
    confidence: ocrResult.confidence
  }, requestId))
})
