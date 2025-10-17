import { NextResponse } from 'next/server'
import { userIsAdmin } from '@/lib/admin/guard'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

export async function POST(
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

    const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL
    if (!origin) {
      console.error('[Password Reset] Missing NEXT_PUBLIC_APP_URL')
      return NextResponse.json(
        { success: false, error: 'Server not configured for password reset' },
        { status: 500 }
      )
    }

    const adminClient = createServiceSupabaseClient()
    const { data: targetUserRes, error: fetchUserError } = await adminClient.auth.admin.getUserById(targetUser)

    if (fetchUserError) {
      console.error('[Password Reset] Fetch user error:', fetchUserError)
      return NextResponse.json(
        { success: false, error: 'Failed to load user' },
        { status: 500 }
      )
    }

    const email = targetUserRes?.user?.email
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'User email not found' },
        { status: 404 }
      )
    }

    const { error: resetError } = await adminClient.auth.admin.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback`,
    })

    if (resetError) {
      console.error('[Password Reset] Admin API error:', resetError)
      return NextResponse.json(
        { success: false, error: 'Failed to send password reset email' },
        { status: 500 }
      )
    }

    const { data, error: recordError } = await adminClient.rpc('record_admin_password_reset', {
      target_user: targetUser,
    })

    if (recordError) {
      console.error('[Password Reset] Record RPC error:', recordError)
      return NextResponse.json(
        { success: false, error: 'Password reset email sent, but logging failed' },
        { status: 500 }
      )
    }

    const record = Array.isArray(data) ? data[0] : data

    return NextResponse.json({ success: true, data: record ?? null })
  } catch (error) {
    console.error('[Password Reset] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}


