import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateSlug, ensureUniqueSlug } from '@/lib/helpers/partners'

// Validation schema for creating a campaign
const createCampaignSchema = z.object({
  partner_id: z.string().uuid(),
  name: z.string().min(3).max(200),
  
  // Reward Details
  reward_type: z.enum(['discount', 'free_item', 'voucher', 'gift_card']),
  discount_percentage: z.number().int().min(0).max(100),
  reward_description: z.string().min(10),
  terms_conditions: z.string().optional().nullable(),
  
  // Challenge Requirements
  required_days: z.number().int().min(1).max(90),
  require_phone: z.boolean().default(true),
  reuse_phone: z.boolean().default(true),
  allow_multiple_participation: z.boolean().default(false),
  capacity: z.number().int().positive().optional().nullable(),
  
  // Banner Design
  banner_heading: z.string().min(3).max(200),
  banner_body: z.string().min(10),
  cta_text: z.string().min(2).max(100).default('Start Challenge'),
  banner_logo_url: z.string().url().optional().nullable(),
  banner_bg_url: z.string().url().optional().nullable(),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#F59E0B'),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#EF4444'),
  
  // Scheduling
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  auto_activate: z.boolean().default(true),
  auto_deactivate: z.boolean().default(true),
  priority: z.number().int().default(0),
  
  // Cost Tracking
  estimated_cost: z.number().positive().optional().nullable(),
  
  // Notifications
  send_email_notification: z.boolean().default(true),
  email_template: z.string().optional().nullable()
})

/**
 * POST /api/admin/campaigns
 * Create a new campaign
 */
export async function POST(request: Request) {
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
    
    // Step 3: Parse and validate request body
    const body = await request.json()
    const validation = createCampaignSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 })
    }
    
    const validatedData = validation.data
    
    // Step 4: Validate dates
    const startDate = new Date(validatedData.start_date)
    const endDate = new Date(validatedData.end_date)
    
    if (endDate <= startDate) {
      return NextResponse.json({
        error: 'Validation failed',
        message: 'End date must be after start date'
      }, { status: 400 })
    }
    
    // Step 5: Validate partner exists
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id')
      .eq('id', validatedData.partner_id)
      .single()
    
    if (partnerError || !partner) {
      return NextResponse.json({
        error: 'Validation failed',
        message: 'Partner not found'
      }, { status: 400 })
    }
    
    // Step 6: Generate unique slug
    const baseSlug = generateSlug(validatedData.name)
    const slug = await ensureUniqueSlug(supabase, baseSlug, undefined, 'campaigns')
    
    // Step 7: Determine initial status
    const now = new Date()
    let status: 'scheduled' | 'active' | 'ended'
    
    if (now >= startDate && now <= endDate) {
      status = 'active'
    } else if (now < startDate) {
      status = 'scheduled'
    } else {
      status = 'ended'
    }
    
    // Step 8: Insert new campaign
    const { data: campaign, error: insertError } = await supabase
      .from('campaigns')
      .insert({
        partner_id: validatedData.partner_id,
        name: validatedData.name,
        slug,
        reward_type: validatedData.reward_type,
        discount_percentage: validatedData.discount_percentage,
        reward_description: validatedData.reward_description,
        terms_conditions: validatedData.terms_conditions || null,
        required_days: validatedData.required_days,
        require_phone: validatedData.require_phone ?? true,
        reuse_phone: validatedData.reuse_phone ?? true,
        allow_multiple_participation: validatedData.allow_multiple_participation ?? false,
        capacity: validatedData.capacity || null,
        banner_heading: validatedData.banner_heading,
        banner_body: validatedData.banner_body,
        cta_text: validatedData.cta_text || 'Start Challenge',
        banner_logo_url: validatedData.banner_logo_url || null,
        banner_bg_url: validatedData.banner_bg_url || null,
        primary_color: validatedData.primary_color || '#F59E0B',
        secondary_color: validatedData.secondary_color || '#EF4444',
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        auto_activate: validatedData.auto_activate ?? true,
        auto_deactivate: validatedData.auto_deactivate ?? true,
        priority: validatedData.priority ?? 0,
        status,
        estimated_cost: validatedData.estimated_cost || null,
        banner_clicks: 0,
        challenge_starts: 0,
        completions: 0,
        phone_submissions: 0,
        send_email_notification: validatedData.send_email_notification ?? true,
        email_template: validatedData.email_template || null
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to create campaign'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      data: campaign
    }, { status: 201 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * GET /api/admin/campaigns
 * List all campaigns with filtering and pagination
 * Query params: status, partner_id, search, page, limit, sort
 */
export async function GET(request: Request) {
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
    
    // Step 3: Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const partner_id = searchParams.get('partner_id')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'date'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
    // Step 4: Build query with filters
    let query = supabase
      .from('campaigns')
      .select(`
        *,
        partner:partners(id, name, slug, logo_url),
        participants:campaign_participants(count)
      `, { count: 'exact' })
    
    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    // Filter by partner
    if (partner_id) {
      query = query.eq('partner_id', partner_id)
    }
    
    // Search across multiple fields
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,` +
        `reward_description.ilike.%${search}%`
      )
    }
    
    // Sorting
    if (sort === 'name') {
      query = query.order('name', { ascending: true })
    } else if (sort === 'participants') {
      query = query.order('completions', { ascending: false })
    } else {
      // Default: sort by date (newest first)
      query = query.order('created_at', { ascending: false })
    }
    
    // Step 5: Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Database query error:', error)
      // If error is about missing table/column, try without participants join
      if (error.message?.includes('campaign_participants') || error.message?.includes('relation') || error.code === 'PGRST116') {
        // Retry without participants join
        const retryQuery = supabase
          .from('campaigns')
          .select(`*, partner:partners(id, name, slug, logo_url)`, { count: 'exact' })
        
        if (status && status !== 'all') {
          retryQuery.eq('status', status)
        }
        if (partner_id) {
          retryQuery.eq('partner_id', partner_id)
        }
        if (search) {
          retryQuery.or(`name.ilike.%${search}%,reward_description.ilike.%${search}%`)
        }
        if (sort === 'name') {
          retryQuery.order('name', { ascending: true })
        } else if (sort === 'participants') {
          retryQuery.order('completions', { ascending: false })
        } else {
          retryQuery.order('created_at', { ascending: false })
        }
        retryQuery.range(from, to)
        
        const { data: retryData, error: retryError, count: retryCount } = await retryQuery
        
        if (retryError) {
          return NextResponse.json({
            error: 'Database error',
            message: 'Failed to fetch campaigns',
            details: retryError.message
          }, { status: 500 })
        }
        
        // Add empty participants array to each campaign
        const campaignsWithParticipants = (retryData || []).map((campaign: any) => ({
          ...campaign,
          participants: [{ count: 0 }]
        }))
        
        return NextResponse.json({
          success: true,
          data: campaignsWithParticipants,
          pagination: {
            page,
            limit,
            total: retryCount || 0,
            total_pages: Math.ceil((retryCount || 0) / limit)
          }
        }, { status: 200 })
      }
      
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to fetch campaigns',
        details: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

