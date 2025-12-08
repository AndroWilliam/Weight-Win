'use client'

import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { MetricCard } from '@/components/admin/analytics/MetricCard'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function GlobalAnalyticsPage() {
  const router = useRouter()
  
  const { data, error, isLoading } = useSWR(
    '/api/admin/analytics/dashboard',
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30s
  )
  
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
  
  if (error || !data?.data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">Failed to load analytics</p>
            <button 
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Admin
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  const analytics = data.data
  
  // Calculate totals
  const totalClicks = analytics.campaigns?.reduce((sum: number, c: any) => sum + (c.banner_clicks || 0), 0) || 0
  const totalStarts = analytics.campaigns?.reduce((sum: number, c: any) => sum + (c.challenge_starts || 0), 0) || 0
  const totalCompletions = analytics.campaigns?.reduce((sum: number, c: any) => sum + (c.completions || 0), 0) || 0
  const totalPhones = analytics.campaigns?.reduce((sum: number, c: any) => sum + (c.phone_submissions || 0), 0) || 0
  
  const overallConversion = totalClicks > 0 
    ? ((totalPhones / totalClicks) * 100).toFixed(1) 
    : '0.0'
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">📊 Global Analytics</h1>
          <p className="text-gray-400">Overview of all campaigns performance</p>
        </div>
        
        {/* Overview Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <MetricCard
            title="Total Campaigns"
            value={analytics.overview?.total_campaigns || analytics.campaigns?.length || 0}
            icon="📊"
            color="#4F46E5"
          />
          <MetricCard
            title="Active Campaigns"
            value={analytics.overview?.active_campaigns || analytics.campaigns?.filter((c: any) => c.status === 'active').length || 0}
            icon="✅"
            color="#10B981"
          />
          <MetricCard
            title="Total Participants"
            value={(analytics.overview?.total_participants || totalStarts).toLocaleString()}
            icon="👥"
            color="#06B6D4"
          />
          <MetricCard
            title="Phone Submissions"
            value={(analytics.overview?.total_phones || totalPhones).toLocaleString()}
            icon="📞"
            color="#F59E0B"
          />
        </div>
        
        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <MetricCard
            title="Total Clicks"
            value={totalClicks.toLocaleString()}
            icon="👆"
            color="#8B5CF6"
          />
          <MetricCard
            title="Total Starts"
            value={totalStarts.toLocaleString()}
            icon="▶️"
            color="#EC4899"
          />
          <MetricCard
            title="Total Completions"
            value={totalCompletions.toLocaleString()}
            icon="🏆"
            color="#F97316"
          />
          <MetricCard
            title="Overall Conversion"
            value={`${overallConversion}%`}
            icon="🎯"
            color="#14B8A6"
            subtitle="Click to phone"
          />
        </div>
        
        {/* Campaign List */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Campaign Performance</h3>
          
          {!analytics.campaigns || analytics.campaigns.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p className="text-6xl mb-4">📊</p>
              <p className="text-lg">No campaigns yet</p>
              <button
                onClick={() => router.push('/admin/campaigns/new')}
                className="mt-4 px-6 py-3 bg-[#4F46E5] text-white font-semibold rounded-lg hover:bg-[#4338CA]"
              >
                Create First Campaign
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.campaigns.map((campaign: any) => {
                const conversionRate = campaign.banner_clicks > 0
                  ? ((campaign.phone_submissions / campaign.banner_clicks) * 100).toFixed(1)
                  : '0.0'
                
                return (
                  <div
                    key={campaign.id}
                    onClick={() => router.push(`/admin/campaigns/${campaign.id}/analytics`)}
                    className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4 md:p-6 hover:border-[#4F46E5] cursor-pointer transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-1">
                          {campaign.name}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          {campaign.partner_name || 'No partner'} • 
                          <span className={`ml-1 ${
                            campaign.status === 'active' ? 'text-green-400' :
                            campaign.status === 'scheduled' ? 'text-blue-400' :
                            'text-gray-400'
                          }`}>
                            {campaign.status}
                          </span>
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-[#4F46E5] text-white text-sm font-semibold rounded-lg hover:bg-[#4338CA] whitespace-nowrap">
                        View Details →
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Clicks</div>
                        <div className="text-white font-bold text-xl">
                          {(campaign.banner_clicks || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Starts</div>
                        <div className="text-white font-bold text-xl">
                          {(campaign.challenge_starts || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Completions</div>
                        <div className="text-white font-bold text-xl">
                          {(campaign.completions || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Phone #s</div>
                        <div className="text-white font-bold text-xl">
                          {(campaign.phone_submissions || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Conversion</div>
                        <div className="text-white font-bold text-xl">
                          {conversionRate}%
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

