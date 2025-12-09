'use client'

import useSWR from 'swr'

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch campaigns')
  return res.json()
}

interface Campaign {
  id: string
  name: string
  slug: string
  partner_id: string
  reward_type: string
  discount_percentage: number
  reward_description: string
  required_days: number
  require_phone: boolean
  reuse_phone: boolean
  banner_heading: string
  banner_body: string
  cta_text: string
  banner_logo_url: string | null
  banner_bg_url: string | null
  primary_color: string
  secondary_color: string
  status: string
  start_date: string
  end_date: string
  terms_conditions: string | null
  partner: {
    name: string
    logo_url: string | null
  }
}

interface ParticipatingCampaign extends Campaign {
  user_campaign_id: string
  days_completed: number
  phone_submitted: boolean
  joined_at: string
  campaign_status: string
}

interface UserCampaignsResponse {
  success: boolean
  data: {
    participating: ParticipatingCampaign[]
    available: Campaign[]
  }
}

export function useUserCampaigns() {
  const { data, error, isLoading, mutate } = useSWR<UserCampaignsResponse>(
    '/api/campaigns/user-campaigns',
    fetcher,
    {
      refreshInterval: 30000, // 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  )

  return {
    participating: data?.data?.participating || [],
    available: data?.data?.available || [],
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export type { Campaign, ParticipatingCampaign }
