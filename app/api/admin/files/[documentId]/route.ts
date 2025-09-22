import { NextResponse } from 'next/server'
import { createClient as createSupa } from '@supabase/supabase-js'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { APPLICANT_BUCKET } from '@/lib/supabase/constants'

export const runtime = 'nodejs'

export async function GET(req: Request, { params }: { params: { documentId: string }}) {
  // Verify admin using existing server helper and is_admin()
  const server = await createClient()
  const { data: auth } = await server.auth.getUser()
  const user = auth.user
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: isAdminRes } = await server.rpc('is_admin')
  if (!isAdminRes) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supa = createSupa(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const docId = z.coerce.number().parse(params.documentId)
  const { data: rows, error: docErr } = await supa
    .from('application_documents')
    .select('file_path')
    .eq('id', docId)
    .limit(1)
  if (docErr || !rows?.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const filePath = rows[0].file_path as string
  const { data: signed, error: signErr } = await supa
    .storage.from(APPLICANT_BUCKET)
    .createSignedUrl(filePath, 120)
  if (signErr) return NextResponse.json({ error: signErr.message }, { status: 400 })

  return NextResponse.json({ url: signed.signedUrl })
}


