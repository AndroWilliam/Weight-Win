import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ensureUniqueSlug } from '@/lib/helpers/partners'

/**
 * POST /api/admin/campaigns/[id]/clone
 * Clone an existing campaign with reset analytics
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
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
    
    // Step 3: Get source campaign
    const { data: sourceCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (fetchError || !sourceCampaign) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Source campaign not found'
      }, { status: 404 })
    }
    
    // Step 4: Calculate duration of original campaign
    const originalDuration = new Date(sourceCampaign.end_date).getTime() - 
                            new Date(sourceCampaign.start_date).getTime()
    
    // Step 5: Generate unique slug for cloned campaign
    const baseSlug = `${sourceCampaign.slug}-copy`
    const uniqueSlug = await ensureUniqueSlug(
      supabase,
      baseSlug,
      undefined,
      'campaigns'
    )
    
    // Step 6: Create new campaign object
    const now = new Date()
    const newEndDate = new Date(now.getTime() + originalDuration)
    
    const newCampaign = {
      partner_id: sourceCampaign.partner_id,
      name: `${sourceCampaign.name} - Copy`,
      slug: uniqueSlug,
      reward_type: sourceCampaign.reward_type,
      discount_percentage: sourceCampaign.discount_percentage,
      reward_description: sourceCampaign.reward_description,
      terms_conditions: sourceCampaign.terms_conditions,
      required_days: sourceCampaign.required_days,
      require_phone: sourceCampaign.require_phone,
      reuse_phone: sourceCampaign.reuse_phone,
      allow_multiple_participation: sourceCampaign.allow_multiple_participation,
      capacity: sourceCampaign.capacity,
      banner_heading: sourceCampaign.banner_heading,
      banner_body: sourceCampaign.banner_body,
      cta_text: sourceCampaign.cta_text,
      banner_logo_url: sourceCampaign.banner_logo_url,
      banner_bg_url: sourceCampaign.banner_bg_url,
      primary_color: sourceCampaign.primary_color,
      secondary_color: sourceCampaign.secondary_color,
      start_date: now.toISOString(),
      end_date: newEndDate.toISOString(),
      auto_activate: sourceCampaign.auto_activate,
      auto_deactivate: sourceCampaign.auto_deactivate,
      priority: sourceCampaign.priority,
      status: 'scheduled',
      estimated_cost: sourceCampaign.estimated_cost,
      banner_clicks: 0,
      challenge_starts: 0,
      completions: 0,
      phone_submissions: 0,
      send_email_notification: sourceCampaign.send_email_notification,
      email_template: sourceCampaign.email_template,
      archived_at: null
    }
    
    // Step 7: Insert cloned campaign
    const { data: clonedCampaign, error: insertError } = await supabase
      .from('campaigns')
      .insert(newCampaign)
      .select()
      .single()
    
    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to clone campaign'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Campaign cloned successfully',
      data: clonedCampaign
    }, { status: 201 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

