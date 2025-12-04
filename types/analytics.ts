export interface CampaignMetrics {
  banner_clicks: number
  challenge_starts: number
  active_participants: number
  completions: number
  phone_submissions: number
  click_to_start_rate: string
  completion_rate: string
  phone_submission_rate: string
  overall_conversion: string
}

export interface CostAnalysis {
  estimated_cost: number
  estimated_revenue: string
  roi: string
  cost_per_acquisition: string
}

export interface TimelineDataPoint {
  date: string
  clicks: number
  starts: number
}

export interface TopPerformer {
  user_id: string
  user_email: string
  days_to_complete: number
  completed_at: string
  phone_provided: boolean
}

export interface StatusBreakdown {
  active: number
  completed: number
  abandoned: number
}

export interface CampaignAnalytics {
  campaign: {
    id: string
    name: string
    slug: string
    status: string
    start_date: string
    end_date: string
    required_days: number
    partner: {
      id: string
      name: string
      logo_url: string | null
    }
  }
  metrics: CampaignMetrics
  cost_analysis: CostAnalysis
  timeline: TimelineDataPoint[]
  top_performers: TopPerformer[]
  status_breakdown: StatusBreakdown
  summary: {
    total_participants: number
    campaign_duration_days: number
    avg_days_to_complete: string
  }
}

export interface ParticipantListItem {
  id: string
  user_id: string
  user_email: string
  started_at: string
  completed_at: string | null
  phone_number: string | null
  days_completed: number
  current_streak: number
  status: string
  reward_claimed: boolean
}

export interface DashboardOverview {
  total_campaigns: number
  active_campaigns: number
  scheduled_campaigns: number
  ended_campaigns: number
  total_partners: number
  total_participants: number
}

export interface DashboardTotals {
  banner_clicks: number
  challenge_starts: number
  completions: number
  phone_submissions: number
  estimated_cost: number
}

export interface DashboardAnalytics {
  overview: DashboardOverview
  totals: DashboardTotals
  avg_conversion: {
    click_to_start: string
    completion_rate: string
    phone_submission_rate: string
  }
  recent_activity: {
    new_participants_7d: number
    new_completions_7d: number
  }
  top_campaigns: Array<{
    id: string
    name: string
    status: string
    completions: number
    challenge_starts: number
    completion_rate: string
  }>
}

