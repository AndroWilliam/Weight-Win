/**
 * Sample data for demo mode (?demo=true)
 *
 * Used for QA testing to bypass validation and show sample data
 */

export type DemoDataType = 'dashboard' | 'progress' | 'rewards' | 'ocr'

/**
 * Generate sample data for demo mode
 *
 * @param type - Type of demo data to generate
 * @returns Sample data matching the expected structure for each page
 */
export function getDemoData(type: DemoDataType) {
  // Base date for consistent demo data (4 days ago)
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() - 4)

  switch (type) {
    case 'dashboard':
      return {
        weight: 75.5,
        weightUnit: 'kg',
        photoBase64: generatePlaceholderImage('75.5 kg'),
        photoTimestamp: new Date().toISOString(),
        currentStep: 3,
        streakCount: 4,
        sessionStarted: baseDate.toISOString(),
        tourCompleted: false,
        firstStepBadgeEarned: true
      }

    case 'progress':
      return {
        weight: 75.5,
        weightUnit: 'kg',
        weights: [
          { weight: 76.8, date: formatDate(baseDate, 0) },
          { weight: 76.2, date: formatDate(baseDate, 1) },
          { weight: 75.9, date: formatDate(baseDate, 2) },
          { weight: 75.5, date: formatDate(baseDate, 3) }
        ],
        startingWeight: 76.8,
        currentWeight: 75.5,
        weightChange: -1.3,
        currentStep: 4,
        streakCount: 4,
        sessionStarted: baseDate.toISOString()
      }

    case 'rewards':
      return {
        weight: 75.5,
        weightUnit: 'kg',
        currentStep: 5,
        streakCount: 4,
        completedDays: 4,
        totalDays: 7,
        sessionStarted: baseDate.toISOString(),
        unlockedRewards: [
          { day: 1, title: 'First Step', unlocked: true },
          { day: 2, title: 'Building Momentum', unlocked: true },
          { day: 3, title: 'Halfway Hero', unlocked: true },
          { day: 4, title: 'Consistency King', unlocked: true },
          { day: 5, title: 'Almost There', unlocked: false },
          { day: 6, title: 'Final Push', unlocked: false },
          { day: 7, title: 'Challenge Complete', unlocked: false }
        ]
      }

    case 'ocr':
      return {
        photoBase64: generatePlaceholderImage('75.5 kg'),
        photoTimestamp: new Date().toISOString(),
        weight: 75.5,
        weightUnit: 'kg',
        currentStep: 2
      }

    default:
      return {
        weight: 75.5,
        weightUnit: 'kg',
        currentStep: 1
      }
  }
}

/**
 * Format date for demo data
 */
function formatDate(baseDate: Date, daysOffset: number): string {
  const date = new Date(baseDate)
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString()
}

/**
 * Generate a placeholder image with text overlay
 * Returns a data URL with an SVG image
 */
function generatePlaceholderImage(text: string): string {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#e5e7eb"/>
      <rect x="50" y="50" width="300" height="200" rx="10" fill="#fff"/>
      <text x="200" y="160" text-anchor="middle" font-family="Arial" font-size="48" font-weight="bold" fill="#1f2937">${text}</text>
      <text x="200" y="190" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">Demo Scale Image</text>
    </svg>
  `

  // Convert SVG to base64 data URL
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}
