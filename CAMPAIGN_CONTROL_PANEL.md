# Campaign Control Panel - Complete Documentation

**Last Updated**: December 8, 2025  
**Status**: ✅ All 6 Phases Complete  
**Tech Stack**: Next.js 14, TypeScript, Supabase, Tailwind CSS v4, SWR

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Phase 1: Database & API Foundation](#phase-1-database--api-foundation)
3. [Phase 2: Campaign Management UI](#phase-2-campaign-management-ui)
4. [Phase 3: Partner Management UI](#phase-3-partner-management-ui)
5. [Phase 4: Campaign Creation Wizard](#phase-4-campaign-creation-wizard)
6. [Phase 5: Frontend Integration](#phase-5-frontend-integration)
7. [Phase 6: Analytics Dashboard](#phase-6-analytics-dashboard)
8. [Database Schema](#database-schema)
9. [API Reference](#api-reference)
10. [Component Architecture](#component-architecture)
11. [How to Extend](#how-to-extend)

---

## Project Overview

WeightWin Campaign Control Panel is a comprehensive admin system for managing partner campaigns. Users take daily scale photos for 7/14/21/30 days and earn rewards from partner companies (e.g., BOLD Soccer Academy offers 30% off membership after 7 days of tracking).

### Key Features

- **Campaign Management**: Create, edit, pause, clone, and archive campaigns
- **Partner Management**: Manage partner organizations and their campaigns
- **Dynamic Banners**: Show campaign banners to all users (logged in or not)
- **Analytics Dashboard**: Comprehensive conversion funnel and performance tracking
- **Participant Tracking**: Monitor user progress and completion rates
- **CSV Export**: Download participant data for analysis
- **Feature Flags**: Emergency kill switch for campaigns (`NEXT_PUBLIC_BOLD_CAMPAIGN_ENABLED`)

### Brand Colors

- Primary: `#4F46E5` (Indigo)
- Success: `#059669` (Green)
- Warning: `#F59E0B` (Orange)
- Background: `#0a0a0a` (Dark)
- Cards: `#1a1a1a` (Dark Gray)

---

## Phase 1: Database & API Foundation

**Status**: ✅ Complete  
**Files**: 17 API endpoints

### API Endpoints Created

#### Campaign Management (7 endpoints)

```typescript
// List all campaigns with filtering
GET /api/admin/campaigns?status=active&partner=uuid&search=soccer

// Get single campaign details
GET /api/admin/campaigns/[id]

// Create new campaign
POST /api/admin/campaigns

// Update campaign
PUT /api/admin/campaigns/[id]

// Delete/Archive campaign
DELETE /api/admin/campaigns/[id]

// Pause campaign
POST /api/admin/campaigns/[id]/pause

// Activate campaign
POST /api/admin/campaigns/[id]/activate

// Clone campaign
POST /api/admin/campaigns/[id]/clone
```

#### Partner Management (5 endpoints)

```typescript
// List all partners
GET /api/admin/partners?active=true&search=bold

// Get single partner
GET /api/admin/partners/[id]

// Create partner
POST /api/admin/partners

// Update partner
PUT /api/admin/partners/[id]

// Delete partner
DELETE /api/admin/partners/[id]
```

#### Analytics (3 endpoints)

```typescript
// Campaign-specific analytics
GET /api/admin/campaigns/[id]/analytics

// Participant list
GET /api/admin/campaigns/[id]/participants

// Export participants CSV
GET /api/admin/campaigns/[id]/export
```

#### Global Analytics (2 endpoints)

```typescript
// Global dashboard stats
GET /api/admin/analytics/dashboard

// Active campaigns for frontend
GET /api/campaigns/active
```

### Database Functions

Created in `scripts/24_campaign_functions.sql`:

```sql
-- Get active campaigns with partner data
get_active_campaigns()

-- Track banner clicks
track_campaign_click(p_campaign_id UUID, p_user_id UUID, p_user_agent TEXT, p_referrer TEXT)

-- Join campaign (create participation record)
join_campaign(p_campaign_id UUID, p_user_id UUID)

-- Check if user can join campaign
can_user_join_campaign(p_campaign_id UUID, p_user_id UUID)
```

Fixed in `scripts/26_fix_join_campaign_function.sql` to match actual table schema.

---

## Phase 2: Campaign Management UI

**Status**: ✅ Complete  
**Location**: `/admin/campaigns`

### Components Created

```
components/admin/campaigns/
├── CampaignCard.tsx         # Campaign list item with actions
├── CampaignFilters.tsx      # Status, partner, date filters
├── CampaignStats.tsx        # KPI overview cards
└── BannerPreview.tsx        # Live banner preview
```

### Features

- **List View**: Grid of campaign cards with status badges
- **Filters**: Status (All/Active/Scheduled/Paused/Ended), Partner, Date range, Search
- **Actions**: 
  - 📊 Analytics - View detailed metrics
  - ✏️ Edit - Modify campaign
  - ⏸️ Pause - Hide banner
  - ▶️ Activate - Start/Resume campaign
  - 📋 Clone - Duplicate campaign
- **Stats Cards**: Total campaigns, active count, total participants, phone submissions
- **Real-time Updates**: SWR with cache invalidation

### File Structure

```typescript
// app/admin/campaigns/page.tsx
export default function CampaignsPage() {
  const { data, mutate } = useSWR('/api/admin/campaigns')
  
  return (
    <>
      <CampaignStats campaigns={data} />
      <CampaignFilters filters={filters} onChange={setFilters} />
      <div className="grid gap-6">
        {filteredCampaigns.map(campaign => (
          <CampaignCard key={campaign.id} campaign={campaign} onRefresh={mutate} />
        ))}
      </div>
    </>
  )
}
```

---

## Phase 3: Partner Management UI

**Status**: ✅ Complete  
**Location**: `/admin/partners`

### Components Created

```
components/admin/partners/
├── PartnerCard.tsx          # Partner display card
├── PartnerForm.tsx          # Create/Edit form
└── PartnerModal.tsx         # Modal wrapper for form
```

### Features

- **List View**: Grid of partner cards with logos
- **Create Partner**: Modal form with validation
- **Edit Partner**: Update existing partners
- **Delete Partner**: Soft delete with confirmation
- **Campaign Count**: Shows number of campaigns per partner
- **Stats Cards**: Total partners, active count, total campaigns

### Partner Form Fields

```typescript
interface PartnerFormData {
  name: string              // Required
  slug: string              // Auto-generated from name
  logo_url?: string         // Optional
  contact_email: string     // Required
  contact_phone?: string    // Optional
  location?: string         // Optional
  website?: string          // Optional
  notes?: string            // Optional
  active: boolean           // Default true
}
```

---

## Phase 4: Campaign Creation Wizard

**Status**: ✅ Complete  
**Location**: `/admin/campaigns/new`

### Components Created

```
components/admin/campaigns/wizard/
├── CampaignWizard.tsx       # Main wizard controller
├── WizardStepper.tsx        # Step navigation
├── Step1BasicInfo.tsx       # Name, partner, dates
├── Step2Requirements.tsx    # Duration, phone, capacity
├── Step3Design.tsx          # Colors, banner, logo
├── Step4Schedule.tsx        # Auto-activate settings
└── Step5Preview.tsx         # Final review & submit
```

### Wizard Steps

#### Step 1: Basic Information
- Campaign Name (required)
- Partner Selection (required)
- Reward Type (discount/freebie/cashback)
- Discount Percentage (if discount)
- Reward Description (required)
- Terms & Conditions (optional)

#### Step 2: Challenge Requirements
- Required Days (7/14/21/30)
- Require Phone Number (yes/no)
- Reuse Phone from Profile (yes/no)
- Allow Multiple Participations (yes/no)
- Campaign Capacity (optional limit)

#### Step 3: Design & Branding
- Primary Color (hex picker)
- Secondary Color (hex picker)
- Banner Heading (required)
- Banner Body (required)
- CTA Text (required)
- Banner Logo URL (optional)
- Banner Background URL (optional)
- Live Preview

#### Step 4: Schedule & Activation
- Start Date (required)
- End Date (required)
- Auto-Activate (on start date)
- Auto-Deactivate (on end date)
- Priority Level (1-100)

#### Step 5: Preview & Submit
- Full campaign preview
- All details review
- Submit to create
- Auto-redirect to campaign list

### Features

- **Auto-Save**: Form data saved to localStorage
- **Step Validation**: Can't proceed with invalid data
- **Live Preview**: Real-time banner preview in Step 3
- **Edit Mode**: Wizard can be used for editing existing campaigns
- **Clone Support**: Pre-fills form when cloning

### Usage

```typescript
// Create new campaign
router.push('/admin/campaigns/new')

// Edit existing campaign
router.push(`/admin/campaigns/${id}/edit`)

// Clone campaign
// Automatically opens wizard with pre-filled data
```

---

## Phase 5: Frontend Integration

**Status**: ✅ Complete  
**Location**: Landing page (`app/page.tsx`)

### Components Created

```
components/
├── CampaignBanner.tsx       # Dynamic campaign banner
└── lib/helpers/
    └── campaign-tracker.ts  # Click/join tracking
```

### Key Changes

#### 1. Banner Component

Shows active campaigns to **ALL users** (logged in or not):

```typescript
// components/CampaignBanner.tsx
export function CampaignBanner({ userId?: string }: { userId?: string }) {
  const { campaigns, isLoading } = useCampaigns()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  // ALL hooks MUST come before early returns (React rules)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { /* rotation */ }, [mounted, campaigns.length])
  
  // Early returns AFTER all hooks
  if (!mounted || !featureFlagEnabled || isLoading) return null
  if (campaigns.length === 0) return null
  
  const campaign = campaigns[currentIndex]
  if (!campaign || !campaign.partner) return null
  
  // ... render banner
}
```

**Important**: The hooks order fix was critical - all `useEffect` hooks must be called before any early `return` statements to avoid React error #310.

#### 2. Click Tracking

```typescript
// lib/helpers/campaign-tracker.ts
export async function trackCampaignClick(
  campaignId: string,
  userId: string | null  // Can be null for logged-out users
): Promise<void>

export async function joinCampaign(
  campaignId: string,
  userId: string
): Promise<{ success: boolean; message?: string }>

export async function canJoinCampaign(
  campaignId: string,
  userId: string
): Promise<{ can_join: boolean; reason?: string }>
```

#### 3. Feature Flag

```bash
# .env.local
NEXT_PUBLIC_BOLD_CAMPAIGN_ENABLED=true  # Emergency kill switch
```

Turn off immediately if issues arise:
```bash
NEXT_PUBLIC_BOLD_CAMPAIGN_ENABLED=false
```

#### 4. Banner Behavior

**For Logged-Out Users:**
- Shows banner
- Click shows toast: "Sign up to join this campaign and earn rewards! 🎉"
- Tracks click with `userId: null`

**For Logged-In Users:**
- Shows banner
- Click checks eligibility
- Joins campaign if eligible
- Shows success toast
- Tracks click with actual user ID

#### 5. Multiple Campaigns

If multiple active campaigns exist:
- Rotates every 10 seconds
- Shows indicator dots
- Click any dot to jump to that campaign

---

## Phase 6: Analytics Dashboard

**Status**: ✅ Complete  
**Locations**: 
- Global: `/admin/analytics`
- Campaign: `/admin/campaigns/[id]/analytics`

### Components Created

```
components/admin/analytics/
├── MetricCard.tsx           # Reusable stat card
├── ConversionFunnel.tsx     # Visual funnel
├── TimelineChart.tsx        # Activity bar chart
├── ParticipantTable.tsx     # Filterable participant list
├── TopPerformers.tsx        # Leaderboard
└── ExportButton.tsx         # CSV download
```

### Campaign Analytics Page

#### Metrics Displayed

1. **Primary Metrics**
   - Total Clicks
   - Challenge Starts
   - Completions
   - Phone Submissions

2. **Conversion Rates**
   - Click-to-Start Rate
   - Completion Rate
   - Phone Submission Rate
   - Overall Conversion (Click to Phone)

3. **Cost Analysis**
   - ROI Percentage
   - Cost Per Acquisition (CPA)
   - Estimated Cost
   - Estimated Revenue

#### Visualizations

**Conversion Funnel**
```
👆 Banner Clicks       1000  100.0%
▶️ Started Challenge    150   15.0%
✅ Completed Challenge   45    30.0%
📞 Submitted Phone       38    84.4%

Overall Conversion: 3.8%
```

**Timeline Chart**
- Last 30 days of activity
- Bar chart with clicks and starts
- Hover for exact numbers
- Auto-generated from participant data

**Top Performers**
- 10 fastest completers
- Shows completion time in days
- Medals for top 3: 🥇🥈🥉

**Participant Table**
- Filter: All / Completed / In Progress
- Search by email, phone, or user ID
- Progress bars (X/7 days)
- Duration calculation
- Phone number display
- Status badges

### Global Analytics Page

#### Overview Metrics

- Total Campaigns
- Active Campaigns
- Total Participants
- Phone Submissions
- Total Clicks
- Total Starts
- Total Completions
- Overall Conversion Rate

#### Campaign List

Each campaign shows:
- Name and status
- Partner name
- Click count
- Start count
- Completion count
- Phone submission count
- Conversion rate
- Click to view details

### Real-Time Updates

Both analytics pages use SWR with 30-second refresh interval:

```typescript
const { data } = useSWR(
  '/api/admin/campaigns/${id}/analytics',
  fetcher,
  { refreshInterval: 30000 }
)
```

### CSV Export

Export button downloads CSV with all participant data:

```csv
user_id,user_email,started_at,completed_at,phone_number,days_completed,status,reward_claimed
276166bc-8dbd-4051-8982-ddaa25c9bbf6,user@example.com,2025-10-13,2025-12-02,+20122417607,7,completed,false
```

---

## Database Schema

### Tables

#### `campaigns`

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  reward_type VARCHAR(50) NOT NULL, -- discount, freebie, cashback
  discount_percentage INT,
  reward_description TEXT NOT NULL,
  terms_conditions TEXT,
  required_days INT NOT NULL DEFAULT 7,
  require_phone BOOLEAN DEFAULT false,
  reuse_phone BOOLEAN DEFAULT true,
  allow_multiple_participation BOOLEAN DEFAULT false,
  capacity INT,
  banner_heading TEXT NOT NULL,
  banner_body TEXT NOT NULL,
  cta_text VARCHAR(100) NOT NULL,
  banner_logo_url TEXT,
  banner_bg_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#4F46E5',
  secondary_color VARCHAR(7) DEFAULT '#4338CA',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  auto_activate BOOLEAN DEFAULT true,
  auto_deactivate BOOLEAN DEFAULT true,
  priority INT DEFAULT 10,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, active, paused, ended
  estimated_cost DECIMAL(10,2),
  banner_clicks INT DEFAULT 0,
  challenge_starts INT DEFAULT 0,
  completions INT DEFAULT 0,
  phone_submissions INT DEFAULT 0,
  send_email_notification BOOLEAN DEFAULT true,
  email_template TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);
```

#### `partners`

```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  location VARCHAR(255),
  website VARCHAR(255),
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `campaign_participants`

```sql
CREATE TABLE campaign_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  user_id UUID NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  phone_number VARCHAR(50),
  days_completed INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  last_checkin_date DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, abandoned
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Key Relationships

```
partners (1) ──── (many) campaigns
campaigns (1) ──── (many) campaign_participants
```

---

## API Reference

### Campaign APIs

#### GET /api/admin/campaigns

**Query Params:**
- `status` - Filter by status (active, scheduled, paused, ended)
- `partner` - Filter by partner ID
- `search` - Search in name or slug
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "BOLD Soccer 30% Off",
      "slug": "bold-soccer-30-off",
      "status": "active",
      "partner": {
        "id": "uuid",
        "name": "BOLD Soccer Academy",
        "logo_url": "https://..."
      },
      "banner_clicks": 150,
      "challenge_starts": 45,
      "completions": 12,
      "phone_submissions": 10,
      "participants": [{ "count": 45 }]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "total_pages": 1
  }
}
```

#### POST /api/admin/campaigns

**Body:**
```json
{
  "partner_id": "uuid",
  "name": "Campaign Name",
  "reward_type": "discount",
  "discount_percentage": 30,
  "reward_description": "30% OFF...",
  "required_days": 7,
  "require_phone": true,
  "banner_heading": "LIMITED TIME!",
  "banner_body": "Finish 7 days...",
  "cta_text": "Join Now",
  "primary_color": "#4F46E5",
  "secondary_color": "#4338CA",
  "start_date": "2025-12-01",
  "end_date": "2025-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* created campaign */ },
  "message": "Campaign created successfully"
}
```

#### PUT /api/admin/campaigns/[id]

Same body as POST, updates existing campaign.

#### DELETE /api/admin/campaigns/[id]

Soft deletes campaign (sets `archived_at`).

#### POST /api/admin/campaigns/[id]/pause

Pauses active campaign (sets status to 'paused').

#### POST /api/admin/campaigns/[id]/activate

Activates paused/scheduled campaign (sets status to 'active').

#### POST /api/admin/campaigns/[id]/clone

Clones campaign with " - Copy" suffix.

**Response:**
```json
{
  "success": true,
  "data": { "id": "new-uuid", /* cloned campaign */ },
  "message": "Campaign cloned successfully"
}
```

### Analytics APIs

#### GET /api/admin/campaigns/[id]/analytics

**Response:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "uuid",
      "name": "Campaign Name",
      "required_days": 7
    },
    "metrics": {
      "banner_clicks": 150,
      "challenge_starts": 45,
      "completions": 12,
      "phone_submissions": 10,
      "click_to_start_rate": "30.00",
      "completion_rate": "26.67",
      "phone_submission_rate": "83.33",
      "overall_conversion": "6.67"
    },
    "cost_analysis": {
      "estimated_cost": 5000.00,
      "estimated_revenue": "750.00",
      "roi": "15.00",
      "cost_per_acquisition": "500.00"
    },
    "timeline": [
      { "date": "2025-12-01", "clicks": 10, "starts": 3 }
    ],
    "top_performers": [
      {
        "user_email": "user@example.com",
        "days_to_complete": 7,
        "completed_at": "2025-12-08"
      }
    ],
    "status_breakdown": {
      "active": 5,
      "completed": 10,
      "abandoned": 2
    }
  }
}
```

#### GET /api/admin/campaigns/[id]/participants

**Query Params:**
- `status` - Filter by status
- `phone_status` - Filter by phone (provided, missing)
- `search` - Search users
- `sort` - Sort by (date, progress, completion)
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "user_email": "user@example.com",
      "started_at": "2025-10-13",
      "completed_at": "2025-12-02",
      "phone_number": "+20122417607",
      "days_completed": 7,
      "status": "completed",
      "reward_claimed": false
    }
  ],
  "pagination": { /* ... */ }
}
```

#### GET /api/admin/campaigns/[id]/export

**Response:** CSV file download

```csv
user_id,user_email,started_at,completed_at,phone_number,days_completed,status,reward_claimed
uuid,user@example.com,2025-10-13,2025-12-02,+20122417607,7,completed,false
```

#### GET /api/admin/analytics/dashboard

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_campaigns": 5,
      "active_campaigns": 2,
      "total_participants": 150,
      "total_phones": 45
    },
    "totals": {
      "banner_clicks": 500,
      "challenge_starts": 150,
      "completions": 45,
      "phone_submissions": 38
    },
    "campaigns": [
      {
        "id": "uuid",
        "name": "Campaign Name",
        "status": "active",
        "partner_name": "Partner Name",
        "banner_clicks": 150,
        "challenge_starts": 45,
        "completions": 12,
        "phone_submissions": 10
      }
    ]
  }
}
```

### Frontend APIs

#### GET /api/campaigns/active

Public endpoint for fetching active campaigns (for banner display).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "BOLD Soccer 30% Off",
      "slug": "bold-soccer-30-off",
      "banner_heading": "🔥 LIMITED TIME OFFER!",
      "banner_body": "Finish 7 days...",
      "cta_text": "Let's Play! →",
      "primary_color": "#F59E0B",
      "secondary_color": "#EF4444",
      "partner": {
        "id": "uuid",
        "name": "BOLD Soccer Academy",
        "logo_url": "https://..."
      }
    }
  ]
}
```

---

## Component Architecture

### Folder Structure

```
app/
├── admin/
│   ├── analytics/
│   │   └── page.tsx                    # Global analytics
│   ├── campaigns/
│   │   ├── [id]/
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx           # Campaign analytics
│   │   │   └── edit/
│   │   │       └── page.tsx           # Edit campaign (wizard)
│   │   ├── new/
│   │   │   └── page.tsx               # Create campaign (wizard)
│   │   └── page.tsx                   # Campaign list
│   └── partners/
│       └── page.tsx                   # Partner list
├── api/
│   ├── admin/
│   │   ├── analytics/
│   │   │   └── dashboard/
│   │   │       └── route.ts
│   │   ├── campaigns/
│   │   │   ├── [id]/
│   │   │   │   ├── activate/
│   │   │   │   ├── analytics/
│   │   │   │   ├── clone/
│   │   │   │   ├── export/
│   │   │   │   ├── participants/
│   │   │   │   ├── pause/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   └── partners/
│   │       ├── [id]/
│   │       │   └── route.ts
│   │       └── route.ts
│   └── campaigns/
│       └── active/
│           └── route.ts
└── page.tsx                           # Landing page with banner

components/
├── admin/
│   ├── AdminHeader.tsx                # Admin navigation
│   ├── analytics/
│   │   ├── ConversionFunnel.tsx
│   │   ├── ExportButton.tsx
│   │   ├── MetricCard.tsx
│   │   ├── ParticipantTable.tsx
│   │   ├── TimelineChart.tsx
│   │   └── TopPerformers.tsx
│   ├── campaigns/
│   │   ├── BannerPreview.tsx
│   │   ├── CampaignCard.tsx
│   │   ├── CampaignFilters.tsx
│   │   ├── CampaignStats.tsx
│   │   └── wizard/
│   │       ├── CampaignWizard.tsx
│   │       ├── Step1BasicInfo.tsx
│   │       ├── Step2Requirements.tsx
│   │       ├── Step3Design.tsx
│   │       ├── Step4Schedule.tsx
│   │       ├── Step5Preview.tsx
│   │       └── WizardStepper.tsx
│   └── partners/
│       ├── PartnerCard.tsx
│       ├── PartnerForm.tsx
│       └── PartnerModal.tsx
├── CampaignBanner.tsx                 # Frontend banner
└── lib/
    └── helpers/
        └── campaign-tracker.ts        # Tracking helpers

scripts/
├── 24_campaign_functions.sql          # Initial functions
└── 26_fix_join_campaign_function.sql  # Schema fix
```

### Custom Hooks

```typescript
// hooks/useCampaigns.ts
export function useCampaigns() {
  const { data, error, isLoading } = useSWR('/api/campaigns/active', fetcher)
  
  return {
    campaigns: data?.data || [],
    isLoading,
    error
  }
}
```

---

## How to Extend

### Adding a New Campaign Field

1. **Update Database Schema**

```sql
ALTER TABLE campaigns ADD COLUMN new_field TEXT;
```

2. **Update TypeScript Types**

```typescript
// Add to campaign type
interface Campaign {
  // ... existing fields
  new_field?: string
}
```

3. **Update API Endpoints**

```typescript
// app/api/admin/campaigns/route.ts
const campaign = {
  // ... existing fields
  new_field: body.new_field
}
```

4. **Update Wizard**

Add field to appropriate step:

```typescript
// components/admin/campaigns/wizard/Step1BasicInfo.tsx
<input
  name="new_field"
  value={formData.new_field}
  onChange={handleChange}
/>
```

5. **Update Validation**

```typescript
const campaignSchema = z.object({
  // ... existing fields
  new_field: z.string().optional()
})
```

### Adding a New Analytics Metric

1. **Calculate in API**

```typescript
// app/api/admin/campaigns/[id]/analytics/route.ts
const newMetric = {
  custom_conversion: campaign.custom_field > 0
    ? ((campaign.another_field / campaign.custom_field) * 100).toFixed(2)
    : '0'
}
```

2. **Add Metric Card**

```typescript
// app/admin/campaigns/[id]/analytics/page.tsx
<MetricCard
  title="Custom Metric"
  value={`${data.newMetric}%`}
  icon="📈"
  color="#8B5CF6"
  subtitle="Custom description"
/>
```

3. **Update Dashboard Response**

Ensure new metric is included in API response.

### Adding a New Admin Feature

1. **Create API Endpoint**

```typescript
// app/api/admin/campaigns/[id]/custom-action/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Check auth
  // 2. Check admin
  // 3. Perform action
  // 4. Return response
}
```

2. **Add UI Button**

```typescript
// components/admin/campaigns/CampaignCard.tsx
<button
  onClick={() => handleCustomAction(campaign.id)}
  className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg"
>
  Custom Action
</button>
```

3. **Update Handler**

```typescript
const handleCustomAction = async (id: string) => {
  const res = await fetch(`/api/admin/campaigns/${id}/custom-action`, {
    method: 'POST'
  })
  const data = await res.json()
  
  if (res.ok) {
    toast.success(data.message)
    mutate() // Refresh data
  } else {
    toast.error(data.message)
  }
}
```

### Adding a New Filter

1. **Update Filter State**

```typescript
const [filters, setFilters] = useState({
  // ... existing filters
  newFilter: 'all'
})
```

2. **Add Filter UI**

```typescript
<select
  value={filters.newFilter}
  onChange={(e) => setFilters({ ...filters, newFilter: e.target.value })}
>
  <option value="all">All</option>
  <option value="option1">Option 1</option>
</select>
```

3. **Apply Filter**

```typescript
const filteredCampaigns = campaigns.filter(campaign => {
  // ... existing filters
  if (filters.newFilter !== 'all' && campaign.field !== filters.newFilter) {
    return false
  }
  return true
})
```

---

## Troubleshooting

### Campaign Banner Not Showing

1. **Check Feature Flag**
   ```bash
   NEXT_PUBLIC_BOLD_CAMPAIGN_ENABLED=true
   ```

2. **Check Active Campaigns**
   ```sql
   SELECT * FROM campaigns 
   WHERE status = 'active' 
   AND start_date <= NOW() 
   AND end_date >= NOW();
   ```

3. **Check Function**
   ```sql
   SELECT * FROM get_active_campaigns();
   ```

4. **Check Browser Console**
   Look for API errors or React errors.

### Join Campaign Fails

1. **Check Function Exists**
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'join_campaign';
   ```

2. **Run Fixed Function**
   ```bash
   psql < scripts/26_fix_join_campaign_function.sql
   ```

3. **Check Table Schema**
   ```sql
   \d campaign_participants
   ```

   Ensure these columns exist:
   - `id`, `campaign_id`, `user_id`, `started_at`, `status`, `days_completed`, `current_streak`, `reward_claimed`, `created_at`, `updated_at`

### Hydration Error on Landing Page

This was caused by React hooks being called after conditional returns. **Solution**: All `useEffect` hooks must be called before any `return` statements.

```typescript
// ❌ WRONG
if (!mounted) return null
useEffect(() => { setMounted(true) }, []) // Hook after return!

// ✅ CORRECT
useEffect(() => { setMounted(true) }, []) // Hook first
if (!mounted) return null // Return after
```

### Analytics Not Loading

1. **Check Admin Status**
   ```sql
   SELECT * FROM public.admins WHERE user_id = 'your-user-id';
   ```

2. **Check RPC Function**
   ```sql
   SELECT is_admin('your-user-id');
   ```

3. **Check API Permissions**
   - Ensure `is_admin` function has correct parameter name (`uid`, not `user_id`)
   - Check all 17 admin API endpoints use `await createClient()`

---

## Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Feature Flags
NEXT_PUBLIC_BOLD_CAMPAIGN_ENABLED=true  # Campaign banner system

# Vercel (auto-set in production)
NEXT_PUBLIC_VERCEL_URL=your-app.vercel.app
```

---

## Testing Checklist

### Campaign Management
- [ ] List campaigns with filters
- [ ] Create new campaign via wizard
- [ ] Edit existing campaign
- [ ] Pause active campaign
- [ ] Resume paused campaign
- [ ] Clone campaign
- [ ] Delete campaign

### Partner Management
- [ ] List partners
- [ ] Create new partner
- [ ] Edit existing partner
- [ ] Delete partner
- [ ] View partner campaigns

### Analytics
- [ ] View global dashboard
- [ ] View campaign analytics
- [ ] Filter participants
- [ ] Search participants
- [ ] Export CSV
- [ ] Check conversion rates
- [ ] Verify timeline chart
- [ ] Check top performers

### Frontend Integration
- [ ] Banner shows on landing page
- [ ] Banner rotates if multiple campaigns
- [ ] Click tracking works
- [ ] Join campaign works (logged in)
- [ ] Toast shows for logged out users
- [ ] Feature flag disables banner
- [ ] No hydration errors

---

## Performance Considerations

1. **SWR Caching**: All admin pages use SWR for automatic caching and revalidation
2. **Pagination**: All list endpoints support pagination (default 20 items)
3. **Database Indexes**: Ensure indexes on `status`, `partner_id`, `start_date`, `end_date`
4. **RPC Functions**: Use Postgres functions for complex queries
5. **Client-Side Filtering**: Filter/search happens client-side for better UX
6. **Debounced Search**: Search inputs should be debounced (add if needed)

---

## Security Notes

1. **Admin Guard**: All `/admin/*` routes protected by `userIsAdmin()` check
2. **API Authentication**: All admin APIs verify admin status via `is_admin()` RPC
3. **RLS Policies**: Ensure proper Row Level Security on all tables
4. **Input Validation**: All endpoints use Zod schemas for validation
5. **CSRF Protection**: Next.js handles CSRF automatically
6. **Feature Flags**: Allow emergency disable without deployment

---

## Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: campaign control panel"
   git push origin main
   ```

2. **Vercel Auto-Deploy**
   - Automatic deployment on push to `main`
   - Environment variables set in Vercel dashboard
   - Build time: ~2-3 minutes

3. **Post-Deployment**
   - Verify feature flag is enabled
   - Test admin access
   - Check analytics data
   - Verify banner displays

---

## Future Enhancements

### Short-Term
- [ ] Email notifications when campaign starts/ends
- [ ] Scheduled campaign activation via cron
- [ ] Participant email lookup (join with `auth.users`)
- [ ] Campaign templates for quick creation
- [ ] Bulk actions (pause multiple campaigns)

### Medium-Term
- [ ] A/B testing for banner designs
- [ ] Custom reward redemption flow
- [ ] Partner portal for self-service
- [ ] Advanced analytics (cohort analysis)
- [ ] Push notifications for campaign milestones

### Long-Term
- [ ] Multi-language support
- [ ] Geo-targeting for campaigns
- [ ] Machine learning for conversion optimization
- [ ] Integration with CRM systems
- [ ] White-label partner dashboards

---

## Support & Maintenance

### Common Tasks

**Add New Admin User**
```sql
INSERT INTO public.admins (user_id) 
VALUES ('user-uuid-here');
```

**Emergency Disable All Campaigns**
```bash
# Set in Vercel environment variables
NEXT_PUBLIC_BOLD_CAMPAIGN_ENABLED=false
```

**Reset Campaign Counters**
```sql
UPDATE campaigns 
SET banner_clicks = 0, 
    challenge_starts = 0, 
    completions = 0, 
    phone_submissions = 0
WHERE id = 'campaign-uuid';
```

**Archive Old Campaigns**
```sql
UPDATE campaigns 
SET archived_at = NOW() 
WHERE end_date < NOW() - INTERVAL '30 days'
AND archived_at IS NULL;
```

---

## License & Credits

**Built For**: WeightWin App  
**Developer**: Andro William  
**Framework**: Next.js 14  
**Database**: Supabase (PostgreSQL)  
**Styling**: Tailwind CSS v4  
**Deployment**: Vercel  

**Version**: 1.0.0  
**Last Updated**: December 8, 2025

---

## Changelog

### v1.0.0 (December 8, 2025)
- ✅ Phase 1: Database & API Foundation (17 endpoints)
- ✅ Phase 2: Campaign Management UI
- ✅ Phase 3: Partner Management UI
- ✅ Phase 4: Campaign Creation Wizard
- ✅ Phase 5: Frontend Integration (Dynamic Banner)
- ✅ Phase 6: Analytics Dashboard

**Total Files Created**: 50+  
**Total Lines of Code**: 15,000+  
**Features**: 100% Complete 🎉

---

**End of Documentation**

