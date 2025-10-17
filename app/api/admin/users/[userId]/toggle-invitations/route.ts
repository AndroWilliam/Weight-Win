import { NextResponse } from 'next/server'
import { z } from 'zod'
import { userIsAdmin } from '@/lib/admin/guard'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

const bodySchema = z.object({
  allow: z.boolean(),
})

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const isAdmin = await userIsAdmin()
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const targetUser = params.userId
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Missing user id' }, { status: 400 })
    }

    const json = await request.json().catch(() => ({}))
    const parse = bodySchema.safeParse(json)
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid body', details: parse.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = createServiceSupabaseClient()
    const { data, error } = await supabase.rpc('set_admin_invitation_permission', {
      target_user: targetUser,
      allow: parse.data.allow,
    })

    if (error) {
      console.error('[Toggle Invitations] RPC error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update invitation permission' },
        { status: 500 }
      )
    }

    const record = Array.isArray(data) ? data[0] : data

    return NextResponse.json({ success: true, data: record ?? null })
  } catch (error) {
    console.error('[Toggle Invitations] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}


