'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { CampaignWizard } from '@/components/admin/campaigns/wizard/CampaignWizard'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch')
  }
  return res.json()
}

export default function EditCampaignPage() {
  const params = useParams()
  const campaignId = params.id as string
  
  const { data, error, isLoading } = useSWR(
    `/api/admin/campaigns/${campaignId}`,
    fetcher
  )
  
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    )
  }
  
  if (error || !data?.data) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">Campaign not found</p>
            <a href="/admin/campaigns" className="text-[#4F46E5] hover:underline">
              ← Back to Campaigns
            </a>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">✏️ Edit Campaign</h1>
          <p className="text-gray-400">{data.data.name}</p>
        </div>
        
        <CampaignWizard mode="edit" campaign={data.data} />
      </div>
    </div>
  )
}

