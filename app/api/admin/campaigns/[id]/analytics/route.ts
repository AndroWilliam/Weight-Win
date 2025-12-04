import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/campaigns/[id]/analytics
 * Get comprehensive analytics for a campaign
 */
export async function GET(
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
    
    // Step 3: Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        partner:partners(id, name, logo_url)
      `)
      .eq('id', params.id)
      .single()
    
    if (campaignError || !campaign) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Campaign not found'
      }, { status: 404 })
    }
    
    // Step 4: Get all participants
    const { data: participants } = await supabase
      .from('campaign_participants')
      .select('*')
      .eq('campaign_id', params.id)
    
    // Step 5: Calculate conversion metrics
    const metrics = {
      banner_clicks: campaign.banner_clicks || 0,
      challenge_starts: campaign.challenge_starts || 0,
      active_participants: participants?.filter(p => p.status === 'active').length || 0,
      completions: campaign.completions || 0,
      phone_submissions: campaign.phone_submissions || 0,
      
      // Conversion rates
      click_to_start_rate: campaign.banner_clicks > 0 
        ? ((campaign.challenge_starts / campaign.banner_clicks) * 100).toFixed(2)
        : '0',
      completion_rate: campaign.challenge_starts > 0
        ? ((campaign.completions / campaign.challenge_starts) * 100).toFixed(2)
        : '0',
      phone_submission_rate: campaign.completions > 0
        ? ((campaign.phone_submissions / campaign.completions) * 100).toFixed(2)
        : '0',
      overall_conversion: campaign.banner_clicks > 0
        ? ((campaign.phone_submissions / campaign.banner_clicks) * 100).toFixed(2)
        : '0'
    }
    
    // Step 6: Calculate cost metrics
    const estimatedCost = campaign.estimated_cost || 0
    const estimatedRevenue = campaign.phone_submissions * (estimatedCost * 0.15) // 15% conversion value
    const roi = estimatedCost > 0
      ? (((estimatedRevenue - estimatedCost) / estimatedCost) * 100).toFixed(2)
      : '0'
    const costPerAcquisition = campaign.phone_submissions > 0
      ? (estimatedCost / campaign.phone_submissions).toFixed(2)
      : '0'
    
    const costAnalysis = {
      estimated_cost: estimatedCost,
      estimated_revenue: estimatedRevenue.toFixed(2),
      roi: roi,
      cost_per_acquisition: costPerAcquisition
    }
    
    // Step 7: Generate timeline data (group participants by started_at day)
    const timelineMap = new Map<string, { clicks: number; starts: number }>()
    
    // Group participants by day
    participants?.forEach(p => {
      const day = p.started_at.split('T')[0]
      const existing = timelineMap.get(day) || { clicks: 0, starts: 0 }
      timelineMap.set(day, { ...existing, starts: existing.starts + 1 })
    })
    
    // Convert to sorted array
    const timeline = Array.from(timelineMap.entries())
      .map(([date, data]) => ({
        date,
        clicks: data.clicks,
        starts: data.starts
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
    
    // Step 8: Find top performers (fastest completions)
    const completedParticipants = participants?.filter(
      p => p.status === 'completed' && p.completed_at
    ) || []
    
    const topPerformers = completedParticipants
      .map(p => {
        const startDate = new Date(p.started_at)
        const endDate = new Date(p.completed_at!)
        const daysToComplete = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        return {
          user_id: p.user_id,
          user_email: 'User', // Email not available without joining auth.users
          days_to_complete: daysToComplete,
          completed_at: p.completed_at!,
          phone_provided: !!p.phone_number
        }
      })
      .sort((a, b) => a.days_to_complete - b.days_to_complete)
      .slice(0, 10) // Top 10
    
    // Step 9: Participant status breakdown
    const statusBreakdown = {
      active: participants?.filter(p => p.status === 'active').length || 0,
      completed: participants?.filter(p => p.status === 'completed').length || 0,
      abandoned: participants?.filter(p => p.status === 'abandoned').length || 0
    }
    
    // Step 10: Calculate summary stats
    const campaignDurationDays = Math.ceil(
      (new Date(campaign.end_date).getTime() - new Date(campaign.start_date).getTime()) / 
      (1000 * 60 * 60 * 24)
    )
    
    const avgDaysToComplete = topPerformers.length > 0
      ? (topPerformers.reduce((sum, p) => sum + p.days_to_complete, 0) / topPerformers.length).toFixed(1)
      : '0'
    
    // Step 11: Return analytics
    return NextResponse.json({
      success: true,
      data: {
        campaign: {
          id: campaign.id,
          name: campaign.name,
          slug: campaign.slug,
          status: campaign.status,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          required_days: campaign.required_days,
          partner: campaign.partner
        },
        metrics,
        cost_analysis: costAnalysis,
        timeline,
        top_performers: topPerformers,
        status_breakdown: statusBreakdown,
        summary: {
          total_participants: participants?.length || 0,
          campaign_duration_days: campaignDurationDays,
          avg_days_to_complete: avgDaysToComplete
        }
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('Analytics Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

