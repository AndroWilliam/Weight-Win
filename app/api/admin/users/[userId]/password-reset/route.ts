import { NextRequest, NextResponse } from 'next/server'
import { userIsAdmin } from '@/lib/admin/guard'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { withHandler } from '@/lib/api/with-handler'
import { ok, fail } from '@/lib/api/responses'
import { logger } from '@/lib/logger'

export const POST = withHandler(async (req: NextRequest, ctx: { params: { userId: string } }, requestId?: string) => {
  logger.info('[Password Reset] Request started', { requestId, userId: ctx.params.userId })

  const isAdmin = await userIsAdmin()
  if (!isAdmin) {
    logger.info('[Password Reset] Unauthorized access attempt', { requestId })
    return NextResponse.json(fail('UNAUTHORIZED', 'Admin access required', undefined, requestId), { status: 403 })
  }

  const targetUser = ctx.params.userId
  if (!targetUser) {
    logger.info('[Password Reset] Missing user id', { requestId })
    return NextResponse.json(fail('BAD_REQUEST', 'Missing user id', undefined, requestId), { status: 400 })
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (!origin) {
    logger.error('[Password Reset] Missing NEXT_PUBLIC_APP_URL', null, { requestId })
    return NextResponse.json(
      fail('SERVER_CONFIG_ERROR', 'Server not configured for password reset', undefined, requestId),
      { status: 500 }
    )
  }

  const adminClient = createServiceSupabaseClient()
  const { data: targetUserRes, error: fetchUserError } = await adminClient.auth.admin.getUserById(targetUser)

  if (fetchUserError) {
    logger.error('[Password Reset] Fetch user error', fetchUserError, { requestId, targetUser })
    return NextResponse.json(
      fail('DATABASE_ERROR', 'Failed to load user', { error: fetchUserError.message }, requestId),
      { status: 500 }
    )
  }

  const email = targetUserRes?.user?.email
  if (!email) {
    logger.info('[Password Reset] User email not found', { requestId, targetUser })
    return NextResponse.json(
      fail('NOT_FOUND', 'User email not found', undefined, requestId),
      { status: 404 }
    )
  }

  const { error: resetError } = await adminClient.auth.admin.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback`,
  })

  if (resetError) {
    logger.error('[Password Reset] Admin API error', resetError, { requestId, targetUser, email })
    return NextResponse.json(
      fail('AUTH_ERROR', 'Failed to send password reset email', { error: resetError.message }, requestId),
      { status: 500 }
    )
  }

  const { data, error: recordError } = await adminClient.rpc('record_admin_password_reset', {
    target_user: targetUser,
  })

  if (recordError) {
    logger.error('[Password Reset] Record RPC error', recordError, { requestId, targetUser })
    // Email was sent successfully, but logging failed - return partial success
    return NextResponse.json(
      fail('PARTIAL_SUCCESS', 'Password reset email sent, but logging failed', { error: recordError.message }, requestId),
      { status: 500 }
    )
  }

  const record = Array.isArray(data) ? data[0] : data

  logger.info('[Password Reset] Password reset email sent successfully', { requestId, targetUser, email })
  return NextResponse.json(ok(record ?? null, requestId))
})


