import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateSlug, ensureUniqueSlug } from '@/lib/helpers/partners'

// Validation schema for updating a campaign
const updateCampaignSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  
  // Reward Details (only if not active)
  reward_type: z.enum(['discount', 'free_item', 'voucher', 'gift_card']).optional(),
  discount_percentage: z.number().int().min(0).max(100).optional(),
  reward_description: z.string().min(10).optional(),
  terms_conditions: z.string().optional().nullable(),
  
  // Challenge Requirements (only if not active)
  required_days: z.number().int().min(1).max(90).optional(),
  require_phone: z.boolean().optional(),
  reuse_phone: z.boolean().optional(),
  allow_multiple_participation: z.boolean().optional(),
  capacity: z.number().int().positive().optional().nullable(),
  
  // Banner Design (only if not active)
  banner_heading: z.string().min(3).max(200).optional(),
  banner_body: z.string().min(10).optional(),
  cta_text: z.string().min(2).max(100).optional(),
  banner_logo_url: z.string().url().optional().nullable(),
  banner_bg_url: z.string().url().optional().nullable(),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  
  // Scheduling (always allowed)
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  auto_activate: z.boolean().optional(),
  auto_deactivate: z.boolean().optional(),
  priority: z.number().int().optional(),
  
  // Status (always allowed for manual control)
  status: z.enum(['scheduled', 'active', 'paused', 'ended', 'archived']).optional(),
  
  // Cost (always allowed)
  estimated_cost: z.number().positive().optional().nullable(),
  
  // Notifications
  send_email_notification: z.boolean().optional(),
  email_template: z.string().optional().nullable(),
  
  // Confirmation flag for active campaigns
  confirm_update: z.boolean().optional()
})

/**
 * GET /api/admin/campaigns/[id]
 * Get campaign details with partner info and statistics
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
    
    // Step 3: Get campaign with partner and participants
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        partner:partners(*),
        participants:campaign_participants(
          id,
          user_id,
          started_at,
          completed_at,
          phone_number,
          days_completed,
          status
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (error || !campaign) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Campaign not found'
      }, { status: 404 })
    }
    
    // Step 4: Calculate statistics
    const participants = campaign.participants || []
    const stats = {
      total_participants: participants.length,
      active_participants: participants.filter((p: any) => p.status === 'active').length,
      completed_participants: participants.filter((p: any) => p.status === 'completed').length,
      phone_submission_rate: (campaign.phone_submissions / (campaign.completions || 1)) * 100,
      completion_rate: (campaign.completions / (campaign.challenge_starts || 1)) * 100,
      click_to_start_rate: (campaign.challenge_starts / (campaign.banner_clicks || 1)) * 100
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...campaign,
        statistics: stats
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * PUT /api/admin/campaigns/[id]
 * Update campaign information (with restrictions for active campaigns)
 */
export async function PUT(
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
    
    // Step 3: Get current campaign
    const { data: currentCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (fetchError || !currentCampaign) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Campaign not found'
      }, { status: 404 })
    }
    
    // Step 4: Parse and validate request body
    const body = await request.json()
    const validation = updateCampaignSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 })
    }
    
    const validatedData = validation.data
    
    // Step 5: Check if campaign is active and validate restricted updates
    const isActive = currentCampaign.status === 'active'
    
    if (isActive) {
      const restrictedFields = [
        'reward_type', 'discount_percentage', 'reward_description',
        'required_days', 'require_phone', 'reuse_phone',
        'banner_heading', 'banner_body', 'cta_text',
        'banner_logo_url', 'banner_bg_url',
        'primary_color', 'secondary_color'
      ]
      
      const hasRestrictedUpdates = restrictedFields.some(
        field => (validatedData as any)[field] !== undefined
      )
      
      if (hasRestrictedUpdates) {
        // Require confirmation
        if (!validatedData.confirm_update) {
          return NextResponse.json({
            error: 'Confirmation required',
            message: 'Campaign is active. Changing core details requires confirmation.',
            restricted_fields: restrictedFields.filter(f => (validatedData as any)[f] !== undefined)
          }, { status: 409 })
        }
      }
    }
    
    // Step 6: If name changed, regenerate slug
    let updateData: any = { ...validatedData }
    if (validatedData.name && validatedData.name !== currentCampaign.name) {
      const baseSlug = generateSlug(validatedData.name)
      const uniqueSlug = await ensureUniqueSlug(
        supabase,
        baseSlug,
        params.id,
        'campaigns'
      )
      updateData.slug = uniqueSlug
    }
    
    // Step 7: Validate dates if provided
    if (validatedData.start_date || validatedData.end_date) {
      const startDate = new Date(validatedData.start_date || currentCampaign.start_date)
      const endDate = new Date(validatedData.end_date || currentCampaign.end_date)
      
      if (endDate <= startDate) {
        return NextResponse.json({
          error: 'Validation failed',
          message: 'End date must be after start date'
        }, { status: 400 })
      }
    }
    
    // Step 8: Update campaign
    delete updateData.confirm_update // Don't save this field
    
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to update campaign'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      data: updatedCampaign
    }, { status: 200 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/campaigns/[id]
 * Archive campaign (soft delete - cannot delete active campaigns)
 */
export async function DELETE(
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
    
    // Step 4: Check if campaign is active
    if (campaign.status === 'active') {
      return NextResponse.json({
        error: 'Conflict',
        message: 'Cannot archive active campaign. Please pause it first.'
      }, { status: 409 })
    }
    
    // Step 5: Archive (soft delete)
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString()
      })
      .eq('id', params.id)
    
    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to archive campaign'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Campaign archived successfully'
    }, { status: 200 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

