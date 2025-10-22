import { NextRequest, NextResponse } from 'next/server'
import { userIsAdmin } from '@/lib/admin/guard'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { withHandler } from '@/lib/api/with-handler'
import { ok, fail } from '@/lib/api/responses'
import { logger } from '@/lib/logger'

export const GET = withHandler(async (req: NextRequest, ctx: { params: { userId: string } }, requestId?: string) => {
  logger.info('[Admin Permissions] Request started', { requestId, userId: ctx.params.userId })

  const isAdmin = await userIsAdmin()
  if (!isAdmin) {
    logger.info('[Admin Permissions] Unauthorized access attempt', { requestId })
    return NextResponse.json(fail('UNAUTHORIZED', 'Admin access required', undefined, requestId), { status: 403 })
  }

  const targetUser = ctx.params.userId
  if (!targetUser) {
    logger.info('[Admin Permissions] Missing user id', { requestId })
    return NextResponse.json(fail('BAD_REQUEST', 'Missing user id', undefined, requestId), { status: 400 })
  }

  const supabase = createServiceSupabaseClient()

  // Ensure admin_permissions row exists for this user
  const { error: upsertError } = await supabase
    .from('admin_permissions')
    .upsert({ user_id: targetUser }, { onConflict: 'user_id', ignoreDuplicates: true })

  if (upsertError) {
    logger.error('[Admin Permissions] Failed to ensure permissions row', upsertError, { requestId, targetUser })
  }

  // Check if user is admin
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', targetUser)
    .maybeSingle()

  if (adminError) {
    logger.error('[Admin Permissions] Failed to check admin status', adminError, { requestId, targetUser })
    return NextResponse.json(
      fail('DATABASE_ERROR', 'Failed to load permissions', { error: adminError.message }, requestId),
      { status: 500 }
    )
  }

  // Get admin permissions
  const { data: permData, error: permError } = await supabase
    .from('admin_permissions')
    .select('can_manage_invitations, last_password_reset_requested_at')
    .eq('user_id', targetUser)
    .maybeSingle()

  if (permError) {
    logger.error('[Admin Permissions] Failed to load permissions', permError, { requestId, targetUser })
    return NextResponse.json(
      fail('DATABASE_ERROR', 'Failed to load permissions', { error: permError.message }, requestId),
      { status: 500 }
    )
  }

  const record = {
    user_id: targetUser,
    is_admin: !!adminData,
    can_manage_invitations: permData?.can_manage_invitations ?? false,
    last_password_reset_requested_at: permData?.last_password_reset_requested_at ?? null,
  }

  logger.info('[Admin Permissions] Permissions loaded successfully', { requestId, targetUser })
  return NextResponse.json(ok(record, requestId))
})


