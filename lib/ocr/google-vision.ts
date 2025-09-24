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
    // For production, you'll need to set up Google Vision API
    // and add GOOGLE_APPLICATION_CREDENTIALS to your environment
    
    // Mock implementation for now - replace with actual Google Vision API call
    // This is a placeholder that simulates OCR results
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
    
    // In production, you would:
    // 1. Call Google Vision API with the image
    // 2. Extract text using TEXT_DETECTION
    // 3. Parse the text to find numeric weight values
    // 4. Apply regex patterns to identify weight readings
    
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
