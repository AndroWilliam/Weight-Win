"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, Calendar, Target } from "lucide-react"

interface WeightEntry {
  day: number
  weight: number
  timestamp: string
  image: string
}

export default function ProgressPage() {
  const [weightData, setWeightData] = useState<WeightEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load weight data from localStorage
    const savedWeights = localStorage.getItem('weightData')
    if (savedWeights) {
      setWeightData(JSON.parse(savedWeights))
    }
    setIsLoading(false)
  }, [])

  const getWeightChange = () => {
    if (weightData.length < 2) return 0
    const firstWeight = weightData[0].weight
    const lastWeight = weightData[weightData.length - 1].weight
    return lastWeight - firstWeight
  }

  const getAverageWeight = () => {
    if (weightData.length === 0) return 0
    const sum = weightData.reduce((acc, entry) => acc + entry.weight, 0)
    return sum / weightData.length
  }

  const getStreakDays = () => {
    return weightData.length
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
            <Card className="border-neutral-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Weight Change</h3>
                <p className={`text-2xl font-bold ${getWeightChange() >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {getWeightChange() >= 0 ? '+' : ''}{getWeightChange().toFixed(1)} kg
                </p>
                <p className="text-sm text-neutral-600 mt-1">Since day 1</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Average Weight</h3>
                <p className="text-2xl font-bold text-neutral-900">
                  {getAverageWeight().toFixed(1)} kg
                </p>
                <p className="text-sm text-neutral-600 mt-1">7-day average</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Streak</h3>
                <p className="text-2xl font-bold text-neutral-900">
                  {getStreakDays()} days
                </p>
                <p className="text-sm text-neutral-600 mt-1">Consecutive tracking</p>
              </CardContent>
            </Card>
          </div>

          {/* Weight Chart */}
          <Card className="border-neutral-300 mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">Weight Progress</h3>
              
              {weightData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h4 className="text-lg font-medium text-neutral-900 mb-2">No data yet</h4>
                  <p className="text-neutral-600 mb-4">
                    Start tracking your weight to see your progress here
                  </p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
                  >
                    Take Your First Photo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Simple Line Chart */}
                  <div className="h-64 flex items-end justify-between gap-2">
                    {weightData.map((entry, index) => {
                      const maxWeight = Math.max(...weightData.map(e => e.weight))
                      const minWeight = Math.min(...weightData.map(e => e.weight))
                      const range = maxWeight - minWeight || 1
                      const height = ((entry.weight - minWeight) / range) * 200 + 20
                      
                      return (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div
                            className="w-full bg-primary-600 rounded-t-lg transition-all duration-300 hover:bg-primary-700"
                            style={{ height: `${height}px` }}
                            title={`Day ${entry.day}: ${entry.weight}kg`}
                          ></div>
                          <span className="text-xs text-neutral-600 mt-2">Day {entry.day}</span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Weight Entries List */}
                  <div className="space-y-3 mt-6">
                    <h4 className="font-medium text-neutral-900">Recent Entries</h4>
                    {weightData.slice(-5).reverse().map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{entry.day}</span>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">Day {entry.day}</p>
                            <p className="text-sm text-neutral-600">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-neutral-900">{entry.weight} kg</p>
                          {index > 0 && (
                            <p className={`text-sm ${entry.weight > weightData[weightData.length - index].weight ? 'text-danger-600' : 'text-success-600'}`}>
                              {entry.weight > weightData[weightData.length - index].weight ? '+' : ''}
                              {(entry.weight - weightData[weightData.length - index].weight).toFixed(1)} kg
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Motivational Message */}
          {weightData.length > 0 && (
            <Card className="border-neutral-300">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Great progress! 🎉
                </h3>
                <p className="text-neutral-600">
                  You've tracked your weight for {getStreakDays()} day{getStreakDays() !== 1 ? 's' : ''}. 
                  Keep up the consistency to build lasting healthy habits.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}