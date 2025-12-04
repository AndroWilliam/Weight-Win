import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/admin/campaigns/[id]/pause
 * Pause an active campaign
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Step 1: Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    // Step 2: Check if user is admin
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('is_admin', { user_id: user.id })
    
    if (adminError || !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' }, 
        { status: 403 }
      )
    }
    
    // Step 3: Get campaign
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('status')
      .eq('id', params.id)
      .single()
    
    if (fetchError || !campaign) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Campaign not found'
      }, { status: 404 })
    }
    
    // Step 4: Check current status
    if (campaign.status !== 'active') {
      return NextResponse.json({
        error: 'Conflict',
        message: 'Only active campaigns can be paused'
      }, { status: 409 })
    }
    
    // Step 5: Pause campaign
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaigns')
      .update({ status: 'paused' })
      .eq('id', params.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to pause campaign'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Campaign paused successfully',
      data: updatedCampaign
    }, { status: 200 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

