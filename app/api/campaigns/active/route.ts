import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Try to get active campaigns with partner info via RPC
    const { data: campaignsRpc, error: rpcError } = await supabase
      .rpc('get_active_campaigns')
    
    // If RPC works, use it
    if (!rpcError && campaignsRpc) {
      return NextResponse.json({
        success: true,
        data: campaignsRpc
      })
    }
    
    // Fallback: Query campaigns directly if RPC doesn't exist
    console.log('RPC function not found, using fallback query')
    
    const now = new Date().toISOString()
    
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        partner:partners(
          id,
          name,
          logo_url
        )
      `)
      .eq('status', 'active')
      .lte('start_date', now)
      .gte('end_date', now)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching active campaigns (fallback):', error)
      return NextResponse.json(
        { success: false, data: [] },
        { status: 200 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: campaigns || []
    })
  } catch (error) {
    console.error('Active campaigns error:', error)
    return NextResponse.json(
      { success: false, data: [] },
      { status: 200 }
    )
  }
}

