import { NextRequest, NextResponse } from 'next/server'
import { extractIDFromImage } from '@/lib/ocr/id-extraction'

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, idType } = await request.json()
    
    if (!imageBase64 || !idType) {
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
    const result = await extractIDFromImage(imageBase64, idType)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to extract ID from document'
      }, { status: 400 })
    }
    
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
