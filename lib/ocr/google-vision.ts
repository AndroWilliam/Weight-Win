// Google Vision API integration for OCR scale reading

export interface OCRResult {
  success: boolean
  weight?: number
  confidence?: number
  error?: string
  rawText?: string
}

export async function extractWeightFromImage(imageBase64: string): Promise<OCRResult> {
  try {
    // Check if we're in production with real Google Vision API
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      return await extractWeightFromImageProduction(imageBase64)
    }
    
    // Development/Mock implementation
    const mockWeight = 70 + Math.random() * 30 // Random weight between 70-100
    const mockConfidence = 0.85 + Math.random() * 0.15 // Confidence between 0.85-1.0
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate occasional failures (10% chance)
    if (Math.random() < 0.1) {
      return {
        success: false,
        error: 'Unable to detect scale reading. Please ensure the scale display is clearly visible.'
      }
    }
    
    return {
      success: true,
      weight: parseFloat(mockWeight.toFixed(1)),
      confidence: mockConfidence,
      rawText: `${mockWeight.toFixed(1)} kg`
    }
  } catch (error) {
    console.error('OCR error:', error)
    return {
      success: false,
      error: 'Failed to process image. Please try again.'
    }
  }
}

// Production Google Vision API implementation
async function extractWeightFromImageProduction(imageBase64: string): Promise<OCRResult> {
  try {
    // Initialize Google Vision client with credentials from environment
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!)
    
    const { ImageAnnotatorClient } = await import('@google-cloud/vision')
    const client = new ImageAnnotatorClient({
      credentials,
      projectId: credentials.project_id
    })

    // Remove data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    
    // Call Google Vision API for text detection
    const [result] = await client.textDetection({
      image: {
        content: cleanBase64
      }
    })
    
    const detections = result.textAnnotations
    if (!detections || detections.length === 0) {
      return {
        success: false,
        error: 'No text detected in image. Please ensure the scale display is clearly visible.'
      }
    }
    
    const fullText = detections[0].description || ''
    const weight = parseWeightFromText(fullText)
    
    if (weight === null) {
      return {
        success: false,
        error: 'Could not find weight reading in image. Please ensure the numbers are clearly visible.',
        rawText: fullText
      }
    }
    
    // Calculate confidence based on detection confidence
    const confidence = detections[0].confidence || 0.9
    
    return {
      success: true,
      weight,
      confidence,
      rawText: fullText
    }
  } catch (error) {
    console.error('Google Vision API error:', error)
    return {
      success: false,
      error: 'Failed to process image with OCR service. Please try again.'
    }
  }
}

// Helper function to extract numbers from OCR text
export function parseWeightFromText(text: string): number | null {
  // Look for patterns like "85.5 kg", "85.5kg", "85,5", etc.
  const patterns = [
    /(\d+\.?\d*)\s*kg/i,
    /(\d+,\d*)\s*kg/i,
    /(\d+\.?\d*)\s*kgs/i,
    /(\d+\.?\d*)\s*kilogram/i,
    /(\d+\.?\d*)\s*lbs?/i, // Also support pounds
    /^(\d+\.?\d*)$/ // Just a number
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'))
      // Convert pounds to kg if needed
      if (pattern.toString().includes('lbs')) {
        return value * 0.453592
      }
      return value
    }
  }
  
  return null
}

// Production Google Vision API implementation (commented out)
/*
import { ImageAnnotatorClient } from '@google-cloud/vision'

const client = new ImageAnnotatorClient()

export async function extractWeightFromImageProduction(imageBase64: string): Promise<OCRResult> {
  try {
    const [result] = await client.textDetection({
      image: {
        content: imageBase64.replace(/^data:image\/\w+;base64,/, '')
      }
    })
    
    const detections = result.textAnnotations
    if (!detections || detections.length === 0) {
      return {
        success: false,
        error: 'No text detected in image'
      }
    }
    
    const fullText = detections[0].description || ''
    const weight = parseWeightFromText(fullText)
    
    if (weight === null) {
      return {
        success: false,
        error: 'Could not find weight reading in image',
        rawText: fullText
      }
    }
    
    return {
      success: true,
      weight,
      confidence: detections[0].confidence || 0.9,
      rawText: fullText
    }
  } catch (error) {
    console.error('Google Vision API error:', error)
    return {
      success: false,
      error: 'Failed to process image'
    }
  }
}
*/
