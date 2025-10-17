import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { userIsAdmin } from '@/lib/admin/guard'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { withHandler } from '@/lib/api/with-handler'
import { ok, fail } from '@/lib/api/responses'
import { logger } from '@/lib/logger'

const bodySchema = z.object({
  enable: z.boolean(),
})

export const POST = withHandler(async (req: NextRequest, ctx: { params: { userId: string } }, requestId?: string) => {
  logger.info('[Grant Admin] Request started', { requestId, userId: ctx.params.userId })

  const isAdmin = await userIsAdmin()
  if (!isAdmin) {
    logger.info('[Grant Admin] Unauthorized access attempt', { requestId })
    return NextResponse.json(fail('UNAUTHORIZED', 'Admin access required', undefined, requestId), { status: 403 })
  }

  const targetUser = ctx.params.userId
  if (!targetUser) {
    logger.info('[Grant Admin] Missing user id', { requestId })
    return NextResponse.json(fail('BAD_REQUEST', 'Missing user id', undefined, requestId), { status: 400 })
  }

  const json = await req.json().catch(() => ({}))
  const parse = bodySchema.safeParse(json)
  if (!parse.success) {
    logger.info('[Grant Admin] Invalid request body', { requestId, errors: parse.error.flatten() })
    return NextResponse.json(
      fail('BAD_REQUEST', 'Invalid request body', parse.error.flatten(), requestId),
      { status: 400 }
    )
  }

  const supabase = createServiceSupabaseClient()
  const { data, error } = await supabase.rpc('set_admin_status', {
    target_user: targetUser,
    should_be_admin: parse.data.enable,
  })

  if (error) {
    logger.error('[Grant Admin] RPC error', error, { requestId, targetUser, enable: parse.data.enable })
    return NextResponse.json(
      fail('DATABASE_ERROR', 'Failed to update admin status', { error: error.message }, requestId),
      { status: 500 }
    )
  }

  const record = Array.isArray(data) ? data[0] : data

  logger.info('[Grant Admin] Admin status updated successfully', { requestId, targetUser, enable: parse.data.enable })
  return NextResponse.json(ok(record ?? null, requestId))
})


