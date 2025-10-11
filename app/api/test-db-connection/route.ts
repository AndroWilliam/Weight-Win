import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log('[test-db] Starting database test')
    const supabase = await createClient()
    console.log('[test-db] Supabase client created')
    
    const { data, error } = await supabase
      .from('nutritionist_applications')
      .select('count')
      .limit(1)
    
    console.log('[test-db] Query result:', { data, error })
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      data: data
    })
  } catch (e) {
    console.error('[test-db] Error:', e)
    return NextResponse.json({ 
      success: false, 
      error: e instanceof Error ? e.message : 'Unknown error',
      stack: e instanceof Error ? e.stack : undefined
    })
  }
}
