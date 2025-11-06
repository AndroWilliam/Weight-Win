interface RetryOptions {
  maxAttempts?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  onRetry?: (attempt: number, delay: number, error: any) => void
}

/**
 * Retry a function with exponential backoff
 * @param fn - Async function to retry
 * @param options - Retry configuration
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    onRetry
  } = options

  let lastError: any

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry on last attempt
      if (attempt === maxAttempts - 1) {
        break
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error
      }

      // Calculate delay with exponential backoff
      const baseDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt)
      // Add jitter (±25% randomization to prevent thundering herd)
      const jitter = baseDelay * 0.25 * (Math.random() * 2 - 1)
      const delay = Math.min(baseDelay + jitter, maxDelayMs)

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, delay, error)
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // All attempts failed
  throw lastError
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Don't retry client errors (4xx)
  if (error.status >= 400 && error.status < 500) {
    return false
  }

  // Don't retry validation errors
  if (error.message?.toLowerCase().includes('validation')) {
    return false
  }

  // Don't retry authentication errors
  if (error.message?.toLowerCase().includes('unauthorized') || 
      error.message?.toLowerCase().includes('forbidden')) {
    return false
  }

  // Don't retry if explicitly non-retryable
  if (error.retryable === false) {
    return false
  }

  // Don't retry file type/size validation errors
  if (error.message?.toLowerCase().includes('file size') ||
      error.message?.toLowerCase().includes('file type') ||
      error.message?.toLowerCase().includes('please upload')) {
    return false
  }

  // Retry network errors, timeouts, and server errors (5xx)
  return true
}

/**
 * Preset retry configurations
 */
export const RETRY_PRESETS = {
  // Quick retry for lightweight operations
  QUICK: {
    maxAttempts: 2,
    initialDelayMs: 500,
    maxDelayMs: 2000
  },
  // Standard retry for most operations
  STANDARD: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 5000
  },
  // Aggressive retry for critical operations
  AGGRESSIVE: {
    maxAttempts: 5,
    initialDelayMs: 1000,
    maxDelayMs: 10000
  },
  // Patient retry for heavy operations (uploads, OCR)
  PATIENT: {
    maxAttempts: 3,
    initialDelayMs: 2000,
    maxDelayMs: 15000,
    backoffMultiplier: 2.5
  }
} as const

