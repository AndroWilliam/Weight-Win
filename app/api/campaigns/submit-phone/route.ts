import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  participation_id: z.string().uuid(),
  phone_number: z.string().min(1)
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
        { success: false, message: 'Missing participation_id or phone_number' },
        { status: 400 }
      )
    }

    const { participation_id, phone_number } = validation.data

    // Verify participation exists and belongs to user
    const { data: participation, error: fetchError } = await supabase
      .from('campaign_participants')
      .select('id, campaign_id')
      .eq('id', participation_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching participation:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch participation' },
        { status: 500 }
      )
    }

    if (!participation) {
      return NextResponse.json(
        { success: false, message: 'Participation not found' },
        { status: 404 }
      )
    }

    // Update participation with phone number and mark as completed
    const { error: updateError } = await supabase
      .from('campaign_participants')
      .update({
        phone_number,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', participation_id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating participation:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to submit phone number' },
        { status: 500 }
      )
    }

    // Update campaign phone_submissions counter
    const { error: counterError } = await supabase
      .rpc('increment_phone_submissions', {
        p_campaign_id: participation.campaign_id
      })

    if (counterError) {
      console.error('Error updating phone submissions counter:', counterError)
      // Don't fail the request if counter update fails
    }

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Submit phone error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
