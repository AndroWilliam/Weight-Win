'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { CampaignStats } from '@/components/admin/campaigns/CampaignStats'
import { CampaignFilters } from '@/components/admin/campaigns/CampaignFilters'
import { CampaignCard } from '@/components/admin/campaigns/CampaignCard'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function CampaignsPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [page, setPage] = useState(1)
  
  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/campaigns?status=${statusFilter}&search=${searchQuery}&sort=${sortBy}&page=${page}`,
    fetcher
  )
  
  const { data: statsData } = useSWR('/api/admin/analytics/dashboard', fetcher)
  
  const campaigns = data?.data || []
  const pagination = data?.pagination
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">📊 Campaigns</h1>
          <p className="text-gray-400">Manage your marketing campaigns</p>
        </div>
        <button
          onClick={() => router.push('/admin/campaigns/new')}
          className="px-6 py-3 bg-[#4F46E5] text-white font-semibold rounded-lg hover:bg-[#4338CA] transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          New Campaign
        </button>
      </div>
      
      {/* Stats */}
      {statsData && (
        <CampaignStats
          total={statsData.data.overview.total_campaigns}
          active={statsData.data.overview.active_campaigns}
          scheduled={statsData.data.overview.scheduled_campaigns}
          ended={statsData.data.overview.ended_campaigns}
        />
      )}
      
      {/* Filters */}
      <CampaignFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      
      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46E5]"></div>
        </div>
      )}
      
      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
          <p className="text-red-400">Failed to load campaigns</p>
          <button onClick={() => mutate()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">
            Retry
          </button>
        </div>
      )}
      
      {/* Empty */}
      {!isLoading && !error && campaigns.length === 0 && (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-white mb-2">No campaigns found</h3>
          <p className="text-gray-400 mb-6">Get started by creating your first campaign</p>
          <button
            onClick={() => router.push('/admin/campaigns/new')}
            className="px-6 py-3 bg-[#4F46E5] text-white font-semibold rounded-lg"
          >
            Create First Campaign
          </button>
        </div>
      )}
      
      {/* Campaign Cards */}
      {!isLoading && !error && campaigns.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 mb-8">
            {campaigns.map((campaign: any) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onRefresh={mutate}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] disabled:opacity-50"
              >
                ← Previous
              </button>
              <span className="text-gray-400 py-2">
                Page {page} of {pagination.total_pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                disabled={page === pagination.total_pages}
                className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

