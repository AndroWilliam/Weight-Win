import { NextRequest, NextResponse } from 'next/server'
import { extractIdFromImage } from '@/lib/ocr/id-extraction'

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, idType } = await request.json()
    
    console.log('[ID Extract API] Request received:', { 
      hasImageBase64: !!imageBase64, 
      imageBase64Length: imageBase64?.length, 
      idType 
    })
    
    if (!imageBase64 || !idType) {
      console.log('[ID Extract API] Missing required fields')
      return NextResponse.json({ 
        error: 'Missing required fields: imageBase64 and idType' 
      }, { status: 400 })
    }
    
    if (idType !== 'national_id' && idType !== 'passport') {
      return NextResponse.json({ 
        error: 'Invalid idType. Must be "national_id" or "passport"' 
      }, { status: 400 })
    }
    
    // Extract ID from image
    console.log('[ID Extract API] Starting OCR extraction...')
    const result = await extractIdFromImage(imageBase64, idType)
    
    console.log('[ID Extract API] OCR result:', result)
    
    if (!result.success) {
      console.log('[ID Extract API] OCR failed:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to extract ID from document'
      }, { status: 400 })
    }
    
    console.log('[ID Extract API] OCR successful, returning:', {
      success: true,
      extractedId: result.extractedId,
      confidence: result.confidence
    })
    
    return NextResponse.json({
      success: true,
      extractedId: result.extractedId,
      confidence: result.confidence,
      idType: result.idType,
      rawText: result.rawText
    })
    
  } catch (error) {
    console.error('ID extraction API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
