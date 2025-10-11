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

export const POST = async (req: Request) => {
  console.log('[applications/submit] Starting request processing')
  
  try {
    console.log('[applications/submit] Parsing request body...')
    const body = await req.json()
    console.log('[applications/submit] Request body received:', body)
    
    console.log('[applications/submit] Validating schema...')
    const payload = schema.parse(body)
    console.log('[applications/submit] Schema validation passed:', payload)
    
    console.log('[applications/submit] Creating Supabase client...')
    const supabase = await createClient()
    console.log('[applications/submit] Supabase client created successfully')

    // Test basic connection first
    console.log('[applications/submit] Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('nutritionist_applications')
      .select('id')
      .limit(1)
    
    console.log('[applications/submit] Test query result:', { testData, testError })
    
    if (testError) {
      console.error('[applications/submit] Database connection failed:', testError)
      return NextResponse.json({ 
        ok: false, 
        error: 'Database connection failed',
        details: testError.message,
        code: testError.code
      }, { status: 500 })
    }

    console.log('[applications/submit] Database connection successful, proceeding with application submission...')

    const { data: appRow, error } = await supabase
      .from('nutritionist_applications')
      .insert({
        // applicant_user_id is optional for anonymous applicants
        first_name: payload.firstName,
        family_name: payload.familyName,
        phone_e164: payload.phone,
        email: payload.email.toLowerCase(),
        id_type: payload.idType,
        id_number: payload.idNumber,
        status: 'new',
        cv_file_path: payload.cvPath,
        id_file_path: payload.idPath,
      })
      .select('id')
      .single()
    if (error) throw error

    const applicationId = appRow.id as number

    // Also insert into application_documents for consistency
    const { error: docErr } = await supabase
      .from('application_documents')
      .insert([
        { application_id: applicationId, kind: 'cv', file_path: payload.cvPath },
        { application_id: applicationId, kind: 'id', file_path: payload.idPath },
      ])
    if (docErr) throw docErr

    await supabase.from('application_events').insert({ application_id: applicationId, event_type: 'submitted' })

    return NextResponse.json({ ok: true, applicationId })
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


