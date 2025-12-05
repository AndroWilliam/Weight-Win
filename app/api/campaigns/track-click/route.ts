import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  campaign_id: z.string().uuid(),
  user_id: z.string().uuid(),
  user_agent: z.string().optional().nullable(),
  referrer: z.string().optional().nullable()
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const validation = schema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid data' },
        { status: 400 }
      )
    }
    
    const { campaign_id, user_id, user_agent, referrer } = validation.data
    
    // Track click using helper function
    const { error } = await supabase
      .rpc('track_campaign_click', {
        p_campaign_id: campaign_id,
        p_user_id: user_id,
        p_user_agent: user_agent || null,
        p_referrer: referrer || null
      })
    
    if (error) {
      console.error('Track click error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to track click' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track click error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal error' },
      { status: 500 }
    )
  }
}

