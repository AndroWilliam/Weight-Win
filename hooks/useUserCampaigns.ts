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
  partner_name: string
  banner_logo_url: string | null
  reward_type: string
  discount_percentage: number
  discount_amount: number | null
  required_days: number
  banner_heading: string
  banner_body: string
  cta_text: string
  status: string
  start_date: string
  end_date: string
  primary_color: string
  secondary_color: string
}

interface ParticipatingCampaign extends Campaign {
  participation_id: string
  days_completed: number
  started_at: string
  progress_percentage: number
  phone_submitted: boolean
  phone_number: string | null
  participation_status: string
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
