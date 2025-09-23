import { NextResponse } from "next/server"

export const runtime = 'nodejs'

export async function POST(req: Request, { params }: { params: { kind: 'cv' | 'id' } }) {
  try {
    const body = await req.json()
    const path: string | undefined = body.path
    if (!path) return NextResponse.json({ ok: false, error: 'path required' }, { status: 400 })

    // In this phase, applicants are anonymous. We run OCR and just return the
    // result to the client for UI feedback. Persistence will happen on submit
    // when we have created rows in the database for the application/documents.

    // TODO: Plug real OCR provider here (Anthropic/GCP Vision). For now mock.
    const mockConfidence = 0.9
    const mockJson = { parsed: true, fields: {}, kind: params.kind, path }

    return NextResponse.json({ ok: true, confidence: mockConfidence, data: mockJson })
  } catch (e) {
    console.error('[ocr]', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}


