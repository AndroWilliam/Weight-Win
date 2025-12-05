import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const campaign_id = searchParams.get('campaign_id')
    const user_id = searchParams.get('user_id')
    
    if (!campaign_id || !user_id) {
      return NextResponse.json(
        { can_join: false, reason: 'Missing parameters' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Check eligibility using helper function
    const { data, error } = await supabase
      .rpc('can_user_join_campaign', {
        p_campaign_id: campaign_id,
        p_user_id: user_id
      })
    
    if (error) {
      console.error('Check eligibility error:', error)
      return NextResponse.json({
        can_join: false,
        reason: 'Error checking eligibility'
      })
    }
    
    return NextResponse.json({
      can_join: data || false,
      reason: data ? undefined : 'Already participating in this campaign'
    })
  } catch (error) {
    console.error('Check eligibility error:', error)
    return NextResponse.json({
      can_join: false,
      reason: 'Internal error'
    })
  }
}

