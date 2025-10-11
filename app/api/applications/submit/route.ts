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
    
    return NextResponse.json({ 
      ok: true, 
      message: "Schema validation successful",
      receivedData: payload
    })
  } catch (e) {
    console.error('[applications/submit] Error:', e)
    return NextResponse.json({ 
      ok: false, 
      error: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 })
  }
}


