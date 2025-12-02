import { NextRequest, NextResponse } from 'next/server'
import { userIsAdmin } from '@/lib/admin/guard'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  logger.info('[BOLD Export] Request started', { requestId })

  // 1. Verify user is admin
  const isAdmin = await userIsAdmin()
  if (!isAdmin) {
    logger.info('[BOLD Export] Unauthorized access attempt', { requestId })
    return NextResponse.json(
      { success: false, error: 'Admin access required' },
      { status: 403 }
    )
  }

  try {
    const supabase = createServiceSupabaseClient()

    // 2. Query BOLD Soccer participants
    // Get all users with 7+ days completed and phone number submitted
    const { data: participants, error } = await supabase
      .from('user_milestones')
      .select(`
        user_id,
        total_days_completed,
        current_streak,
        last_updated
      `)
      .gte('total_days_completed', 7)

    if (error) {
      logger.error('[BOLD Export] Failed to query milestones', error, { requestId })
      return NextResponse.json(
        { success: false, error: 'Failed to query participants' },
        { status: 500 }
      )
    }

    if (!participants || participants.length === 0) {
      logger.info('[BOLD Export] No participants found', { requestId })
      // Return empty CSV with headers
      const csv = 'Name,Email,Phone Number,Completion Date,Days Completed\n'
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="bold-soccer-participants-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // 3. Fetch additional data for each participant
    const enrichedParticipants = await Promise.all(
      participants.map(async (participant) => {
        // Get phone number from user_settings
        const { data: settingsData } = await supabase
          .from('user_settings')
          .select('phone_number')
          .eq('user_id', participant.user_id)
          .maybeSingle()

        // Only include if phone number exists
        if (!settingsData?.phone_number) {
          return null
        }

        // Get user name and email from auth.users
        const { data: userData } = await supabase.auth.admin.getUserById(participant.user_id)

        return {
          name: userData?.user?.user_metadata?.full_name || 'Unknown',
          email: userData?.user?.email || 'Unknown',
          phone_number: settingsData.phone_number,
          completion_date: participant.last_updated
            ? new Date(participant.last_updated).toLocaleDateString()
            : 'Unknown',
          days_completed: participant.total_days_completed,
        }
      })
    )

    // Filter out null values (users without phone numbers)
    const validParticipants = enrichedParticipants.filter((p) => p !== null)

    logger.info('[BOLD Export] Participants found', {
      requestId,
      total: participants.length,
      withPhone: validParticipants.length,
    })

    // 4. Generate CSV
    const csvRows = [
      'Name,Email,Phone Number,Completion Date,Days Completed',
      ...validParticipants.map(
        (p) =>
          `"${p.name}","${p.email}","${p.phone_number}","${p.completion_date}",${p.days_completed}`
      ),
    ]
    const csv = csvRows.join('\n')

    // 5. Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="bold-soccer-participants-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error: any) {
    logger.error('[BOLD Export] Export failed', error, { requestId })
    return NextResponse.json(
      { success: false, error: 'Export failed', details: error.message },
      { status: 500 }
    )
  }
}
