import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { userIsAdmin } from '@/lib/admin/guard'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { withHandler } from '@/lib/api/with-handler'
import { ok, fail } from '@/lib/api/responses'
import { logger } from '@/lib/logger'

const bodySchema = z.object({
  allow: z.boolean(),
})

export const POST = withHandler(async (req: NextRequest, ctx: { params: { userId: string } }, requestId?: string) => {
  logger.info('[Toggle Invitations] Request started', { requestId, userId: ctx.params.userId })

  const isAdmin = await userIsAdmin()
  if (!isAdmin) {
    logger.info('[Toggle Invitations] Unauthorized access attempt', { requestId })
    return NextResponse.json(fail('UNAUTHORIZED', 'Admin access required', undefined, requestId), { status: 403 })
  }

  const targetUser = ctx.params.userId
  if (!targetUser) {
    logger.info('[Toggle Invitations] Missing user id', { requestId })
    return NextResponse.json(fail('BAD_REQUEST', 'Missing user id', undefined, requestId), { status: 400 })
  }

  const json = await req.json().catch(() => ({}))
  const parse = bodySchema.safeParse(json)
  if (!parse.success) {
    logger.info('[Toggle Invitations] Invalid request body', { requestId, errors: parse.error.flatten() })
    return NextResponse.json(
      fail('BAD_REQUEST', 'Invalid request body', parse.error.flatten(), requestId),
      { status: 400 }
    )
  }

  const supabase = createServiceSupabaseClient()
  const { allow } = parse.data

  // Get current admin user for tracking
  const currentAdminClient = await (await import('@/lib/supabase/server')).createClient()
  const { data: { user } } = await currentAdminClient.auth.getUser()
  const callerUserId = user?.id

  // Update invitation permission
  const { error: updateError } = await supabase
    .from('admin_permissions')
    .upsert(
      {
        user_id: targetUser,
        can_manage_invitations: allow,
        updated_at: new Date().toISOString(),
        updated_by: callerUserId,
      },
      { onConflict: 'user_id' }
    )

  if (updateError) {
    logger.error('[Toggle Invitations] Failed to update invitation permission', updateError, { requestId, targetUser, allow })
    return NextResponse.json(
      fail('DATABASE_ERROR', 'Failed to update invitation permission', { error: updateError.message }, requestId),
      { status: 500 }
    )
  }

  // Return updated permission
  const { data: permData } = await supabase
    .from('admin_permissions')
    .select('can_manage_invitations')
    .eq('user_id', targetUser)
    .maybeSingle()

  const record = { can_manage_invitations: permData?.can_manage_invitations ?? false }

  logger.info('[Toggle Invitations] Invitation permission updated successfully', { requestId, targetUser, allow })
  return NextResponse.json(ok(record, requestId))
})


