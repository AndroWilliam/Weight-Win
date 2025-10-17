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
  const { data, error } = await supabase.rpc('get_admin_permissions', {
    target_user: targetUser,
  })

  if (error) {
    logger.error('[Admin Permissions] RPC error', error, { requestId, targetUser })
    return NextResponse.json(
      fail('DATABASE_ERROR', 'Failed to load permissions', { error: error.message }, requestId),
      { status: 500 }
    )
  }

  const record = Array.isArray(data) ? data[0] : data

  logger.info('[Admin Permissions] Permissions loaded successfully', { requestId, targetUser })
  return NextResponse.json(ok(record ?? null, requestId))
})


