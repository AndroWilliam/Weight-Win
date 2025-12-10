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
    const status = searchParams.get('status') || 'all'
    const phoneStatus = searchParams.get('phone_status')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'date'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
    // Step 4: Fetch participants with emails using RPC function
    const { data: participants, error } = await supabase
      .rpc('get_campaign_participants_with_emails', {
        p_campaign_id: params.id
      })

    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to fetch participants'
      }, { status: 500 })
    }

    // Step 5: Apply filters in JavaScript (since RPC doesn't support complex filtering)
    let filteredParticipants = participants || []

    // Filter by status
    if (status !== 'all') {
      filteredParticipants = filteredParticipants.filter(p => p.status === status)
    }

    // Filter by phone status
    if (phoneStatus === 'provided') {
      filteredParticipants = filteredParticipants.filter(p => p.phone_number != null)
    } else if (phoneStatus === 'missing') {
      filteredParticipants = filteredParticipants.filter(p => p.phone_number == null)
    }

    // Step 6: Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredParticipants = filteredParticipants.filter(p =>
        p.user_email?.toLowerCase().includes(searchLower) ||
        p.phone_number?.includes(search) ||
        p.user_id?.toLowerCase().includes(searchLower)
      )
    }

    // Step 7: Apply sorting
    if (sort === 'progress') {
      filteredParticipants.sort((a, b) => b.days_completed - a.days_completed)
    } else if (sort === 'completion') {
      filteredParticipants.sort((a, b) => {
        if (!a.completed_at) return 1
        if (!b.completed_at) return -1
        return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      })
    }
    // Default sort by date is already done by RPC function

    // Step 8: Get total count before pagination
    const totalCount = filteredParticipants.length

    // Step 9: Apply pagination
    const from = (page - 1) * limit
    const to = from + limit
    const paginatedParticipants = filteredParticipants.slice(from, to)

    // Step 10: Format response data
    const formattedData = paginatedParticipants.map(p => ({
      id: p.id,
      user_id: p.user_id,
      user_email: p.user_email,
      user_deleted: p.user_deleted,
      started_at: p.started_at,
      completed_at: p.completed_at,
      phone_number: p.phone_number,
      days_completed: p.days_completed,
      current_streak: p.current_streak || 0,
      status: p.status,
      reward_claimed: p.reward_claimed || false
    }))

    return NextResponse.json({
      success: true,
      data: formattedData,
      pagination: {
        page,
        limit,
        total: totalCount,
        total_pages: Math.ceil(totalCount / limit)
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('Participants List Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

