import { NextResponse } from 'next/server'
import { userIsAdmin } from '@/lib/admin/guard'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

export async function GET(
  _request: Request,
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

    const supabase = createServiceSupabaseClient()
    const { data, error } = await supabase.rpc('get_admin_permissions', {
      target_user: targetUser,
    })

    if (error) {
      console.error('[Admin Permissions] RPC error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to load permissions' },
        { status: 500 }
      )
    }

    const record = Array.isArray(data) ? data[0] : data

    return NextResponse.json({ success: true, data: record ?? null })
  } catch (error) {
    console.error('[Admin Permissions] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}


