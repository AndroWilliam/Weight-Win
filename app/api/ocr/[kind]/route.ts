import { NextResponse } from "next/server"
import { withHandler } from "@/lib/api/with-handler"
import { ocrKindSchema } from "@/lib/validation/schemas"
import { ok, fail } from "@/lib/api/responses"
import { limitByIp, ipFromRequest } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

export const runtime = 'nodejs'

export const POST = withHandler(async (req, { params }, requestId) => {
  logger.info("OCR kind request started", { requestId, kind: params.kind })

  // Rate limiting
  const ip = ipFromRequest(req)
  const { success } = await limitByIp(ip, 'ocr-kind', 30) // 30 req/min
  if (!success) {
    logger.info("Rate limit exceeded", { requestId, ip })
    return NextResponse.json(fail('RATE_LIMITED', 'Too many requests', undefined, requestId), { status: 429 })
  }

  // Parse and validate request body
  const body = await req.json()
  const parsed = ocrKindSchema.safeParse(body)
  if (!parsed.success) {
    logger.info("Invalid OCR kind payload", { requestId, errors: parsed.error.flatten() })
    return NextResponse.json(fail('BAD_REQUEST', 'Invalid payload', parsed.error.flatten(), requestId), { status: 400 })
  }

  const { path } = parsed.data

  // In this phase, applicants are anonymous. We run OCR and just return the
  // result to the client for UI feedback. Persistence will happen on submit
  // when we have created rows in the database for the application/documents.

  // TODO: Plug real OCR provider here (Anthropic/GCP Vision). For now mock.
  const mockConfidence = 0.9
  const mockJson = { parsed: true, fields: {}, kind: params.kind, path }

  logger.info("OCR kind completed", { requestId, kind: params.kind, confidence: mockConfidence })
  return NextResponse.json(ok({ confidence: mockConfidence, data: mockJson }, requestId))
})


