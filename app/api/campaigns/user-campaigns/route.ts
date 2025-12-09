import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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

    // Fetch all active campaigns with partner info
    const now = new Date().toISOString()
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select(`
        *,
        partner:partners(
          id,
          name,
          logo_url
        )
      `)
      .eq('status', 'active')
      .lte('start_date', now)
      .gte('end_date', now)
      .order('priority', { ascending: false })

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch campaigns' },
        { status: 500 }
      )
    }

    // Fetch user's participations
    const { data: participations, error: participationsError } = await supabase
      .from('campaign_participants')
      .select('*')
      .eq('user_id', user.id)

    if (participationsError) {
      console.error('Error fetching participations:', participationsError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch participations' },
        { status: 500 }
      )
    }

    // Create a map of campaign_id to participation
    const participationMap = new Map(
      (participations || []).map(p => [p.campaign_id, p])
    )

    const participating = []
    const available = []

    // Process each campaign
    for (const campaign of campaigns || []) {
      const participation = participationMap.get(campaign.id)

      if (participation) {
        // User is participating - calculate progress
        const { data: weightEntries, error: weightError } = await supabase
          .from('weight_entries')
          .select('id, created_at')
          .eq('user_id', user.id)
          .gte('created_at', participation.started_at)
          .order('created_at', { ascending: true })

        if (weightError) {
          console.error('Error fetching weight entries:', weightError)
          continue
        }

        // Count unique days completed
        const uniqueDays = new Set(
          (weightEntries || []).map(entry =>
            new Date(entry.created_at).toISOString().split('T')[0]
          )
        )
        const days_completed = uniqueDays.size

        // Calculate progress percentage
        const progress_percentage = Math.min(
          Math.round((days_completed / campaign.required_days) * 100),
          100
        )

        participating.push({
          id: campaign.id,
          name: campaign.name,
          partner_name: campaign.partner?.name || '',
          banner_logo_url: campaign.banner_logo_url,
          reward_type: campaign.reward_type,
          discount_percentage: campaign.discount_percentage,
          discount_amount: campaign.discount_amount,
          required_days: campaign.required_days,
          banner_heading: campaign.banner_heading,
          banner_body: campaign.banner_body,
          cta_text: campaign.cta_text,
          status: campaign.status,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          primary_color: campaign.primary_color,
          secondary_color: campaign.secondary_color,
          // Participation data
          participation_id: participation.id,
          days_completed,
          started_at: participation.started_at,
          progress_percentage,
          phone_submitted: !!participation.phone_number,
          phone_number: participation.phone_number,
          participation_status: participation.status
        })
      } else {
        // User is not participating - add to available
        available.push({
          id: campaign.id,
          name: campaign.name,
          partner_name: campaign.partner?.name || '',
          banner_logo_url: campaign.banner_logo_url,
          reward_type: campaign.reward_type,
          discount_percentage: campaign.discount_percentage,
          discount_amount: campaign.discount_amount,
          required_days: campaign.required_days,
          banner_heading: campaign.banner_heading,
          banner_body: campaign.banner_body,
          cta_text: campaign.cta_text,
          status: campaign.status,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          primary_color: campaign.primary_color,
          secondary_color: campaign.secondary_color
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        participating,
        available
      }
    })
  } catch (error) {
    console.error('User campaigns error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
