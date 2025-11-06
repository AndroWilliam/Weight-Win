import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface ErrorStats {
  recentErrors: Array<{
    id: string
    category: string
    message: string
    created_at: string
    user_id: string | null
    endpoint: string | null
    http_status_code: number | null
  }>
  errorsByCategory: Array<{
    category: string
    count: number
  }>
  topErrorMessages: Array<{
    message: string
    count: number
    category: string
  }>
  dailyErrorTrend: Array<{
    date: string
    count: number
  }>
  totalErrors: number
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Get time range from query params (default: last 7 days)
    const url = new URL(request.url)
    const daysParam = url.searchParams.get('days')
    const days = daysParam ? parseInt(daysParam) : 7

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString()

    // Fetch recent errors (last 50)
    const { data: recentErrors, error: recentError } = await supabase
      .from('error_logs')
      .select('id, category, message, created_at, user_id, endpoint, http_status_code')
      .gte('created_at', startDateStr)
      .order('created_at', { ascending: false })
      .limit(50)

    if (recentError) {
      console.error('[Error Stats] Failed to fetch recent errors:', recentError)
      return NextResponse.json({ error: 'Failed to fetch recent errors' }, { status: 500 })
    }

    // Get total error count
    const { count: totalErrors, error: countError } = await supabase
      .from('error_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDateStr)

    if (countError) {
      console.error('[Error Stats] Failed to count errors:', countError)
    }

    // Get errors by category
    const { data: categoryData, error: categoryError } = await supabase
      .rpc('get_errors_by_category', { since_date: startDateStr })

    if (categoryError) {
      console.error('[Error Stats] Failed to fetch errors by category:', categoryError)
    }

    // Get top error messages
    const { data: topMessages, error: topMessagesError } = await supabase
      .rpc('get_top_error_messages', { since_date: startDateStr, limit_count: 10 })

    if (topMessagesError) {
      console.error('[Error Stats] Failed to fetch top error messages:', topMessagesError)
    }

    // Get daily error trend
    const { data: dailyTrend, error: trendError } = await supabase
      .rpc('get_daily_error_trend', { since_date: startDateStr })

    if (trendError) {
      console.error('[Error Stats] Failed to fetch daily trend:', trendError)
    }

    const stats: ErrorStats = {
      recentErrors: recentErrors || [],
      errorsByCategory: categoryData || [],
      topErrorMessages: topMessages || [],
      dailyErrorTrend: dailyTrend || [],
      totalErrors: totalErrors || 0
    }

    return NextResponse.json(stats, { status: 200 })
  } catch (error: any) {
    console.error('[Error Stats] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

