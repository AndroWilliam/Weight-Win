import { NextRequest, NextResponse } from 'next/server'
import { extractIdFromImage } from '@/lib/ocr/id-extraction'
import { withHandler } from '@/lib/api/with-handler'
import { idExtractionSchema } from '@/lib/validation/schemas'
import { ok, fail } from '@/lib/api/responses'
import { limitByIp, ipFromRequest } from '@/lib/rate-limit'
import { approxBase64Bytes, MAX_IMAGE_BYTES } from '@/lib/images/base64'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

export const POST = withHandler(async (req, ctx, requestId) => {
  logger.info("ID extraction request started", { requestId })
  
  // Rate limiting
  const ip = ipFromRequest(req)
  const { success } = await limitByIp(ip, 'id-ocr', 20) // 20 req/min
  if (!success) {
    logger.info("Rate limit exceeded", { requestId, ip })
    return NextResponse.json(fail('RATE_LIMITED', 'Too many requests', undefined, requestId), { status: 429 })
  }

  // Parse and validate request body
  const body = await req.json()
  const parsed = idExtractionSchema.safeParse(body)
  if (!parsed.success) {
    logger.info("Invalid ID extraction payload", { requestId, errors: parsed.error.flatten() })
    return NextResponse.json(fail('BAD_REQUEST', 'Invalid payload', parsed.error.flatten(), requestId), { status: 400 })
  }

  const { imageBase64, idType } = parsed.data

  // Validate base64 image size
  if (approxBase64Bytes(imageBase64) > MAX_IMAGE_BYTES) {
    logger.info("Image too large", { requestId, size: approxBase64Bytes(imageBase64) })
    return NextResponse.json(fail('PAYLOAD_TOO_LARGE', 'Image too large (max 10MB)', undefined, requestId), { status: 413 })
  }
  
  // Extract ID from image
  logger.info("Starting OCR extraction", { requestId, idType })
  let result
  try {
    result = await extractIdFromImage(imageBase64, idType)
    logger.info("OCR extraction completed", { requestId, success: result.success })
  } catch (ocrError) {
    logger.error('OCR function threw error', ocrError, { requestId })
    return NextResponse.json(fail('OCR_ERROR', 'OCR processing failed: ' + (ocrError as Error).message, undefined, requestId), { status: 500 })
  }
  
  if (!result.success) {
    logger.info("OCR failed", { requestId, error: result.error })
    return NextResponse.json(fail('OCR_FAILED', result.error || 'Failed to extract ID from document', undefined, requestId), { status: 400 })
  }
  
  logger.info("ID extraction successful", { 
    requestId, 
    extractedId: result.extractedId, 
    confidence: result.confidence 
  })
  
  return NextResponse.json(ok({
    extractedId: result.extractedId,
    confidence: result.confidence,
    idType: result.idType,
    rawText: result.rawText
  }, requestId))
})
