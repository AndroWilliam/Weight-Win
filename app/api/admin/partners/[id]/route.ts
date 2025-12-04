import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateSlug, ensureUniqueSlug } from '@/lib/helpers/partners'

// Validation schema for updating a partner
const updatePartnerSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  logo_url: z.string().url().optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  contact_phone: z.string().max(20).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  website: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
  active: z.boolean().optional()
})

/**
 * GET /api/admin/partners/[id]
 * Get partner details with campaigns
 */
export async function GET(
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
      .rpc('is_admin', { uid: user.id })
    
    if (adminError || !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' }, 
        { status: 403 }
      )
    }
    
    // Step 3: Get partner with campaigns
    const { data: partner, error } = await supabase
      .from('partners')
      .select(`
        *,
        campaigns:campaigns(
          id,
          name,
          slug,
          status,
          start_date,
          end_date,
          required_days,
          completions,
          phone_submissions
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (error || !partner) {
      return NextResponse.json(
        { error: 'Not found', message: 'Partner not found' },
        { status: 404 }
      )
    }
    
    // Step 4: Calculate total participants
    const totalParticipants = partner.campaigns.reduce(
      (sum: number, campaign: any) => sum + (campaign.completions || 0),
      0
    )
    
    return NextResponse.json({
      success: true,
      data: {
        ...partner,
        total_participants: totalParticipants
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
 * PUT /api/admin/partners/[id]
 * Update partner information
 */
export async function PUT(
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
      .rpc('is_admin', { uid: user.id })
    
    if (adminError || !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' }, 
        { status: 403 }
      )
    }
    
    // Step 3: Check if partner exists
    const { data: existingPartner, error: fetchError } = await supabase
      .from('partners')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (fetchError || !existingPartner) {
      return NextResponse.json(
        { error: 'Not found', message: 'Partner not found' },
        { status: 404 }
      )
    }
    
    // Step 4: Parse and validate request body
    const body = await request.json()
    const validation = updatePartnerSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 })
    }
    
    const validatedData = validation.data
    
    // Step 5: Handle name change and slug regeneration
    let updateData: any = { ...validatedData }
    
    if (validatedData.name && validatedData.name !== existingPartner.name) {
      const baseSlug = generateSlug(validatedData.name)
      const slug = await ensureUniqueSlug(supabase, baseSlug, params.id)
      updateData.slug = slug
    }
    
    // Step 6: Update partner
    const { data: updatedPartner, error: updateError } = await supabase
      .from('partners')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to update partner'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      data: updatedPartner
    }, { status: 200 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/partners/[id]
 * Delete partner (only if no active campaigns)
 */
export async function DELETE(
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
      .rpc('is_admin', { uid: user.id })
    
    if (adminError || !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' }, 
        { status: 403 }
      )
    }
    
    // Step 3: Check if partner exists
    const { data: existingPartner, error: fetchError } = await supabase
      .from('partners')
      .select('id')
      .eq('id', params.id)
      .single()
    
    if (fetchError || !existingPartner) {
      return NextResponse.json(
        { error: 'Not found', message: 'Partner not found' },
        { status: 404 }
      )
    }
    
    // Step 4: Check for active campaigns
    const { data: activeCampaigns } = await supabase
      .from('campaigns')
      .select('id')
      .eq('partner_id', params.id)
      .eq('status', 'active')
    
    if (activeCampaigns && activeCampaigns.length > 0) {
      return NextResponse.json({
        error: 'Conflict',
        message: 'Cannot delete partner with active campaigns. Please end or archive campaigns first.'
      }, { status: 409 })
    }
    
    // Step 5: Safe to delete
    const { error: deleteError } = await supabase
      .from('partners')
      .delete()
      .eq('id', params.id)
    
    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to delete partner'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully'
    }, { status: 200 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

