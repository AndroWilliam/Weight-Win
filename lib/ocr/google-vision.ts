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

// Constants for weight validation
const MAX_HUMAN_WEIGHT_KG = 400
const MIN_HUMAN_WEIGHT_KG = 20

/**
 * Helper function to extract and validate weight from OCR text
 * Handles common digital scale display formats and smart decimal detection
 */
export function parseWeightFromText(text: string): number | null {
  // Clean the text: remove newlines, extra spaces
  const cleanText = text.replace(/\n/g, ' ').trim()
  
  // Extract all numbers (with possible decimal separators) from the text
  const numberMatches = cleanText.match(/\d+[.,]?\d*/g)
  
  if (!numberMatches || numberMatches.length === 0) {
    return null
  }
  
  // Try each number and find the most likely weight
  for (const numStr of numberMatches) {
    // Replace comma with dot for decimal
    let normalizedNum = numStr.replace(',', '.')
    let parsedValue = parseFloat(normalizedNum)
    
    // Skip if not a valid number
    if (isNaN(parsedValue)) continue
    
    // Skip numbers that are clearly times (4 digits starting with 0, like 0800, 0630)
    if (numStr.match(/^0\d{3}$/)) {
      continue
    }
    
    // Skip 4-digit numbers in date/year range (1900-2099)
    if (parsedValue >= 1900 && parsedValue < 2100) {
      continue
    }
    
    // Smart decimal detection for digital scales
    // If number is > MAX_WEIGHT and has no decimal, it's likely missing a decimal point
    if (parsedValue > MAX_HUMAN_WEIGHT_KG) {
      // Check if this could be a number without a decimal point
      // Example: "974" should be "97.4", "1234" should be "123.4", "5000" should be "500.0"
      const reinterpreted = smartDecimalDetection(normalizedNum, parsedValue)
      if (reinterpreted !== null && isValidWeight(reinterpreted)) {
        return roundToOneDecimal(reinterpreted)
      }
      // If can't reinterpret, skip this number
      continue
    }
    
    // Check if the value is in valid weight range
    if (isValidWeight(parsedValue)) {
      return roundToOneDecimal(parsedValue)
    }
    
    // Check if this could be in pounds (lbs) - typically 40-880 lbs range
    if (parsedValue >= 40 && parsedValue <= 880) {
      const kgValue = parsedValue * 0.453592
      if (isValidWeight(kgValue)) {
        return roundToOneDecimal(kgValue)
      }
    }
  }
  
  return null
}

/**
 * Smart decimal detection for digital scales
 * Assumes most digital scales show weight with 1 decimal place
 */
function smartDecimalDetection(numStr: string, value: number): number | null {
  // If number has no decimal point and is > MAX_WEIGHT
  if (!numStr.includes('.') && value > MAX_HUMAN_WEIGHT_KG) {
    const digits = numStr.split('')
    
    // For 5+ digit numbers (5000, 8000, etc.), these can't realistically be weights
    // Even "5000" -> "500.0" is above our max
    if (digits.length >= 5) {
      return null
    }
    
    // Try inserting decimal before last digit
    // "974" -> "97.4", "1234" -> "123.4", "500" -> "50.0"
    if (digits.length >= 2) {
      const attempt1 = [...digits]
      attempt1.splice(attempt1.length - 1, 0, '.')
      const reinterpretedStr = attempt1.join('')
      const reinterpretedValue = parseFloat(reinterpretedStr)
      
      if (!isNaN(reinterpretedValue) && isValidWeight(reinterpretedValue)) {
        return reinterpretedValue
      }
    }
    
    // For 4-digit numbers, also try inserting decimal before last 2 digits
    // "1234" could be "12.34" - less common but possible
    if (digits.length === 4) {
      const attempt2 = [...digits]
      attempt2.splice(attempt2.length - 2, 0, '.')
      const altStr = attempt2.join('')
      const altValue = parseFloat(altStr)
      
      if (!isNaN(altValue) && isValidWeight(altValue)) {
        return altValue
      }
    }
  }
  
  return null
}

/**
 * Validate if a weight is within reasonable human weight range
 */
function isValidWeight(weight: number): boolean {
  return weight >= MIN_HUMAN_WEIGHT_KG && weight <= MAX_HUMAN_WEIGHT_KG
}

/**
 * Round weight to 1 decimal place (standard for digital scales)
 */
function roundToOneDecimal(weight: number): number {
  return Math.round(weight * 10) / 10
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
