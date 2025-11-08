import Cookies from 'js-cookie'
import { 
  PreviewData, 
  DEFAULT_PREVIEW_DATA, 
  PREVIEW_COOKIE_NAME, 
  PREVIEW_COOKIE_EXPIRY_DAYS 
} from './previewData'

/**
 * Get preview data from cookies
 */
export function getPreviewData(): PreviewData | null {
  try {
    const cookieData = Cookies.get(PREVIEW_COOKIE_NAME)
    
    if (!cookieData) {
      return null
    }
    
    const parsed = JSON.parse(cookieData) as PreviewData
    return parsed
  } catch (error) {
    console.error('Failed to parse preview cookie:', error)
    return null
  }
}

/**
 * Save preview data to cookies
 */
export function savePreviewData(data: PreviewData): void {
  try {
    const jsonString = JSON.stringify(data)
    Cookies.set(PREVIEW_COOKIE_NAME, jsonString, {
      expires: PREVIEW_COOKIE_EXPIRY_DAYS
    })
  } catch (error) {
    console.error('Failed to save preview cookie:', error)
  }
}

/**
 * Update specific fields in preview data
 */
export function updatePreviewData(updates: Partial<PreviewData>): void {
  const currentData = getPreviewData() || DEFAULT_PREVIEW_DATA
  const updatedData = { ...currentData, ...updates }
  savePreviewData(updatedData)
}

/**
 * Clear preview data cookie
 */
export function clearPreviewData(): void {
  Cookies.remove(PREVIEW_COOKIE_NAME)
}

/**
 * Check if preview tour is completed
 */
export function isPreviewCompleted(): boolean {
  const data = getPreviewData()
  return data?.tourCompleted || false
}

/**
 * Check if preview session is expired (older than 2 days)
 */
export function isPreviewExpired(): boolean {
  const data = getPreviewData()
  
  if (!data) return false
  
  const sessionStart = new Date(data.sessionStarted)
  const now = new Date()
  const daysDiff = (now.getTime() - sessionStart.getTime()) / (1000 * 60 * 60 * 24)
  
  return daysDiff > PREVIEW_COOKIE_EXPIRY_DAYS
}


