export type CampaignStatus = 'scheduled' | 'active' | 'paused' | 'ended' | 'archived'
export type RewardType = 'discount' | 'free_item' | 'voucher' | 'gift_card'

export interface Campaign {
  id: string
  partner_id: string
  name: string
  slug: string
  
  // Reward
  reward_type: RewardType
  discount_percentage: number
  reward_description: string
  terms_conditions: string | null
  
  // Requirements
  required_days: number
  require_phone: boolean
  reuse_phone: boolean
  allow_multiple_participation: boolean
  capacity: number | null
  
  // Banner
  banner_heading: string
  banner_body: string
  cta_text: string
  banner_logo_url: string | null
  banner_bg_url: string | null
  primary_color: string
  secondary_color: string
  
  // Scheduling
  start_date: string
  end_date: string
  auto_activate: boolean
  auto_deactivate: boolean
  priority: number
  status: CampaignStatus
  
  // Analytics
  estimated_cost: number | null
  banner_clicks: number
  challenge_starts: number
  completions: number
  phone_submissions: number
  
  // Notifications
  send_email_notification: boolean
  email_template: string | null
  
  // Metadata
  created_at: string
  updated_at: string
  archived_at: string | null
}

export interface CampaignWithPartner extends Campaign {
  partner: {
    id: string
    name: string
    slug: string
    logo_url: string | null
  }
  participants: [{ count: number }]
}

export interface CampaignWithDetails extends Campaign {
  partner: {
    id: string
    name: string
    slug: string
    logo_url: string | null
    contact_email: string | null
  }
  statistics: {
    total_participants: number
    active_participants: number
    completed_participants: number
    phone_submission_rate: number
    completion_rate: number
    click_to_start_rate: number
  }
  participants: Array<{
    id: string
    user_id: string
    started_at: string
    completed_at: string | null
    phone_number: string | null
    days_completed: number
    status: string
  }>
}

export interface CreateCampaignInput {
  partner_id: string
  name: string
  reward_type: RewardType
  discount_percentage: number
  reward_description: string
  terms_conditions?: string | null
  required_days: number
  require_phone?: boolean
  reuse_phone?: boolean
  allow_multiple_participation?: boolean
  capacity?: number | null
  banner_heading: string
  banner_body: string
  cta_text?: string
  banner_logo_url?: string | null
  banner_bg_url?: string | null
  primary_color?: string
  secondary_color?: string
  start_date: string
  end_date: string
  auto_activate?: boolean
  auto_deactivate?: boolean
  priority?: number
  estimated_cost?: number | null
  send_email_notification?: boolean
  email_template?: string | null
}

export interface UpdateCampaignInput extends Partial<CreateCampaignInput> {
  status?: CampaignStatus
  confirm_update?: boolean
}

