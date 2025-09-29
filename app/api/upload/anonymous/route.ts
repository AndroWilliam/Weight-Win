import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withHandler } from '@/lib/api/with-handler'
import { ok, fail } from '@/lib/api/responses'
import { limitByIp, ipFromRequest } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export const POST = withHandler(async (req, ctx, requestId) => {
  logger.info("Anonymous upload request started", { requestId })

  // Rate limiting
  const ip = ipFromRequest(req)
  const { success } = await limitByIp(ip, 'upload', 30) // 30 req/min
  if (!success) {
    logger.info("Rate limit exceeded", { requestId, ip })
    return NextResponse.json(fail('RATE_LIMITED', 'Too many requests', undefined, requestId), { status: 429 })
  }

  // Create Supabase client inside the handler to avoid build-time issues
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const formData = await req.formData()
  const file = formData.get('file') as File
  const bucket = formData.get('bucket') as string
  const path = formData.get('path') as string

  if (!file || !bucket || !path) {
    logger.info("Missing required fields", { requestId, hasFile: !!file, bucket, path })
    return NextResponse.json(fail('BAD_REQUEST', 'Missing required fields', undefined, requestId), { status: 400 })
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    logger.info("File too large", { requestId, size: file.size })
    return NextResponse.json(fail('PAYLOAD_TOO_LARGE', 'File too large. Maximum size is 10MB.', undefined, requestId), { status: 400 })
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    logger.info("Invalid file type", { requestId, type: file.type })
    return NextResponse.json(fail('BAD_REQUEST', 'Invalid file type. Please upload PDF, JPG, or PNG.', undefined, requestId), { status: 400 })
  }

  // Upload to Supabase Storage using service role key
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      contentType: file.type
    })

  if (error) {
    logger.error('Upload failed', error, { requestId, bucket, path })
    return NextResponse.json(fail('STORAGE_ERROR', 'Upload failed', undefined, requestId), { status: 500 })
  }

  logger.info("Upload successful", { requestId, path: data.path })
  return NextResponse.json(ok({ path: data.path }, requestId))
})
