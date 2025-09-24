import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractWeightFromImage } from '@/lib/ocr/google-vision'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { imageBase64, photoUrl } = await request.json()
    
    if (!imageBase64 || !photoUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Process image with OCR
    const ocrResult = await extractWeightFromImage(imageBase64)
    
    if (!ocrResult.success || !ocrResult.weight) {
      return NextResponse.json({
        success: false,
        error: ocrResult.error || 'Unable to extract weight from image'
      }, { status: 400 })
    }
    
    // Save weight entry to database
    const { data: weightEntry, error: insertError } = await supabase
      .from('weight_entries')
      .insert({
        user_id: user.id,
        weight_kg: ocrResult.weight,
        photo_url: photoUrl,
        ocr_confidence: ocrResult.confidence,
        recorded_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error saving weight entry:', insertError)
      return NextResponse.json({ error: 'Failed to save weight entry' }, { status: 500 })
    }
    
    // Update user streak
    const { data: streakResult } = await supabase
      .rpc('update_user_streak', { p_user_id: user.id })
    
    // Get weight change summary
    const { data: weightSummary } = await supabase
      .rpc('get_weight_change_summary', { p_user_id: user.id })
    
    return NextResponse.json({
      success: true,
      weight: ocrResult.weight,
      confidence: ocrResult.confidence,
      weightEntry,
      streak: streakResult,
      summary: weightSummary
    })
    
  } catch (error) {
    console.error('Weight processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
