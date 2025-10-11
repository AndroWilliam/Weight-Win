import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
  console.log('[test] Starting minimal test')
  
  try {
    console.log('[test] Parsing request body...')
    const body = await req.json()
    console.log('[test] Request body received:', body)
    
    console.log('[test] Returning success response')
    return NextResponse.json({ 
      ok: true, 
      message: 'Minimal test successful',
      receivedData: body
    })
  } catch (e) {
    console.error('[test] Error:', e)
    return NextResponse.json({ 
      ok: false, 
      error: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 })
  }
}
