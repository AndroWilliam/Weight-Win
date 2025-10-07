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

    // Fetch application details
    const { data: application, error: fetchError } = await supabase
      .from('nutritionist_applications')
      .select('cv_file_path, id_file_path')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found', success: false },
        { status: 404 }
      )
    }

    // Generate signed URLs (valid for 1 hour)
    const expiresIn = 3600 // 1 hour

    let cvUrl = null
    let idUrl = null

    if (application.cv_file_path) {
      const { data: cvData } = await supabase.storage
        .from('applicant-docs')
        .createSignedUrl(application.cv_file_path, expiresIn)
      cvUrl = cvData?.signedUrl || null
    }

    if (application.id_file_path) {
      const { data: idData } = await supabase.storage
        .from('applicant-docs')
        .createSignedUrl(application.id_file_path, expiresIn)
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

