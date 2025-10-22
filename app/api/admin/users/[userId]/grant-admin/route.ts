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
  const { enable } = parse.data

  // Get current admin user for tracking
  const currentAdminClient = await (await import('@/lib/supabase/server')).createClient()
  const { data: { user } } = await currentAdminClient.auth.getUser()
  const callerUserId = user?.id

  if (enable) {
    // Grant admin access
    const { error: insertError } = await supabase
      .from('admins')
      .insert({ user_id: targetUser, created_by: callerUserId })
      .select()

    if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
      logger.error('[Grant Admin] Failed to grant admin access', insertError, { requestId, targetUser, enable })
      return NextResponse.json(
        fail('DATABASE_ERROR', 'Failed to update admin status', { error: insertError.message }, requestId),
        { status: 500 }
      )
    }
  } else {
    // Revoke admin access
    const { error: deleteError } = await supabase
      .from('admins')
      .delete()
      .eq('user_id', targetUser)

    if (deleteError) {
      logger.error('[Grant Admin] Failed to revoke admin access', deleteError, { requestId, targetUser, enable })
      return NextResponse.json(
        fail('DATABASE_ERROR', 'Failed to update admin status', { error: deleteError.message }, requestId),
        { status: 500 }
      )
    }
  }

  // Update admin_permissions table timestamp
  const { error: permError } = await supabase
    .from('admin_permissions')
    .upsert(
      { user_id: targetUser, updated_at: new Date().toISOString(), updated_by: callerUserId },
      { onConflict: 'user_id' }
    )

  if (permError) {
    logger.error('[Grant Admin] Failed to update permissions timestamp', permError, { requestId, targetUser })
  }

  // Return current admin status
  const { data: adminCheck } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', targetUser)
    .maybeSingle()

  const record = { is_admin: !!adminCheck }

  logger.info('[Grant Admin] Admin status updated successfully', { requestId, targetUser, enable })
  return NextResponse.json(ok(record, requestId))
})


