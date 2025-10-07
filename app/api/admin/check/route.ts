import { NextResponse } from 'next/server'
import { userIsAdmin } from '@/lib/admin/guard'

export async function GET() {
  try {
    const isAdmin = await userIsAdmin()
    
    return NextResponse.json({ 
      isAdmin,
      success: true 
    })
  } catch (error) {
    console.error('[Admin Check API] Error:', error)
    return NextResponse.json(
      { isAdmin: false, success: false, error: 'Failed to check admin status' },
      { status: 500 }
    )
  }
}

