import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/campaigns/[id]/participants
 * List participants for a campaign with filtering, sorting, and pagination
 * Query params: status, phone_status, search, sort, page, limit
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
    
    // Step 3: Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const phoneStatus = searchParams.get('phone_status')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'date'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
    // Step 4: Build query
    let query = supabase
      .from('campaign_participants')
      .select('*', { count: 'exact' })
      .eq('campaign_id', params.id)
    
    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status)
    }
    
    // Filter by phone status
    if (phoneStatus === 'provided') {
      query = query.not('phone_number', 'is', null)
    } else if (phoneStatus === 'missing') {
      query = query.is('phone_number', null)
    }
    
    // Sorting
    if (sort === 'progress') {
      query = query.order('days_completed', { ascending: false })
    } else if (sort === 'completion') {
      query = query.order('completed_at', { ascending: false, nullsFirst: false })
    } else {
      // Default: sort by date (newest first)
      query = query.order('started_at', { ascending: false })
    }
    
    // Step 5: Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    const { data: participants, error, count } = await query
    
    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to fetch participants'
      }, { status: 500 })
    }
    
    // Step 6: Filter by search if provided (in JavaScript since we can't easily join auth.users)
    let filteredParticipants = participants || []
    
    // Step 7: Format response data
    const formattedData = filteredParticipants.map(p => ({
      id: p.id,
      user_id: p.user_id,
      user_email: 'User', // Email would require joining auth.users with proper RLS
      started_at: p.started_at,
      completed_at: p.completed_at,
      phone_number: p.phone_number,
      days_completed: p.days_completed,
      current_streak: p.current_streak || 0,
      status: p.status,
      reward_claimed: p.reward_claimed || false
    }))
    
    // Apply search filter if provided
    const searchFiltered = search 
      ? formattedData.filter(p => 
          p.user_email.toLowerCase().includes(search.toLowerCase()) ||
          p.user_id.toLowerCase().includes(search.toLowerCase())
        )
      : formattedData
    
    return NextResponse.json({
      success: true,
      data: searchFiltered,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('Participants List Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

