export interface Tip {
  id: string
  category: 'healthy-diet' | 'healthy-lifestyle' | 'workout' | 'motivational'
  title: string
  content: string
  readTime: string
}

export interface DailyTips {
  date: string
  tips: Tip[]
}

// Mock tips data - in production, these would come from APIs
const MOCK_TIPS: Record<string, Tip[]> = {
  'healthy-diet': [
    {
      id: 'diet-1',
      category: 'healthy-diet',
      title: 'Start with protein',
      content: 'Include protein in every meal to help control hunger and maintain muscle mass. Aim for 20-30g per meal.',
      readTime: '1 min read'
    },
    {
      id: 'diet-2',
      category: 'healthy-diet',
      title: 'Hydrate before meals',
      content: 'Drink a glass of water 30 minutes before eating to help control portion sizes and improve digestion.',
      readTime: '1 min read'
    },
    {
      id: 'diet-3',
      category: 'healthy-diet',
      title: 'Eat the rainbow',
      content: 'Include colorful fruits and vegetables in every meal. Different colors provide different nutrients.',
      readTime: '1 min read'
    },
    {
      id: 'diet-4',
      category: 'healthy-diet',
      title: 'Mindful eating',
      content: 'Eat slowly, chew thoroughly, and pay attention to hunger cues. This helps prevent overeating.',
      readTime: '1 min read'
    }
  ],
  'healthy-lifestyle': [
    {
      id: 'lifestyle-1',
      category: 'healthy-lifestyle',
      title: 'Consistent sleep schedule',
      content: 'Go to bed and wake up at the same time every day, even on weekends. This regulates your body clock.',
      readTime: '1 min read'
    },
    {
      id: 'lifestyle-2',
      category: 'healthy-lifestyle',
      title: 'Take regular breaks',
      content: 'Stand up and move every 30 minutes. Set a timer to remind yourself to take short walking breaks.',
      readTime: '1 min read'
    },
    {
      id: 'lifestyle-3',
      category: 'healthy-lifestyle',
      title: 'Manage stress',
      content: 'Practice deep breathing, meditation, or gentle stretching for 5-10 minutes daily to reduce stress.',
      readTime: '1 min read'
    },
    {
      id: 'lifestyle-4',
      category: 'healthy-lifestyle',
      title: 'Stay connected',
      content: 'Maintain social connections. Call a friend or family member daily for emotional well-being.',
      readTime: '1 min read'
    }
  ],
  'workout': [
    {
      id: 'workout-1',
      category: 'workout',
      title: 'Start small',
      content: 'Begin with 10-minute workouts. Consistency matters more than intensity when building habits.',
      readTime: '1 min read'
    },
    {
      id: 'workout-2',
      category: 'workout',
      title: 'Warm up properly',
      content: 'Always warm up for 5-10 minutes before exercising to prevent injury and improve performance.',
      readTime: '1 min read'
    },
    {
      id: 'workout-3',
      category: 'workout',
      title: 'Mix it up',
      content: 'Vary your workouts to prevent boredom and work different muscle groups. Try new activities weekly.',
      readTime: '1 min read'
    },
    {
      id: 'workout-4',
      category: 'workout',
      title: 'Listen to your body',
      content: 'Rest when needed. Recovery is just as important as exercise for building strength and endurance.',
      readTime: '1 min read'
    }
  ],
  'motivational': [
    {
      id: 'motivational-1',
      category: 'motivational',
      title: 'Progress over perfection',
      content: 'Every small step counts. Focus on making progress rather than achieving perfection.',
      readTime: '1 min read'
    },
    {
      id: 'motivational-2',
      category: 'motivational',
      title: 'You are stronger than you think',
      content: 'Your body is capable of amazing things. Trust in your ability to overcome challenges.',
      readTime: '1 min read'
    },
    {
      id: 'motivational-3',
      category: 'motivational',
      title: 'Consistency is key',
      content: 'Small daily actions compound over time. Stay consistent and watch your progress grow.',
      readTime: '1 min read'
    },
    {
      id: 'motivational-4',
      category: 'motivational',
      title: 'Celebrate small wins',
      content: 'Acknowledge every achievement, no matter how small. Each step forward is worth celebrating.',
      readTime: '1 min read'
    }
  ]
}

export class TipsService {
  private static instance: TipsService
  private tipsCache: Map<string, DailyTips> = new Map()

  static getInstance(): TipsService {
    if (!TipsService.instance) {
      TipsService.instance = new TipsService()
    }
    return TipsService.instance
  }

  private getDateKey(): string {
    return new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  }

  private generateDailyTips(): DailyTips {
    const date = this.getDateKey()
    const tips: Tip[] = []
    
    // Select one tip from each category
    const categories: Array<keyof typeof MOCK_TIPS> = ['healthy-diet', 'healthy-lifestyle', 'workout', 'motivational']
    
    categories.forEach(category => {
      const categoryTips = MOCK_TIPS[category]
      const randomIndex = Math.floor(Math.random() * categoryTips.length)
      tips.push(categoryTips[randomIndex])
    })

    return { date, tips }
  }

  async getDailyTips(): Promise<DailyTips> {
    const dateKey = this.getDateKey()
    
    // Check if we already have tips for today
    if (this.tipsCache.has(dateKey)) {
      return this.tipsCache.get(dateKey)!
    }

    // Generate new tips for today
    const dailyTips = this.generateDailyTips()
    this.tipsCache.set(dateKey, dailyTips)
    
    return dailyTips
  }

  // In a real app, this would fetch from external APIs
  async fetchTipsFromAPI(): Promise<Tip[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In production, you would call real APIs like:
    // - Nutrition API for diet tips
    // - Fitness API for workout tips
    // - Motivational quotes API
    // - Health and wellness APIs
    
    return []
  }

  // Get tips for a specific category
  getTipsByCategory(category: Tip['category']): Tip[] {
    return MOCK_TIPS[category] || []
  }
}

export const tipsService = TipsService.getInstance()
