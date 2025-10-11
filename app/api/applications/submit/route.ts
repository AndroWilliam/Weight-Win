import { NextResponse } from "next/server"
import { z } from "zod"
// import { createClient } from "@/lib/supabase/server"

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
  console.log('[applications/submit] Starting request processing')
  
  let body: any = null
  
  try {
    console.log('[applications/submit] Parsing request body...')
    body = await req.json()
    console.log('[applications/submit] Request body received:', body)
    
    console.log('[applications/submit] Validating schema...')
    const payload = schema.parse(body)
    console.log('[applications/submit] Schema validation passed:', payload)
    
    // For now, just return success without database operations to test basic functionality
    console.log('[applications/submit] Returning test success response')
    return NextResponse.json({ 
      ok: true, 
      message: 'Test successful - API route is working (no Supabase)',
      receivedData: payload
    })
  } catch (e) {
    console.error('[applications/submit] Error:', e)
    console.error('[applications/submit] Error details:', {
      message: e instanceof Error ? e.message : 'Unknown error',
      stack: e instanceof Error ? e.stack : undefined,
      payload: body
    })
    return NextResponse.json({ 
      ok: false, 
      error: e instanceof Error ? e.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? e : undefined
    }, { status: 500 })
  }
}


