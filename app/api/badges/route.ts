import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Call the get user badges function
    const { data, error } = await supabase
      .rpc('get_user_badges', { p_user_id: user.id })
    
    if (error) {
      console.error('[Badges API] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch badges', details: error.message },
        { status: 500 }
      )
    }
    
    // Also get milestone progress for stats
    const { data: progressData, error: progressError } = await supabase
      .rpc('get_user_milestone_progress', { p_user_id: user.id })
    
    if (progressError) {
      console.error('[Badges API] Progress error:', progressError)
    }
    
    return NextResponse.json({
      success: true,
      badges: data,
      progress: progressData || null
    })
    
  } catch (error) {
    console.error('[Badges API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

