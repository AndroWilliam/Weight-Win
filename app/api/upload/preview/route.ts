import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withHandler } from '@/lib/api/with-handler'
import { uploadPreviewSchema } from '@/lib/validation/schemas'
import { ok, fail } from '@/lib/api/responses'
import { limitByIp, ipFromRequest } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'


export const POST = withHandler(async (req, ctx, requestId) => {
  logger.info("Upload preview request started", { requestId })

  // Rate limiting
  const ip = ipFromRequest(req)
  const { success } = await limitByIp(ip, 'upload-preview', 60) // 60 req/min
  if (!success) {
    logger.info("Rate limit exceeded", { requestId, ip })
    return NextResponse.json(fail('RATE_LIMITED', 'Too many requests', undefined, requestId), { status: 429 })
  }

  // Parse and validate request body
  const body = await req.json()
  const parsed = uploadPreviewSchema.safeParse(body)
  if (!parsed.success) {
    logger.info("Invalid upload preview payload", { requestId, errors: parsed.error.flatten() })
    return NextResponse.json(fail('BAD_REQUEST', 'Invalid payload', parsed.error.flatten(), requestId), { status: 400 })
  }

  const { bucket, path } = parsed.data

  // Create Supabase client inside the handler to avoid build-time issues
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Create signed URL using service role key
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60) // 60 seconds expiry

  if (error) {
    logger.error('Failed to create preview URL', error, { requestId, bucket, path })
    return NextResponse.json(fail('STORAGE_ERROR', 'Failed to create preview URL', undefined, requestId), { status: 500 })
  }

  logger.info("Preview URL created successfully", { requestId, bucket, path })
  return NextResponse.json(ok({ signedUrl: data.signedUrl }, requestId))
})
