import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withHandler } from '@/lib/api/with-handler'
import { ok, fail } from '@/lib/api/responses'
import { logger } from '@/lib/logger'

const phoneSchema = {
  phone_number: (value: string) => {
    if (typeof value !== 'string') return 'Phone number must be a string'
    if (!/^\+20\d{9}$/.test(value)) {
      return 'Invalid phone format. Must be +20 followed by 9 digits.'
    }
    return null
  }
}

function validatePayload(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid payload' }
  }

  const phoneError = phoneSchema.phone_number(data.phone_number)
  if (phoneError) {
    return { valid: false, error: phoneError }
  }

  return { valid: true }
}

export const POST = withHandler(async (req, ctx, requestId) => {
  logger.info("Phone number save request started", { requestId })

  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    logger.info("Unauthorized phone save request", { requestId, authError })
    return NextResponse.json(
      fail('UNAUTHORIZED', 'Authentication required', undefined, requestId),
      { status: 401 }
    )
  }

  // Parse and validate request body
  const body = await req.json()
  const validation = validatePayload(body)

  if (!validation.valid) {
    logger.info("Invalid phone payload", { requestId, error: validation.error })
    return NextResponse.json(
      fail('BAD_REQUEST', validation.error || 'Invalid payload', undefined, requestId),
      { status: 400 }
    )
  }

  const { phone_number } = body

  try {
    // Update user_settings with phone number
    const { error: updateError } = await supabase
      .from('user_settings')
      .update({ phone_number })
      .eq('user_id', user.id)

    if (updateError) {
      logger.error('Failed to update phone number', updateError, { requestId, userId: user.id })
      return NextResponse.json(
        fail('DATABASE_ERROR', 'Failed to save phone number', { error: updateError.message }, requestId),
        { status: 500 }
      )
    }

    logger.info("Phone number saved successfully", { requestId, userId: user.id })

    return NextResponse.json(ok({
      success: true,
      message: 'Phone number saved successfully'
    }, requestId))
  } catch (error: any) {
    logger.error('Phone save error', error, { requestId, userId: user.id })
    return NextResponse.json(
      fail('SERVER_ERROR', 'Failed to save phone number', { error: error.message }, requestId),
      { status: 500 }
    )
  }
})
