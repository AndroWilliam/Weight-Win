import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { userIsAdmin } from '@/lib/admin/guard'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const isAdmin = await userIsAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 403 }
      )
    }

    const applicationId = params.id
    const supabase = await createClient()

    // Fetch document paths from application_documents (authoritative source)
    const { data: docs, error: docsError } = await supabase
      .from('application_documents')
      .select('kind, file_path')
      .eq('application_id', applicationId)

    if (docsError) {
      return NextResponse.json(
        { error: 'Failed to fetch documents', success: false },
        { status: 500 }
      )
    }

    const cvPath = docs?.find(d => d.kind === 'cv')?.file_path || null
    const idPath = docs?.find(d => d.kind === 'id')?.file_path || null

    // Generate signed URLs (valid for 1 hour)
    const expiresIn = 3600 // 1 hour

    let cvUrl = null
    let idUrl = null

    if (cvPath) {
      const { data: cvData } = await supabase.storage
        .from('applicant-docs')
        .createSignedUrl(cvPath, expiresIn)
      cvUrl = cvData?.signedUrl || null
    }

    if (idPath) {
      const { data: idData } = await supabase.storage
        .from('applicant-docs')
        .createSignedUrl(idPath, expiresIn)
      idUrl = idData?.signedUrl || null
    }

    return NextResponse.json({
      success: true,
      cvUrl,
      idUrl
    })
  } catch (error) {
    console.error('[Admin Files API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}

