// Placeholder error logger - will be implemented in FIX 3
export async function logNetworkError(endpoint: string, method: string, message: string) {
  // Temporary implementation - logs to console for now
  console.error('[Network Error]', { endpoint, method, message })
}

export async function logOcrError(message: string, metadata?: Record<string, any>) {
  // Temporary implementation - logs to console for now
  console.error('[OCR Error]', { message, metadata })
}

export async function logClientError(message: string, metadata?: Record<string, any>) {
  // Temporary implementation - logs to console for now
  console.error('[Client Error]', { message, metadata })
}

export async function logApiError(endpoint: string, method: string, statusCode: number, message: string) {
  // Temporary implementation - logs to console for now
  console.error('[API Error]', { endpoint, method, statusCode, message })
}

