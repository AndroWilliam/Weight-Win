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
    const body = await req.json()
    const payload = schema.parse(body)
    const supabase = await createClient()

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
      })
      .select('id')
      .single()
    if (error) throw error

    const applicationId = appRow.id as number

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
    console.error('[applications/submit]', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}


