import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/analytics/dashboard
 * Get global dashboard statistics across all campaigns
 */
export async function GET(request: Request) {
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
    
    // Step 3: Get all campaigns
    const { data: campaigns, count: totalCampaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact' })
    
    if (campaignsError) {
      console.error('Campaigns query error:', campaignsError)
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to fetch campaigns'
      }, { status: 500 })
    }
    
    if (!campaigns) {
      return NextResponse.json({
        success: true,
        data: {
          overview: {
            total_campaigns: 0,
            active_campaigns: 0,
            scheduled_campaigns: 0,
            ended_campaigns: 0,
            total_partners: 0,
            total_participants: 0
          },
          totals: {
            banner_clicks: 0,
            challenge_starts: 0,
            completions: 0,
            phone_submissions: 0,
            estimated_cost: 0
          },
          avg_conversion: {
            click_to_start: '0',
            completion_rate: '0',
            phone_submission_rate: '0'
          },
          recent_activity: {
            new_participants_7d: 0,
            new_completions_7d: 0
          },
          top_campaigns: []
        }
      })
    }
    
    // Step 4: Count by status
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length
    const scheduledCampaigns = campaigns.filter(c => c.status === 'scheduled').length
    const endedCampaigns = campaigns.filter(c => c.status === 'ended').length
    
    // Step 5: Get total participants count
    const { count: totalParticipants, error: participantsError } = await supabase
      .from('campaign_participants')
      .select('*', { count: 'exact', head: true })
    
    if (participantsError) {
      console.error('Participants query error:', participantsError)
      // Continue with 0 if table doesn't exist yet
    }
    
    // Step 6: Calculate totals across all campaigns
    const totals = campaigns.reduce((acc, campaign) => ({
      banner_clicks: acc.banner_clicks + (campaign.banner_clicks || 0),
      challenge_starts: acc.challenge_starts + (campaign.challenge_starts || 0),
      completions: acc.completions + (campaign.completions || 0),
      phone_submissions: acc.phone_submissions + (campaign.phone_submissions || 0),
      estimated_cost: acc.estimated_cost + (campaign.estimated_cost || 0)
    }), {
      banner_clicks: 0,
      challenge_starts: 0,
      completions: 0,
      phone_submissions: 0,
      estimated_cost: 0
    })
    
    // Step 7: Calculate average conversion rates
    const avgConversion = {
      click_to_start: totals.banner_clicks > 0
        ? ((totals.challenge_starts / totals.banner_clicks) * 100).toFixed(2)
        : '0',
      completion_rate: totals.challenge_starts > 0
        ? ((totals.completions / totals.challenge_starts) * 100).toFixed(2)
        : '0',
      phone_submission_rate: totals.completions > 0
        ? ((totals.phone_submissions / totals.completions) * 100).toFixed(2)
        : '0'
    }
    
    // Step 8: Get partners count
    const { count: totalPartners, error: partnersError } = await supabase
      .from('partners')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
    
    if (partnersError) {
      console.error('Partners query error:', partnersError)
      // Continue with 0 if table doesn't exist yet
    }
    
    // Step 9: Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    let recentParticipants = 0
    let recentCompletions = 0
    
    try {
      const { count: recentParticipantsCount } = await supabase
        .from('campaign_participants')
        .select('*', { count: 'exact', head: true })
        .gte('started_at', sevenDaysAgo)
      recentParticipants = recentParticipantsCount || 0
      
      const { count: recentCompletionsCount } = await supabase
        .from('campaign_participants')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', sevenDaysAgo)
      recentCompletions = recentCompletionsCount || 0
    } catch (error) {
      console.error('Recent activity query error:', error)
      // Continue with 0 if queries fail
    }
    
    // Step 10: Get top performing campaigns (by completion rate)
    const topCampaigns = campaigns
      .map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        completions: c.completions || 0,
        challenge_starts: c.challenge_starts || 0,
        completion_rate: c.challenge_starts > 0
          ? ((c.completions / c.challenge_starts) * 100).toFixed(2)
          : '0'
      }))
      .sort((a, b) => parseFloat(b.completion_rate) - parseFloat(a.completion_rate))
      .slice(0, 5)
    
    // Step 11: Return dashboard data
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total_campaigns: totalCampaigns || 0,
          active_campaigns: activeCampaigns,
          scheduled_campaigns: scheduledCampaigns,
          ended_campaigns: endedCampaigns,
          total_partners: totalPartners || 0,
          total_participants: totalParticipants || 0
        },
        totals: {
          banner_clicks: totals.banner_clicks,
          challenge_starts: totals.challenge_starts,
          completions: totals.completions,
          phone_submissions: totals.phone_submissions,
          estimated_cost: totals.estimated_cost
        },
        avg_conversion: avgConversion,
        recent_activity: {
          new_participants_7d: recentParticipants,
          new_completions_7d: recentCompletions
        },
        top_campaigns: topCampaigns
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('Dashboard Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

