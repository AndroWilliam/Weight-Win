'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

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
  partner: {
    name: string
    logo_url: string | null
  }
}

export function useCampaigns() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    data: Campaign[]
  }>(
    '/api/campaigns/active',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000 // Cache for 1 minute
    }
  )
  
  return {
    campaigns: data?.data || [],
    isLoading,
    error,
    refresh: mutate
  }
}

