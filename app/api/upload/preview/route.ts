import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { bucket, path } = await request.json()

    if (!bucket || !path) {
      return NextResponse.json(
        { error: 'Missing bucket or path' },
        { status: 400 }
      )
    }

    // Create signed URL using service role key
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60) // 60 seconds expiry

    if (error) {
      console.error('Preview URL error:', error)
      return NextResponse.json(
        { error: 'Failed to create preview URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({ signedUrl: data.signedUrl })
  } catch (error) {
    console.error('Preview URL error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
