import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  campaign_id: z.string().uuid()
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const validation = schema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Missing campaign_id' },
        { status: 400 }
      )
    }

    const { campaign_id } = validation.data

    // Check if user already participating
    const { data: existingParticipation, error: checkError } = await supabase
      .from('campaign_participants')
      .select('id')
      .eq('campaign_id', campaign_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking participation:', checkError)
      return NextResponse.json(
        { success: false, message: 'Failed to check participation' },
        { status: 500 }
      )
    }

    if (existingParticipation) {
      return NextResponse.json(
        { success: false, message: 'Already participating in this campaign' },
        { status: 400 }
      )
    }

    // Insert into campaign_participants
    const { data: participation, error: participationError } = await supabase
      .from('campaign_participants')
      .insert({
        campaign_id,
        user_id: user.id,
        status: 'active',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (participationError) {
      console.error('Error creating participation:', participationError)
      return NextResponse.json(
        { success: false, message: 'Failed to join campaign' },
        { status: 500 }
      )
    }

    // Insert into campaign_clicks
    const { error: clickError } = await supabase
      .from('campaign_clicks')
      .insert({
        campaign_id,
        user_id: user.id,
        clicked_at: new Date().toISOString()
      })

    if (clickError) {
      console.error('Error tracking click:', clickError)
      // Don't fail the request if click tracking fails
    }

    return NextResponse.json({
      success: true,
      data: {
        id: participation.id,
        campaign_id: participation.campaign_id,
        user_id: participation.user_id,
        status: participation.status,
        joined_at: participation.started_at
      }
    })
  } catch (error) {
    console.error('Join campaign error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

