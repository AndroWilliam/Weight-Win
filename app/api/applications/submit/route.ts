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
    
    const payload = schema.parse(body)
    console.log('[applications/submit] Schema validation passed:', payload)
    
    const supabase = await createClient()
    console.log('[applications/submit] Supabase client created')

    // Conflict check: existing application by email or phone
    console.log('[applications/submit] Checking for existing applications...')
    const { data: existing, error: existErr } = await supabase
      .from('nutritionist_applications')
      .select('id')
      .or(`email.eq.${payload.email.toLowerCase()},phone_e164.eq.${payload.phone}`)
      .limit(1)
    
    console.log('[applications/submit] Existing check result:', { existing, existErr })
    
    if (existErr) {
      console.error('[applications/submit] Error checking existing applications:', existErr)
      throw existErr
    }
    if (existing && existing.length > 0) {
      console.log('[applications/submit] Application already exists')
      return NextResponse.json({ ok: false, message: 'Application already exists' }, { status: 409 })
    }

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


