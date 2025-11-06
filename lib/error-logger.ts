/**
 * Centralized error logging service
 * Logs errors to Supabase error_logs table for analytics and monitoring
 */

export type ErrorCategory =
  | 'client_error'
  | 'api_error'
  | 'auth_error'
  | 'ocr_error'
  | 'network_error'
  | 'database_error'
  | 'validation_error'
  | 'unknown_error'

interface ErrorLogData {
  category: ErrorCategory
  message: string
  stackTrace?: string
  endpoint?: string
  httpMethod?: string
  httpStatusCode?: number
  metadata?: Record<string, any>
}

/**
 * Get current session ID from localStorage
 * Used to track errors across a user session
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  
  let sessionId = localStorage.getItem('error_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('error_session_id', sessionId)
  }
  return sessionId
}

/**
 * Get device info for error context
 */
function getDeviceInfo(): Record<string, any> {
  if (typeof window === 'undefined') {
    return { type: 'server' }
  }

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    online: navigator.onLine,
    timestamp: new Date().toISOString()
  }
}

/**
 * Core logging function
 * Sends error log to API endpoint
 */
async function logError(data: ErrorLogData): Promise<void> {
  try {
    const sessionId = getSessionId()
    const deviceInfo = getDeviceInfo()

    // Send to API endpoint (doesn't use fetchWithTimeout to avoid circular dependency)
    await fetch('/api/logs/error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...data,
        sessionId,
        deviceInfo
      })
    })
  } catch (error) {
    // Silently fail - don't throw errors in error logger
    console.error('[Error Logger Failed]', error)
  }
}

/**
 * Log network-related errors
 */
export async function logNetworkError(
  endpoint: string,
  method: string,
  message: string
): Promise<void> {
  console.error('[Network Error]', { endpoint, method, message })
  
  await logError({
    category: 'network_error',
    message,
    endpoint,
    httpMethod: method
  })
}

/**
 * Log OCR processing errors
 */
export async function logOcrError(
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  console.error('[OCR Error]', { message, metadata })
  
  await logError({
    category: 'ocr_error',
    message,
    endpoint: '/api/weight/process',
    httpMethod: 'POST',
    metadata
  })
}

/**
 * Log client-side errors (React errors, JS errors, etc.)
 */
export async function logClientError(
  message: string,
  stackTrace?: string,
  metadata?: Record<string, any>
): Promise<void> {
  console.error('[Client Error]', { message, stackTrace, metadata })
  
  await logError({
    category: 'client_error',
    message,
    stackTrace,
    metadata
  })
}

/**
 * Log API errors (from API routes)
 */
export async function logApiError(
  endpoint: string,
  method: string,
  statusCode: number,
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  console.error('[API Error]', { endpoint, method, statusCode, message, metadata })
  
  await logError({
    category: 'api_error',
    message,
    endpoint,
    httpMethod: method,
    httpStatusCode: statusCode,
    metadata
  })
}

/**
 * Log authentication errors
 */
export async function logAuthError(
  message: string,
  endpoint?: string,
  metadata?: Record<string, any>
): Promise<void> {
  console.error('[Auth Error]', { message, endpoint, metadata })
  
  await logError({
    category: 'auth_error',
    message,
    endpoint,
    metadata
  })
}

/**
 * Log database errors
 */
export async function logDatabaseError(
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  console.error('[Database Error]', { message, metadata })
  
  await logError({
    category: 'database_error',
    message,
    metadata
  })
}

/**
 * Log validation errors
 */
export async function logValidationError(
  message: string,
  endpoint?: string,
  metadata?: Record<string, any>
): Promise<void> {
  console.error('[Validation Error]', { message, endpoint, metadata })
  
  await logError({
    category: 'validation_error',
    message,
    endpoint,
    metadata
  })
}

