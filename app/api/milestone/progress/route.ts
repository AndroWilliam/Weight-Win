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
    
    // Call the milestone progress function
    const { data, error } = await supabase
      .rpc('get_user_milestone_progress', { p_user_id: user.id })
    
    if (error) {
      console.error('[Milestone Progress API] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch milestone progress', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: data
    })
    
  } catch (error) {
    console.error('[Milestone Progress API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

