/**
 * Fetch with automatic timeout
 * Throws error if request exceeds timeout duration
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.')
    }
    
    // Re-throw other errors
    throw error
  }
}

/**
 * Preset timeout configurations for different endpoint types
 */
export const TIMEOUT_PRESETS = {
  SHORT: 5000,    // 5s - Quick operations (settings, badges)
  MEDIUM: 10000,  // 10s - Standard operations (tracking save)
  LONG: 30000,    // 30s - Heavy operations (OCR, file upload)
  ADMIN: 15000    // 15s - Admin operations (file loading)
} as const

