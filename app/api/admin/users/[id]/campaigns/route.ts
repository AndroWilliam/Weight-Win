import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // 1. Check if requesting user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: isAdmin, error: adminCheckError } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (adminCheckError || !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // 2. Fetch user's campaigns
    const userId = params.id

    const { data: participations, error: participationsError } = await supabase
      .from('campaign_participants')
      .select(`
        *,
        campaigns (
          id,
          name,
          status
        )
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (participationsError) {
      console.error('[Admin Campaigns API] Error fetching participations:', participationsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch campaigns' },
        { status: 500 }
      )
    }

    // 3. Format campaigns
    const campaigns = participations?.map(p => {
      const campaign = p.campaigns as any
      const campaignName = campaign?.name || ''

      // Extract emoji (e.g., "⚽ BOLD Soccer" → "⚽")
      const emojiMatch = campaignName.match(/^(\p{Emoji}+)\s*/u)
      const emoji = emojiMatch ? emojiMatch[1] : '🎯'

      // Create short name (remove emoji, truncate)
      const nameWithoutEmoji = campaignName.replace(/^(\p{Emoji}+)\s*/u, '')
      const shortName = nameWithoutEmoji.length > 15
        ? nameWithoutEmoji.substring(0, 15) + '...'
        : nameWithoutEmoji

      return {
        id: campaign?.id,
        name: campaign?.name,
        short_name: shortName,
        emoji: emoji,
        status: p.status, // in_progress, completed, abandoned
        campaign_status: campaign?.status, // active, ended
        started_at: p.started_at,
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: campaigns,
    })
  } catch (error) {
    console.error('[Admin Campaigns API] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
