import {
  PreviewData,
  DEFAULT_PREVIEW_DATA,
  PREVIEW_COOKIE_NAME,
  PREVIEW_COOKIE_EXPIRY_DAYS
} from './previewData'

/**
 * Get preview data from localStorage (changed from cookies due to 4KB size limit)
 * localStorage supports up to 5-10MB which is needed for base64 images
 */
export function getPreviewData(): PreviewData | null {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return null
    }

    const storageData = localStorage.getItem(PREVIEW_COOKIE_NAME)

    if (!storageData) {
      return null
    }

    const parsed = JSON.parse(storageData) as PreviewData
    return parsed
  } catch (error) {
    console.error('Failed to parse preview data from localStorage:', error)
    return null
  }
}

/**
 * Save preview data to localStorage (changed from cookies due to 4KB size limit)
 */
export function savePreviewData(data: PreviewData): void {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('Cannot save preview data: not in browser environment')
      return
    }

    const jsonString = JSON.stringify(data)
    localStorage.setItem(PREVIEW_COOKIE_NAME, jsonString)

    console.log('📦 Preview data saved to localStorage, size:', jsonString.length, 'bytes')
  } catch (error) {
    console.error('Failed to save preview data to localStorage:', error)
    throw error  // Re-throw so the calling code knows it failed
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
 * Clear preview data from localStorage
 */
export function clearPreviewData(): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.removeItem(PREVIEW_COOKIE_NAME)
  console.log('🗑️ Preview data cleared from localStorage')
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


