'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ErrorLog {
  id: string
  category: string
  message: string
  created_at: string
  user_id: string | null
  endpoint: string | null
  http_status_code: number | null
}

interface CategoryCount {
  category: string
  count: number
}

interface TopMessage {
  message: string
  count: number
  category: string
}

interface DailyTrend {
  date: string
  count: number
}

interface ErrorStats {
  recentErrors: ErrorLog[]
  errorsByCategory: CategoryCount[]
  topErrorMessages: TopMessage[]
  dailyErrorTrend: DailyTrend[]
  totalErrors: number
}

const SEVERITY_COLORS = {
  client_error: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
  api_error: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  auth_error: 'text-red-600 bg-red-100 dark:bg-red-900/20',
  ocr_error: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  network_error: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  database_error: 'text-red-700 bg-red-200 dark:bg-red-900/30',
  validation_error: 'text-amber-600 bg-amber-100 dark:bg-amber-900/20',
  unknown_error: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
}

export default function ErrorAnalyticsPage() {
  const [stats, setStats] = useState<ErrorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('7')

  const loadStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/error-stats?days=${timeRange}`)
      
      if (!res.ok) {
        throw new Error(`Failed to load error stats: ${res.statusText}`)
      }

      const data = await res.json()
      setStats(data)
    } catch (err: any) {
      console.error('Error loading stats:', err)
      setError(err.message || 'Failed to load error statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [timeRange])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Error Analytics</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Error Analytics</h1>
        <Card className="border-red-300 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-300">Failed to load error statistics</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                <Button onClick={loadStats} variant="outline" size="sm" className="mt-3">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Error Analytics</h1>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadStats} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalErrors || 0}</div>
            <p className="text-xs text-muted-foreground">In last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.errorsByCategory?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Different categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Error</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.topErrorMessages?.[0]?.count || 0}</div>
            <p className="text-xs text-muted-foreground truncate">
              {stats?.topErrorMessages?.[0]?.message || 'No errors'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Errors by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Errors by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.errorsByCategory && stats.errorsByCategory.length > 0 ? (
            <div className="space-y-3">
              {stats.errorsByCategory.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${SEVERITY_COLORS[item.category as keyof typeof SEVERITY_COLORS]}`}>
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No errors in this time range</p>
          )}
        </CardContent>
      </Card>

      {/* Top Error Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Error Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.topErrorMessages && stats.topErrorMessages.length > 0 ? (
            <div className="space-y-3">
              {stats.topErrorMessages.map((item, index) => (
                <div key={index} className="border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.message}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${SEVERITY_COLORS[item.category as keyof typeof SEVERITY_COLORS]}`}>
                        {item.category.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">{item.count}x</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No errors in this time range</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentErrors && stats.recentErrors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-2 font-medium">Time</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium">Message</th>
                    <th className="pb-2 font-medium">Endpoint</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentErrors.map((error) => (
                    <tr key={error.id} className="border-b last:border-0">
                      <td className="py-2 text-xs text-muted-foreground">
                        {new Date(error.created_at).toLocaleString()}
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${SEVERITY_COLORS[error.category as keyof typeof SEVERITY_COLORS]}`}>
                          {error.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2 max-w-xs truncate">{error.message}</td>
                      <td className="py-2 text-xs text-muted-foreground">{error.endpoint || '-'}</td>
                      <td className="py-2 text-xs">{error.http_status_code || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No errors in this time range</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

