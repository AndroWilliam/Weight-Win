import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test basic connection
    const { data, error } = await supabase
      .from('nutritionist_applications')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Database error:', error)
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
      tableExists: true
    })
  } catch (e) {
    console.error('Test DB error:', e)
    return NextResponse.json({ 
      success: false, 
      error: e instanceof Error ? e.message : 'Unknown error',
      stack: e instanceof Error ? e.stack : undefined
    })
  }
}
