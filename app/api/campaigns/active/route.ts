import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get active campaigns with partner info
    const { data: campaigns, error } = await supabase
      .rpc('get_active_campaigns')
    
    if (error) {
      console.error('Error fetching active campaigns:', error)
      return NextResponse.json(
        { success: false, data: [] },
        { status: 200 } // Return empty array, not error
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

