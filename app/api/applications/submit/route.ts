import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export const runtime = 'nodejs'

const schema = z.object({
  firstName: z.string().min(1),
  familyName: z.string().min(1),
  phone: z.string(),
  email: z.string().email(),
  idType: z.enum(['national_id','passport']),
  idNumber: z.string(),
  cvPath: z.string(),
  idPath: z.string(),
})

export async function POST(req: Request) {
  try {
    console.log('[applications/submit] Starting request processing')
    const body = await req.json()
    console.log('[applications/submit] Request body received:', body)
    
    console.log('[applications/submit] Validating schema...')
    const payload = schema.parse(body)
    console.log('[applications/submit] Schema validation passed:', payload)
    
    console.log('[applications/submit] Creating Supabase client...')
    const supabase = await createClient()
    console.log('[applications/submit] Supabase client created successfully')

    // Test database connection
    console.log('[applications/submit] Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('nutritionist_applications')
      .select('id')
      .limit(1)
    
    console.log('[applications/submit] Database test result:', { testData, testError })
    
    if (testError) {
      console.error('[applications/submit] Database connection failed:', testError)
      return NextResponse.json({ 
        ok: false, 
        error: 'Database connection failed',
        details: testError.message,
        code: testError.code,
        hint: testError.hint
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      ok: true, 
      message: "Database connection successful",
      receivedData: payload,
      testData: testData
    })
  } catch (e) {
    console.error('[applications/submit] Error:', e)
    return NextResponse.json({ 
      ok: false, 
      error: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 })
  }
}


