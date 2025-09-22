import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = 'nodejs'

export async function POST(req: Request, { params }: { params: { kind: 'cv' | 'id' } }) {
  try {
    const body = await req.json()
    const documentId: number = body.documentId
    if (!documentId) return NextResponse.json({ ok: false, error: 'documentId required' }, { status: 400 })

    const supabase = await createClient()

    // 1) Lookup file path and application
    const { data: doc, error: docErr } = await supabase
      .from('application_documents')
      .select('id, file_path, application_id')
      .eq('id', documentId)
      .single()
    if (docErr || !doc) throw docErr

    // 2) Download using service key (Server client already holds cookies; this is a placeholder)
    // NOTE: Implement real OCR provider here. For now, mock a response.
    const mockConfidence = 92.5
    const mockJson = { parsed: true, fields: { example: 'value' } }

    // 3) Insert OCR extraction
    const { error: ocrErr } = await supabase.from('document_ocr_extractions').insert({
      document_id: doc.id,
      provider: process.env.OCR_PROVIDER || 'mock',
      confidence: mockConfidence,
      raw_json: mockJson as any,
    })
    if (ocrErr) throw ocrErr

    // 4) Update application confidence summary
    const column = params.kind === 'cv' ? 'cv_ocr_confidence' : 'id_ocr_confidence'
    const { error: updErr } = await supabase
      .from('nutritionist_applications')
      .update({ [column]: mockConfidence })
      .eq('id', doc.application_id)
    if (updErr) throw updErr

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[ocr]', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}


