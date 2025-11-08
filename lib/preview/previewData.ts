export interface PreviewData {
  // Weight data
  weight: number
  weightUnit: 'kg' | 'lb'
  
  // Photo data
  photoBase64: string | null
  photoTimestamp: string
  
  // Progress tracking
  streakCount: number
  
  // Session metadata
  sessionStarted: string
  tourCompleted: boolean
  currentStep: number
  
  // Badge
  firstStepBadgeEarned: boolean
}

export const PREVIEW_COOKIE_NAME = 'weightwin_preview_data'
export const PREVIEW_COOKIE_EXPIRY_DAYS = 2

export const DEFAULT_PREVIEW_DATA: PreviewData = {
  weight: 0,
  weightUnit: 'kg',
  photoBase64: null,
  photoTimestamp: '',
  streakCount: 1,
  sessionStarted: new Date().toISOString(),
  tourCompleted: false,
  currentStep: 0,
  firstStepBadgeEarned: false
}

// Sample 7-day progress data for preview charts
export const SAMPLE_PROGRESS_DATA = [
  { day: 'Day 1', weight: 75.5, date: '2024-01-01' },
  { day: 'Day 2', weight: 75.3, date: '2024-01-02' },
  { day: 'Day 3', weight: 75.1, date: '2024-01-03' },
  { day: 'Day 4', weight: 75.0, date: '2024-01-04' },
  { day: 'Day 5', weight: 74.9, date: '2024-01-05' },
  { day: 'Day 6', weight: 74.8, date: '2024-01-06' },
  { day: 'Day 7', weight: 74.8, date: '2024-01-07' }
]


