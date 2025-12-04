import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateSlug, ensureUniqueSlug } from '@/lib/helpers/partners'

// Validation schema for creating a partner
const createPartnerSchema = z.object({
  name: z.string().min(3).max(200),
  logo_url: z.string().url().optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  contact_phone: z.string().max(20).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  website: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable()
})

/**
 * POST /api/admin/partners
 * Create a new partner
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
    const validation = createPartnerSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 })
    }
    
    const validatedData = validation.data
    
    // Step 4: Generate unique slug
    const baseSlug = generateSlug(validatedData.name)
    const slug = await ensureUniqueSlug(supabase, baseSlug)
    
    // Step 5: Check if partner name already exists
    const { data: existingPartner } = await supabase
      .from('partners')
      .select('id')
      .eq('name', validatedData.name)
      .single()
    
    if (existingPartner) {
      return NextResponse.json({
        error: 'Conflict',
        message: 'Partner with this name already exists'
      }, { status: 409 })
    }
    
    // Step 6: Insert new partner
    const { data: partner, error: insertError } = await supabase
      .from('partners')
      .insert({
        name: validatedData.name,
        slug,
        logo_url: validatedData.logo_url || null,
        contact_email: validatedData.contact_email || null,
        contact_phone: validatedData.contact_phone || null,
        location: validatedData.location || null,
        website: validatedData.website || null,
        notes: validatedData.notes || null,
        active: true
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to create partner'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      data: partner
    }, { status: 201 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * GET /api/admin/partners
 * List all partners with filtering and pagination
 * Query params: active, search, page, limit
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
    const activeParam = searchParams.get('active')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
    // Step 4: Build query with filters
    let query = supabase
      .from('partners')
      .select(`
        *,
        campaigns:campaigns(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
    
    // Filter by active status
    if (activeParam !== null) {
      query = query.eq('active', activeParam === 'true')
    }
    
    // Search across multiple fields
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,` +
        `contact_email.ilike.%${search}%,` +
        `location.ilike.%${search}%`
      )
    }
    
    // Step 5: Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to fetch partners'
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

