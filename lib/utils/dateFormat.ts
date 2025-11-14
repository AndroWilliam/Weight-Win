'use client'

/**
 * Date Formatting Utility for WeightWin
 * Handles various date formats and provides consistent formatting
 */

export type DateFormatOptions = {
  format?: 'short' | 'long' | 'iso' | 'relative'
  fallback?: string
  locale?: string
}

/**
 * Main date formatting function
 * Handles Unix timestamps, ISO strings, Date objects
 */
export function formatDate(
  dateValue: string | number | Date | undefined | null,
  options: DateFormatOptions = {}
): string {
  const {
    format = 'short',
    fallback = 'Date unavailable',
    locale = 'en-US'
  } = options

  // Validate input
  if (!isValidDate(dateValue)) {
    console.warn('⚠️ Invalid date value received:', dateValue)
    return fallback
  }

  try {
    // Convert to Date object
    const date = parseDate(dateValue)
    
    if (!date || isNaN(date.getTime())) {
      return fallback
    }

    // Format based on requested format
    switch (format) {
      case 'short':
        // Example: Nov 10, 2025
        return date.toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      
      case 'long':
        // Example: November 10, 2025 at 2:30 PM
        return date.toLocaleDateString(locale, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        })
      
      case 'iso':
        // Example: 2025-11-10
        return date.toISOString().split('T')[0]
      
      case 'relative':
        return getRelativeTime(date)
      
      default:
        return date.toLocaleDateString(locale)
    }
  } catch (error) {
    console.error('Error formatting date:', error)
    return fallback
  }
}

/**
 * Validates if a date value is valid
 */
export function isValidDate(
  dateValue: string | number | Date | undefined | null
): boolean {
  if (dateValue === null || dateValue === undefined) {
    return false
  }

  // Empty string is invalid
  if (typeof dateValue === 'string' && dateValue.trim() === '') {
    return false
  }

  try {
    const date = parseDate(dateValue)
    return date !== null && !isNaN(date.getTime())
  } catch {
    return false
  }
}

/**
 * Parses various date formats into Date object
 */
function parseDate(
  dateValue: string | number | Date | undefined | null
): Date | null {
  if (dateValue === null || dateValue === undefined) {
    return null
  }

  // Empty string is invalid
  if (typeof dateValue === 'string' && dateValue.trim() === '') {
    return null
  }

  // Already a Date object
  if (dateValue instanceof Date) {
    return dateValue
  }

  // Unix timestamp (number)
  if (typeof dateValue === 'number') {
    // Handle both seconds and milliseconds
    const timestamp = dateValue < 10000000000 
      ? dateValue * 1000  // Convert seconds to milliseconds
      : dateValue
    return new Date(timestamp)
  }

  // ISO string or other string format
  if (typeof dateValue === 'string') {
    const date = new Date(dateValue)
    return isNaN(date.getTime()) ? null : date
  }

  return null
}

/**
 * Converts any date format to ISO string
 */
export function toISOString(
  dateValue: string | number | Date | undefined | null
): string | null {
  if (!isValidDate(dateValue)) {
    return null
  }

  try {
    const date = parseDate(dateValue)
    return date ? date.toISOString() : null
  } catch {
    return null
  }
}

/**
 * Gets relative time (e.g., "2 days ago", "just now")
 */
export function getRelativeTime(
  dateValue: string | number | Date | undefined | null
): string {
  if (!isValidDate(dateValue)) {
    return 'Unknown time'
  }

  try {
    const date = parseDate(dateValue)
    if (!date) return 'Unknown time'

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return 'just now'
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
    
    // For older dates, return formatted date
    return formatDate(date, { format: 'short' })
  } catch {
    return 'Unknown time'
  }
}

/**
 * Format date for weight check display
 * Specifically for WeightWin weight entries
 */
export function formatWeightCheckDate(
  dateValue: string | number | Date | undefined | null
): string {
  return formatDate(dateValue, {
    format: 'short',
    fallback: 'Date not available'
  })
}

/**
 * Format date for progress chart
 * Returns consistent format for chart x-axis
 */
export function formatChartDate(
  dateValue: string | number | Date | undefined | null
): string {
  return formatDate(dateValue, {
    format: 'iso',
    fallback: 'Unknown'
  })
}

/**
 * Format date with time for dashboard display
 * Shows date and time in a readable format
 */
export function formatDateTime(
  dateValue: string | number | Date | undefined | null
): string {
  return formatDate(dateValue, {
    format: 'long',
    fallback: 'Just now'
  })
}

