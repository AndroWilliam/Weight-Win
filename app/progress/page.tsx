"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    return {
      labels: weightEntries.map(entry => formatDate(entry.recorded_at)),
      datasets: [{
        label: 'Weight (kg)',
        data: weightEntries.map(entry => entry.weight_kg),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-neutral-300">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-bold text-neutral-900">Progress</h1>
          </div>
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Weight Change Card */}
            <Card className="border-neutral-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {weightSummary?.trend === 'down' ? (
                    <TrendingDown className="w-6 h-6 text-green-600" />
                  ) : weightSummary?.trend === 'up' ? (
                    <TrendingUp className="w-6 h-6 text-red-600" />
                  ) : (
                    <TrendingUp className="w-6 h-6 text-primary-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Weight Change</h3>
                <div className="flex items-center justify-center gap-2">
                  <p className={`text-2xl font-bold ${
                    weightSummary?.change_from_previous && weightSummary.change_from_previous < 0 
                      ? 'text-green-600' 
                      : weightSummary?.change_from_previous && weightSummary.change_from_previous > 0 
                      ? 'text-red-600' 
                      : 'text-neutral-900'
                  }`}>
                    {weightSummary?.change_from_previous 
                      ? `${weightSummary.change_from_previous > 0 ? '+' : ''}${weightSummary.change_from_previous.toFixed(1)} kg`
                      : '0.0 kg'
                    }
                  </p>
                  {weightSummary?.trend === 'down' ? (
                    <Smile className="w-6 h-6 text-green-600" />
                  ) : weightSummary?.trend === 'up' ? (
                    <Frown className="w-6 h-6 text-red-600" />
                  ) : null}
                </div>
                <p className="text-sm text-neutral-600 mt-1">Since last weigh-in</p>
                {weightSummary?.trend === 'down' && motivationalQuote && (
                  <p className="text-xs text-green-600 mt-2 italic">"{motivationalQuote}"</p>
                )}
                {weightSummary?.trend === 'up' && (
                  <p className="text-xs text-red-600 mt-2">Stay focused on your goals!</p>
                )}
              </CardContent>
            </Card>

            {/* Current Weight Card */}
            <Card className="border-neutral-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Scale className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Current Weight</h3>
                <p className="text-2xl font-bold text-neutral-900">
                  {weightSummary?.current_weight 
                    ? `${weightSummary.current_weight.toFixed(1)} kg`
                    : '-- kg'
                  }
                </p>
                <p className="text-sm text-neutral-600 mt-1">Latest reading</p>
              </CardContent>
            </Card>

            {/* Streak Card */}
            <Card className="border-neutral-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Streak</h3>
                <p className="text-2xl font-bold text-neutral-900">
                  {streakInfo?.streak || 0} days
                </p>
                <p className="text-sm text-neutral-600 mt-1">Consecutive tracking</p>
                {streakInfo?.message && (
                  <p className="text-xs text-primary-600 mt-2">{streakInfo.message}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weight Chart */}
          <Card className="border-neutral-300 mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">Weight Progress</h3>
              
              {weightEntries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h4 className="text-lg font-medium text-neutral-900 mb-2">No data yet</h4>
                  <p className="text-neutral-600 mb-4">
                    Start tracking your weight to see your progress here
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    Take Your First Photo
                  </Button>
                </div>
              ) : (
                <div className="h-64">
                  <Line data={getChartData()} options={chartOptions} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Progress Summary */}
          {weightSummary && weightSummary.total_change !== 0 && (
            <Card className="border-neutral-300">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Total Progress {weightSummary.total_change < 0 ? '🎉' : '💪'}
                </h3>
                <p className="text-neutral-600">
                  You've {weightSummary.total_change < 0 ? 'lost' : 'gained'} a total of{' '}
                  <span className={`font-bold ${weightSummary.total_change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(weightSummary.total_change).toFixed(1)} kg
                  </span>{' '}
                  since you started tracking.
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Remember: {weightSummary.message}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}