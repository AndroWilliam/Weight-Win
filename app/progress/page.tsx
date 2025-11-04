"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Scale, Smile, Frown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { useTheme } from 'next-themes'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface WeightEntry {
  id: number
  weight_kg: number
  recorded_at: string
  photo_url: string
}

interface WeightSummary {
  current_weight: number
  change_from_previous: number
  total_change: number
  trend: 'up' | 'down' | 'neutral'
  message: string
}

interface StreakInfo {
  streak: number
  message: string
}

export default function ProgressPage() {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [weightSummary, setWeightSummary] = useState<WeightSummary | null>(null)
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [motivationalQuote, setMotivationalQuote] = useState<string>("")
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()

  useEffect(() => {
    loadWeightData()
  }, [])

  const loadWeightData = async () => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/auth/login')
        return
      }

      // Load weight entries
      const { data: entries, error: entriesError } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: true })

      if (entriesError) throw entriesError
      setWeightEntries(entries || [])

      // Get weight summary
      const { data: summary, error: summaryError } = await supabase
        .rpc('get_weight_change_summary', { p_user_id: user.id })

      if (!summaryError && summary) {
        setWeightSummary(summary)
        
        // Get a motivational quote if weight decreased
        if (summary.trend === 'down') {
          const { data: quotes } = await supabase
            .from('motivational_quotes')
            .select('quote')
            .limit(1)
            .single()
          
          if (quotes) {
            setMotivationalQuote(quotes.quote)
          }
        }
      }

      // Get streak info
      const { data: streak, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!streakError && streak) {
        setStreakInfo({
          streak: streak.current_streak,
          message: 'Keep going! Consistency is key.'
        })
      }

    } catch (error) {
      console.error('Error loading weight data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getChartData = () => {
    const isDark = theme === 'dark'
    const primaryColor = isDark ? 'rgb(129, 140, 248)' : 'rgb(99, 102, 241)' // indigo-400 for dark, indigo-500 for light
    const backgroundColor = isDark ? 'rgba(129, 140, 248, 0.1)' : 'rgba(99, 102, 241, 0.1)'
    const pointBorderColor = isDark ? '#1a1a1a' : '#fff' // Card color for dark, white for light

    return {
      labels: weightEntries.map(entry => formatDate(entry.recorded_at)),
      datasets: [{
        label: 'Weight (kg)',
        data: weightEntries.map(entry => entry.weight_kg),
        borderColor: primaryColor,
        backgroundColor: backgroundColor,
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: primaryColor,
        pointBorderColor: pointBorderColor,
        pointBorderWidth: 2
      }]
    }
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: (context) => {
            return `Weight: ${context.parsed.y} kg`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `${value} kg`,
          font: {
            size: 12
          },
          color: theme === 'dark' ? '#a3a3a3' : '#6b7280' // Muted-foreground colors
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          },
          color: theme === 'dark' ? '#a3a3a3' : '#6b7280'
        }
      }
    }
  }

  return (
    <ErrorBoundary>
      {isLoading ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your progress...</p>
          </div>
        </div>
      ) : (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex-1 flex justify-center">
            <h1 className="text-fluid-xl font-bold text-foreground">Progress</h1>
          </div>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Weight Change Card */}
            <Card className="border-border">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {weightSummary?.trend === 'down' ? (
                    <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  ) : weightSummary?.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  ) : (
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  )}
                </div>
                <h3 className="text-fluid-lg font-semibold text-foreground mb-2">Weight Change</h3>
                <div className="flex items-center justify-center gap-2">
                  <p className={`text-fluid-2xl font-bold ${
                    weightSummary?.change_from_previous && weightSummary.change_from_previous < 0 
                      ? 'text-green-600' 
                      : weightSummary?.change_from_previous && weightSummary.change_from_previous > 0 
                      ? 'text-red-600' 
                      : 'text-foreground'
                  }`}>
                    {weightSummary?.change_from_previous 
                      ? `${weightSummary.change_from_previous > 0 ? '+' : ''}${weightSummary.change_from_previous.toFixed(1)} kg`
                      : '0.0 kg'
                    }
                  </p>
                  {weightSummary?.trend === 'down' ? (
                    <Smile className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  ) : weightSummary?.trend === 'up' ? (
                    <Frown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  ) : null}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Since last weigh-in</p>
                {weightSummary?.trend === 'down' && motivationalQuote && (
                  <p className="text-xs text-green-600 mt-2 italic">"{motivationalQuote}"</p>
                )}
                {weightSummary?.trend === 'up' && (
                  <p className="text-xs text-red-600 mt-2">Stay focused on your goals!</p>
                )}
              </CardContent>
            </Card>

            {/* Current Weight Card */}
            <Card className="border-border">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-fluid-lg font-semibold text-foreground mb-2">Current Weight</h3>
                <p className="text-fluid-2xl font-bold text-foreground">
                  {weightSummary?.current_weight 
                    ? `${weightSummary.current_weight.toFixed(1)} kg`
                    : '-- kg'
                  }
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Latest reading</p>
              </CardContent>
            </Card>

            {/* Streak Card */}
            <Card className="border-border">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-fluid-lg font-semibold text-foreground mb-2">Streak</h3>
                <p className="text-fluid-2xl font-bold text-foreground">
                  {streakInfo?.streak || 0} days
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Consecutive tracking</p>
                {streakInfo?.message && (
                  <p className="text-xs text-primary mt-2">{streakInfo.message}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weight Chart */}
          <Card className="border-border mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-fluid-lg font-semibold text-foreground mb-4 sm:mb-6">Weight Progress</h3>
              
              {weightEntries.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                  </div>
                  <h4 className="text-base sm:text-lg font-medium text-foreground mb-2">No data yet</h4>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    Start tracking your weight to see your progress here
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Take Your First Photo
                  </Button>
                </div>
              ) : (
                <div className="h-48 sm:h-64 md:h-80">
                  <Line data={getChartData()} options={chartOptions} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Progress Summary */}
          {weightSummary && weightSummary.total_change !== 0 && (
            <Card className="border-border">
              <CardContent className="p-4 sm:p-6 text-center">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  Total Progress {weightSummary.total_change < 0 ? '🎉' : '💪'}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  You've {weightSummary.total_change < 0 ? 'lost' : 'gained'} a total of{' '}
                  <span className={`font-bold ${weightSummary.total_change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(weightSummary.total_change).toFixed(1)} kg
                  </span>{' '}
                  since you started tracking.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground/80 mt-2">
                  Remember: {weightSummary.message}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
      )}
    </ErrorBoundary>
  )
}