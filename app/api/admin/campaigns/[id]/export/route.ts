import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/campaigns/[id]/export
 * Export participants list as CSV file
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
    
    // Step 3: Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('name, slug')
      .eq('id', params.id)
      .single()
    
    if (campaignError || !campaign) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Campaign not found'
      }, { status: 404 })
    }
    
    // Step 4: Get all participants (no pagination for export)
    const { data: participants, error: participantsError } = await supabase
      .from('campaign_participants')
      .select('*')
      .eq('campaign_id', params.id)
      .order('completed_at', { ascending: false, nullsFirst: false })
    
    if (participantsError) {
      console.error('Database query error:', participantsError)
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to fetch participants'
      }, { status: 500 })
    }
    
    if (!participants || participants.length === 0) {
      return NextResponse.json({
        error: 'No data',
        message: 'No participants to export'
      }, { status: 404 })
    }
    
    // Step 5: Generate CSV
    const headers = [
      'Name',
      'Email',
      'Phone Number',
      'Started Date',
      'Completed Date',
      'Days Completed',
      'Status',
      'Reward Claimed'
    ]
    
    const csvRows = [
      headers.join(','), // Header row
      ...participants.map(p => {
        // Since we can't easily get user email due to RLS, use user_id as placeholder
        const userId = p.user_id
        const name = userId.substring(0, 8) // First 8 chars of UUID as name
        const email = `user-${name}@example.com` // Placeholder email
        const startedDate = new Date(p.started_at).toLocaleDateString('en-US')
        const completedDate = p.completed_at 
          ? new Date(p.completed_at).toLocaleDateString('en-US')
          : '-'
        
        return [
          `"${name}"`,
          `"${email}"`,
          `"${p.phone_number || '-'}"`,
          `"${startedDate}"`,
          `"${completedDate}"`,
          p.days_completed,
          p.status,
          p.reward_claimed ? 'Yes' : 'No'
        ].join(',')
      })
    ]
    
    const csvContent = csvRows.join('\n')
    
    // Step 6: Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${campaign.slug}-participants-${timestamp}.csv`
    
    // Step 7: Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      }
    })
    
  } catch (error) {
    console.error('Export Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

