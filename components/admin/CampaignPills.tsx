'use client'

import { useRouter } from 'next/navigation'

interface Campaign {
  id: string
  name: string
  short_name: string
  emoji: string
  status: string
  campaign_status: string
}

interface CampaignPillsProps {
  campaigns: Campaign[]
}

export function CampaignPills({ campaigns }: CampaignPillsProps) {
  const router = useRouter()

  if (!campaigns || campaigns.length === 0) {
    return <span className="text-muted-foreground text-sm italic">No campaigns</span>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {campaigns.map(campaign => (
        <button
          key={campaign.id}
          onClick={() => router.push(`/admin/campaigns/${campaign.id}/analytics`)}
          className="px-3 py-1 bg-gray-800 dark:bg-gray-800 border border-indigo-500 rounded-full text-xs text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors"
          title={`${campaign.name} - Click to view analytics`}
        >
          {campaign.emoji} {campaign.short_name}
        </button>
      ))}
    </div>
  )
}
