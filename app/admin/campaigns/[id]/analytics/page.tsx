'use client'

import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { MetricCard } from '@/components/admin/analytics/MetricCard'
import { ConversionFunnel } from '@/components/admin/analytics/ConversionFunnel'
import { TimelineChart } from '@/components/admin/analytics/TimelineChart'
import { ParticipantTable } from '@/components/admin/analytics/ParticipantTable'
import { TopPerformers } from '@/components/admin/analytics/TopPerformers'
import { ExportButton } from '@/components/admin/analytics/ExportButton'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function CampaignAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  
  const { data: analyticsData, error: analyticsError } = useSWR(
    `/api/admin/campaigns/${campaignId}/analytics`,
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30s
  )
  
  const { data: participantsData, error: participantsError } = useSWR(
    `/api/admin/campaigns/${campaignId}/participants`,
    fetcher,
    { refreshInterval: 30000 }
  )
  
  const isLoading = !analyticsData && !analyticsError
  const hasError = analyticsError || participantsError
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46E5] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }
  
  if (hasError || !analyticsData?.data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">Failed to load analytics</p>
            <button 
              onClick={() => router.push('/admin/campaigns')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Campaigns
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  const data = analyticsData.data
  const campaign = data.campaign
  const metrics = data.metrics
  const costAnalysis = data.cost_analysis
  const participants = participantsData?.data || []
  
  // Values from API
  const clicks = metrics.banner_clicks || 0
  const starts = metrics.challenge_starts || 0
  const completions = metrics.completions || 0
  const phoneSubmissions = metrics.phone_submissions || 0
  const estimatedCost = parseFloat(costAnalysis?.estimated_cost) || 0
  
  // Calculate rates
  const clickToStartRate = clicks > 0 
    ? ((starts / clicks) * 100).toFixed(1)
    : '0.0'
  
  const completionRate = starts > 0
    ? ((completions / starts) * 100).toFixed(1)
    : '0.0'
  
  const phoneSubmissionRate = completions > 0
    ? ((phoneSubmissions / completions) * 100).toFixed(1)
    : '0.0'
  
  const overallConversion = clicks > 0
    ? ((phoneSubmissions / clicks) * 100).toFixed(1)
    : '0.0'
  
  const roi = estimatedCost > 0
    ? (((phoneSubmissions * 50) / estimatedCost) * 100).toFixed(0)
    : 'N/A'
  
  const cpa = phoneSubmissions > 0 && estimatedCost > 0
    ? (estimatedCost / phoneSubmissions).toFixed(2)
    : 'N/A'
  
  // Transform top performers for component
  const topPerformers = (data.top_performers || []).map((p: any) => ({
    user_email: p.user_email || `User ${p.user_id?.slice(0, 8)}...`,
    completion_time: p.days_to_complete,
    completed_at: p.completed_at
  }))
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => router.push('/admin/campaigns')}
              className="text-gray-400 hover:text-white mb-2 flex items-center gap-1"
            >
              ← Back to Campaigns
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              📊 Campaign Analytics
            </h1>
            <p className="text-gray-400">{campaign.name}</p>
          </div>
          
          <ExportButton 
            campaignId={campaignId}
            campaignName={campaign.name}
          />
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <MetricCard
            title="Total Clicks"
            value={clicks.toLocaleString()}
            icon="👆"
            color="#4F46E5"
            subtitle="Banner impressions"
          />
          <MetricCard
            title="Challenge Starts"
            value={starts.toLocaleString()}
            icon="▶️"
            color="#06B6D4"
            subtitle={`${clickToStartRate}% click-to-start`}
          />
          <MetricCard
            title="Completions"
            value={completions.toLocaleString()}
            icon="✅"
            color="#10B981"
            subtitle={`${completionRate}% completion rate`}
          />
          <MetricCard
            title="Phone Submissions"
            value={phoneSubmissions.toLocaleString()}
            icon="📞"
            color="#F59E0B"
            subtitle={`${phoneSubmissionRate}% submission rate`}
          />
        </div>
        
        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <MetricCard
            title="Overall Conversion"
            value={`${overallConversion}%`}
            icon="🎯"
            color="#8B5CF6"
            subtitle="Click to phone"
          />
          <MetricCard
            title="ROI"
            value={typeof roi === 'string' && roi !== 'N/A' ? `${roi}%` : roi}
            icon="💰"
            color="#EC4899"
            subtitle={estimatedCost > 0 ? `Cost: $${estimatedCost.toLocaleString()}` : 'No cost data'}
          />
          <MetricCard
            title="Cost Per Acquisition"
            value={typeof cpa === 'string' && cpa !== 'N/A' ? `$${cpa}` : cpa}
            icon="💵"
            color="#F97316"
            subtitle="Per phone submission"
          />
        </div>
        
        {/* Conversion Funnel */}
        <div className="mb-8">
          <ConversionFunnel
            data={{
              clicks,
              starts,
              completions,
              phones: phoneSubmissions
            }}
          />
        </div>
        
        {/* Timeline Chart */}
        <div className="mb-8">
          <TimelineChart data={data.timeline || []} />
        </div>
        
        {/* Two Column Layout for Performers and Participants */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top Performers */}
          <div className="lg:col-span-1">
            <TopPerformers performers={topPerformers} />
          </div>
          
          {/* Participants Table */}
          <div className="lg:col-span-2">
            <ParticipantTable
              participants={participants}
              requiredDays={campaign.required_days || 7}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
