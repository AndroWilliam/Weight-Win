export interface Partner {
  id: string
  name: string
  slug: string
  logo_url: string | null
  contact_email: string | null
  contact_phone: string | null
  location: string | null
  website: string | null
  notes: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface PartnerWithCampaignCount extends Partner {
  campaigns: [{ count: number }]
}

export interface PartnerWithCampaigns extends Partner {
  campaigns: Array<{
    id: string
    name: string
    slug: string
    status: string
    start_date: string
    end_date: string
    required_days: number
    completions: number
    phone_submissions: number
  }>
  total_participants: number
}

export interface CreatePartnerInput {
  name: string
  logo_url?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  location?: string | null
  website?: string | null
  notes?: string | null
}

export interface UpdatePartnerInput extends Partial<CreatePartnerInput> {
  active?: boolean
}

