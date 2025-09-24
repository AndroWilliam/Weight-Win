// ID/Passport OCR extraction for Egyptian documents

export interface IdExtractionResult {
  success: boolean
  extractedId?: string
  confidence?: number
  error?: string
  rawText?: string
  idType?: 'national_id' | 'passport'
}

export async function extractIdFromImage(
  imageBase64: string, 
  expectedType: 'national_id' | 'passport'
): Promise<IdExtractionResult> {
  try {
    // Check if we're in production with real Google Vision API
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      return await extractIdFromImageProduction(imageBase64, expectedType)
    }
    
    // Development/Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock extraction based on type
    if (expectedType === 'national_id') {
      // Mock Egyptian National ID (14 digits)
      const mockId = '29001011200123'
      return {
        success: true,
        extractedId: mockId,
        confidence: 0.92,
        idType: 'national_id',
        rawText: `Mock Egyptian ID extraction: ${mockId}`
      }
    } else {
      // Mock Egyptian Passport (A36...)
      const mockPassport = 'A36520101'
      return {
        success: true,
        extractedId: mockPassport,
        confidence: 0.89,
        idType: 'passport',
        rawText: `Mock Egyptian Passport extraction: ${mockPassport}`
      }
    }
  } catch (error) {
    console.error('ID OCR error:', error)
    return {
      success: false,
      error: 'Failed to process ID document. Please try again.'
    }
  }
}

// Production Google Vision API implementation
async function extractIdFromImageProduction(
  imageBase64: string, 
  expectedType: 'national_id' | 'passport'
): Promise<IdExtractionResult> {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!)
    const { ImageAnnotatorClient } = await import('@google-cloud/vision')
    
    const client = new ImageAnnotatorClient({
      credentials,
      projectId: credentials.project_id
    })

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    
    const [result] = await client.textDetection({
      image: {
        content: cleanBase64
      }
    })
    
    const detections = result.textAnnotations
    if (!detections || detections.length === 0) {
      return {
        success: false,
        error: 'No text detected in document. Please ensure the ID is clearly visible.'
      }
    }
    
    const fullText = detections[0].description || ''
    const extractedId = parseIDFromText(fullText, expectedType)
    
    if (!extractedId) {
      return {
        success: false,
        error: `Could not find ${expectedType === 'national_id' ? 'National ID number' : 'Passport number'} in document.`,
        rawText: fullText
      }
    }
    
    const confidence = detections[0].confidence || 0.9
    
    return {
      success: true,
      extractedId,
      confidence,
      idType: expectedType,
      rawText: fullText
    }
  } catch (error) {
    console.error('Google Vision API error for ID extraction:', error)
    return {
      success: false,
      error: 'Failed to process document with OCR service. Please try again.'
    }
  }
}

// Parse ID numbers from OCR text
function parseIDFromText(text: string, expectedType: 'national_id' | 'passport'): string | null {
  if (expectedType === 'national_id') {
    // Egyptian National ID patterns
    // Looking for 14-digit numbers, often at the bottom of the card
    const patterns = [
      // Standard 14-digit pattern
      /\b(\d{14})\b/g,
      // With spaces or dashes
      /\b(\d{2}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{1}[-\s]?\d{6})\b/g,
      // Arabic numerals (٠١٢٣٤٥٦٧٨٩) converted to English
      /\b([٠-٩]{14})\b/g
    ]
    
    for (const pattern of patterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        let id = match[1]
        
        // Convert Arabic numerals to English
        id = convertArabicNumerals(id)
        
        // Remove spaces and dashes
        id = id.replace(/[-\s]/g, '')
        
        // Validate Egyptian National ID format
        if (isValidEgyptianNationalID(id)) {
          return id
        }
      }
    }
  } else if (expectedType === 'passport') {
    // Egyptian Passport patterns (A36...)
    const patterns = [
      // Standard passport format: A + 8 digits
      /\b(A\d{8})\b/g,
      // With spaces
      /\b(A\s?\d{8})\b/g,
      // Case insensitive
      /\b([Aa]\d{8})\b/g
    ]
    
    for (const pattern of patterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        let passport = match[1].replace(/\s/g, '').toUpperCase()
        
        // Validate Egyptian Passport format
        if (isValidEgyptianPassport(passport)) {
          return passport
        }
      }
    }
  }
  
  return null
}

// Convert Arabic numerals to English
function convertArabicNumerals(text: string): string {
  const arabicToEnglish: { [key: string]: string } = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  }
  
  return text.replace(/[٠-٩]/g, (match) => arabicToEnglish[match] || match)
}

// Validate Egyptian National ID (14 digits, specific format)
function isValidEgyptianNationalID(id: string): boolean {
  if (!/^\d{14}$/.test(id)) return false
  
  // Basic validation: century should be 2 or 3 (for 1900s or 2000s)
  const century = parseInt(id[0])
  if (century !== 2 && century !== 3) return false
  
  // Year should be reasonable (00-99)
  const year = parseInt(id.substring(1, 3))
  if (year > 99) return false
  
  // Month should be 01-12
  const month = parseInt(id.substring(3, 5))
  if (month < 1 || month > 12) return false
  
  // Day should be 01-31
  const day = parseInt(id.substring(5, 7))
  if (day < 1 || day > 31) return false
  
  return true
}

// Validate Egyptian Passport (A + 8 digits)
function isValidEgyptianPassport(passport: string): boolean {
  return /^A\d{8}$/.test(passport)
}
