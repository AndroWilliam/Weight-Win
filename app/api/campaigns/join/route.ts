import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  campaign_id: z.string().uuid(),
  user_id: z.string().uuid()
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
    
    const { campaign_id, user_id } = validation.data
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== user_id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Join campaign using helper function
    const { data, error } = await supabase
      .rpc('join_campaign', {
        p_campaign_id: campaign_id,
        p_user_id: user_id
      })
    
    if (error) {
      console.error('Join campaign error:', error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully joined campaign!'
    })
  } catch (error) {
    console.error('Join campaign error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal error' },
      { status: 500 }
    )
  }
}

