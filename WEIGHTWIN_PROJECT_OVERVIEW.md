# WeightWin - Complete Project Overview & User Journey

**Last Updated:** 2025-11-24
**Purpose:** Comprehensive documentation for planning a new rewards system

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Complete User Journey](#complete-user-journey)
5. [Current Reward System](#current-reward-system)
6. [Database Schema](#database-schema)
7. [Key Features](#key-features)
8. [Admin System](#admin-system)
9. [API Patterns](#api-patterns)
10. [Considerations for New Rewards System](#considerations-for-new-rewards-system)

---

## Project Overview

**WeightWin** is a habit-building web application that helps users develop consistent weight tracking habits through a milestone-based challenge system. Users take daily photos of their scale readings, and the app uses OCR to automatically extract weight data.

### Core Value Proposition
- **No calorie counting, no overwhelm** - Just show up daily
- **Photo-based tracking** - Snap a scale photo, we handle the rest
- **Milestone-based progression** - 7, 14, 21, and 30-day milestones
- **Reward system** - Free nutritionist consultation upon completion

### Key Metrics
- **User Engagement:** Daily check-ins, streak tracking
- **Success Metrics:** Milestone completion rates, badge unlocks
- **Retention:** Current streak, longest streak, days since last check-in

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + Radix UI primitives
- **State Management:** React Hooks, localStorage for client-side persistence
- **Charts:** Chart.js with react-chartjs-2
- **Theme:** next-themes (light/dark mode support)

### Backend
- **Database:** Supabase (PostgreSQL 15+)
- **Authentication:** Supabase Auth with Google OAuth (custom implementation)
- **Storage:** Supabase Storage for scale photos
- **API:** Next.js API Routes (App Router)
- **OCR:** Google Cloud Vision API (with dev mode mock)

### Infrastructure
- **Hosting:** Vercel
- **Package Manager:** pnpm
- **Testing:** Jest (unit), Playwright (E2E)
- **Monitoring:** Sentry (optional)

### Key Libraries
- `@supabase/supabase-js` - Database client
- `zod` - Runtime validation
- `sonner` - Toast notifications
- `lucide-react` - Icon library
- `date-fns` - Date utilities

---

## Architecture

### Authentication Flow
WeightWin uses a **custom Supabase integration** (not @supabase/ssr):

1. **Client-side (`lib/supabase/client.ts`):**
   - Uses `@supabase/supabase-js` with implicit OAuth flow
   - Syncs session to custom cookies: `sb-access-token`, `sb-refresh-token`
   - Enables server-side access to auth state

2. **Server-side (`lib/supabase/server.ts`):**
   - Reads custom cookies
   - Manually calls `setSession()` with token from cookies

3. **Middleware (`lib/supabase/middleware.ts`):**
   - Updates session on each request
   - Excludes `/api/*` routes to avoid double session checks

**Why custom?** Google OAuth requires implicit flow with UUID-based codes, not PKCE. Custom cookies bridge client OAuth and SSR.

### Data Flow
```
User Action → Client Component → API Route → Supabase Function → Database
                                              ↓
                                         Update State
                                              ↓
                                      Client Re-fetches Data
```

### File Structure
```
app/
├── (auth)/               # Auth-related pages
│   ├── auth/
│   │   ├── login/       # Google OAuth
│   │   └── callback/    # OAuth redirect
│   ├── consent/         # Privacy consent
│   ├── setup/           # User preferences
│   └── commit/          # Challenge commitment
├── dashboard/           # Main dashboard (Server Component)
├── weight-check/        # Photo capture (Client Component)
├── progress/            # Charts & stats (Client Component)
├── admin/              # Admin area
│   ├── users/          # User management
│   └── applicants/     # Nutritionist applications
└── api/                # API routes
    ├── settings/       # User settings
    ├── tracking/       # Weight tracking
    ├── weight/         # OCR processing
    └── admin/          # Admin endpoints

components/
├── ui/                 # shadcn/ui components
├── photo-capture.tsx   # Camera/upload component
├── reward-countdown.tsx # Milestone countdown
├── streak-pills.tsx    # Visual streak display
└── daily-tips.tsx      # Rotating tips carousel

lib/
├── supabase/          # Supabase clients
├── api/               # API utilities
│   ├── with-handler.ts    # Error handling wrapper
│   └── responses.ts       # Standardized responses
├── ocr/               # Google Vision integration
├── validation/        # Zod schemas
└── rate-limit.ts      # In-memory rate limiting
```

---

## Complete User Journey

### Phase 1: Discovery & Authentication

#### 1.1 Landing Page (`/`)
**Purpose:** Convert visitors into users

**Elements:**
- Hero: "7 days. Daily scale photo. Free nutrition session."
- CTA button: "Start Your Journey"
- Feature highlights: No calorie counting, photo-based tracking
- Social proof (if available)

**Actions:**
- Click "Start Your Journey" → `/preview/weight-check` (demo flow) OR `/auth/login`
- If authenticated: Auto-redirect to `/dashboard`

**Technical:**
- Server Component
- Checks auth status via `createClient()` from `lib/supabase/server.ts`
- Theme toggle available

---

#### 1.2 Authentication (`/auth/login`)
**Purpose:** Secure user signup/login

**Elements:**
- Google OAuth button (primary)
- Email/password option (if enabled)
- Privacy policy link
- Terms of service link

**Flow:**
1. User clicks "Continue with Google"
2. Redirect to Google OAuth consent screen
3. Google redirects to `/auth/callback` with code
4. Callback handler exchanges code for session
5. Sets custom cookies (`sb-access-token`, `sb-refresh-token`)
6. Redirects to `/consent` (first-time) or `/dashboard` (returning)

**Technical:**
- Uses Supabase Auth with custom cookie sync
- Implicit OAuth flow (not PKCE)
- Session persists via cookies + localStorage

---

### Phase 2: Onboarding

#### 2.1 Privacy Consent (`/consent`)
**Purpose:** Obtain user consent for data processing

**Elements:**
- Three consent checkboxes:
  1. **OCR Processing:** "Process photos to extract weight data"
  2. **Data Storage:** "Store weight data and photos securely"
  3. **Share with Nutritionist:** "Share progress data with nutritionist upon completion"
- Continue button (disabled until all required consents checked)

**Flow:**
1. User reads consent items
2. Checks all required boxes
3. Clicks "Continue"
4. Data saved to localStorage temporarily
5. Redirects to `/setup`

**Technical:**
- Client Component
- No database write yet (data in localStorage)
- Required for GDPR/privacy compliance

---

#### 2.2 Setup (`/setup`)
**Purpose:** Configure user preferences

**Elements:**
- **Weight Unit:** kg or lb (default: kg)
- **Reminder Time:** Time picker (default: 08:00)
- **Timezone:** Auto-detected via browser, editable dropdown
- **Location Permission:** Optional (for better timezone accuracy)

**Flow:**
1. User selects preferences
2. System auto-detects timezone from browser
3. User confirms or adjusts
4. Clicks "Continue"
5. Data saved to localStorage
6. Redirects to `/commit`

**Technical:**
- Client Component
- Uses `Intl.DateTimeFormat().resolvedOptions().timeZone` for auto-detection
- No database write yet

---

#### 2.3 Commitment (`/commit`)
**Purpose:** Final review before starting challenge

**Elements:**
- Summary of challenge:
  - "Take a scale photo every morning"
  - "We'll remind you at [selected time]"
  - "Track weights in [kg/lb]"
  - "Earn your free nutritionist session"
- Settings review cards:
  - Daily Reminder: Time + Timezone
  - Data Sharing: Consent status
- **CTA:** "I'm in - Start My Challenge"
- Back to settings link

**Flow:**
1. User reviews all settings
2. Clicks "I'm in - Start My Challenge"
3. **Database write happens here:**
   - Calls `/api/settings/save` with all data
   - Creates `user_settings` record
   - Marks `setupCompleted = true`
4. Creates `challengeData` in localStorage
5. Redirects to `/dashboard`

**Technical:**
- Client Component
- First database interaction
- API: `POST /api/settings/save`
- On success: Full onboarding complete

---

### Phase 3: Daily Challenge Loop

#### 3.1 Dashboard (`/dashboard`)
**Purpose:** Central hub for daily check-ins and progress tracking

**Layout:**
```
┌─────────────────────────────────────────┐
│  Header: WeightWin logo, nav, profile   │
├─────────────────────────────────────────┤
│  Day X of [Milestone]                   │
│  "Ready for today's weigh-in?"          │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │  📷 Take Photo Card               │  │
│  │  [Take Photo] or [Already done ✓] │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │  Progress Card                    │  │
│  │  Pills: [✓][✓][3][4][5][6][7]    │  │
│  │  Progress Bar: 28%                │  │
│  │  Milestones: ○7 ○14 ○21 ○30      │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────┐ │
│  │ 🏆 Next      │  │ 💡 Daily Tips    │ │
│  │ Milestone    │  │ [Tip carousel]   │ │
│  │ X days left  │  │ [← Tip 1/4 →]    │ │
│  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────┘
```

**Elements:**
- **Take Photo Card:**
  - Camera icon
  - "Take today's photo" or "Today's check-in complete!"
  - CTA button (disabled if already checked in today)

- **Progress Card:**
  - Streak pills (1-7, 1-14, 1-21, or 1-30 depending on milestone)
  - Progress bar showing % to next milestone
  - Milestone indicators: 7, 14, 21, 30 days

- **Reward Countdown:**
  - Badge icon for next milestone
  - Badge name (e.g., "Week Warrior")
  - Days remaining to milestone
  - Pulsing indicator if ≤3 days left

- **Daily Tips:**
  - Auto-rotating carousel (4 categories)
  - Categories: Nutrition, Exercise, Mindfulness, Sleep
  - Changes based on day count

**Data Loaded:**
- Current day (total_days_completed)
- Current milestone (7, 14, 21, or 30)
- Next milestone
- Checked in today? (boolean)
- Completed days array
- Current streak

**API Calls:**
1. `GET /api/settings/get` - Load user settings
2. `supabase.rpc('get_challenge_progress', { p_user_id })` - Get progress

**Flow:**
1. User lands on dashboard
2. See current progress and streak
3. Click "Take Photo" → `/weight-check?day=[currentDay]`
4. After photo: Return to dashboard with updated state

**Technical:**
- Client Component (needs interactivity)
- Real-time countdown timer
- localStorage caching for fast loads
- Badge notification system (toast on return from weight check)

---

#### 3.2 Weight Check (`/weight-check`)
**Purpose:** Capture scale photo and extract weight

**Elements:**
- Camera preview (uses device camera)
- **OR** File upload (drag-drop or click)
- Capture button
- Cancel button → back to dashboard

**Photo Capture Flow:**
1. User grants camera permission
2. Live camera preview appears
3. User positions scale in frame
4. Clicks "Capture Photo"
5. Photo taken and displayed for confirmation
6. User clicks "Use this photo"
7. Image compressed client-side
8. Uploaded to Supabase Storage
9. **OCR Processing:**
   - Calls `POST /api/weight/process`
   - Server calls Google Vision API (or mock in dev)
   - Extracts weight from image
   - Returns: `{ weight_kg, confidence, alternatives }`
10. **Confirmation Modal:**
    - Shows extracted weight: "97.4 kg"
    - OCR confidence: "High confidence (98%)"
    - Edit option if incorrect
    - "Confirm" or "Retry"
11. **Save to Database:**
    - Calls `POST /api/tracking/save`
    - Server calls `record_daily_weight_checkin()`
    - Updates:
      - `weight_entries` table
      - `user_milestones` table
      - `user_streaks` table
      - Awards badge if milestone reached
    - Returns: `{ dayNumber, streak, milestone, newBadge }`
12. **Badge Notification:**
    - If badge earned: Show celebration modal
    - Badge details saved to localStorage
13. Redirect to `/dashboard`
14. Dashboard shows badge toast notification

**Technical:**
- Client Component
- Uses `getUserMedia()` API for camera
- Image compression: `lib/images/compress.ts`
- Storage upload: `lib/storageUpload.ts` with retry logic
- OCR: `lib/ocr/google-vision.ts`

**OCR Smart Parsing:**
- Filters dates, times, "Max" labels
- Prioritizes decimal numbers (e.g., "97.4")
- Handles LED quirks ("974." → "97.4")
- Range: 40-150 kg
- Returns top 3 alternatives for user correction

---

#### 3.3 Progress Page (`/progress`)
**Purpose:** Visualize weight trends and stats

**Elements:**
- **Stats Overview (3 cards):**
  1. **Weight Change:**
     - Change from last weigh-in (e.g., "-0.5 kg")
     - Trend indicator (up ⬆️, down ⬇️, neutral ➡️)
     - Emoji: 😊 (down) or 😔 (up)
     - Motivational quote if losing weight

  2. **Current Weight:**
     - Latest weight reading
     - "Latest reading" subtitle

  3. **Streak:**
     - Current consecutive days
     - "Consecutive tracking" subtitle
     - Motivational message

- **Weight Chart:**
  - Line chart showing all weight entries
  - X-axis: Dates
  - Y-axis: Weight (kg)
  - Hover tooltips with exact values
  - Theme-aware colors (adapts to light/dark mode)

- **Total Progress Summary:**
  - "You've lost/gained X kg since you started"
  - Appears only if total change ≠ 0

**Data Sources:**
- `weight_entries` table (all entries)
- `get_weight_change_summary()` RPC (statistics)
- `user_streaks` table (streak info)
- `motivational_quotes` table (random quote)

**Technical:**
- Client Component
- Uses Chart.js for visualization
- Responsive chart heights:
  - Mobile: h-48 (192px)
  - Tablet: h-64 (256px)
  - Desktop: h-80 (320px)

---

### Phase 4: Milestone & Reward System

#### 4.1 Milestone Progression

**Milestone Structure:**
- **7 days:** "Week Warrior" 🏆
- **14 days:** "Fortnight Champion" 🥇
- **21 days:** "Triple Week Legend" ⭐
- **30 days:** "Monthly Master" 👑

**How It Works:**
1. User completes Day 1 → `total_days_completed = 1`, `current_milestone = 7`
2. User completes Day 7 → `milestone_7_completed_at` set, badge awarded
3. User continues → `current_milestone` updates to `14`
4. User completes Day 14 → `milestone_14_completed_at` set, badge awarded
5. Pattern continues for 21 and 30 days

**Database Tables:**
- `user_milestones`: Tracks progress
  - `current_milestone` (7, 14, 21, or 30)
  - `total_days_completed` (0-30)
  - `current_streak` (consecutive days)
  - `milestone_X_completed_at` (timestamps)

- `milestone_badges`: Predefined badges (4 rows)
  - `milestone_day`, `badge_name`, `badge_description`, `badge_icon_url`

- `user_badges`: Awarded badges
  - `user_id`, `badge_id`, `milestone_completed`, `earned_at`

**Badge Award Flow:**
1. User saves weight entry
2. `record_daily_weight_checkin()` function runs
3. Checks if `total_days_completed` matches milestone (7, 14, 21, 30)
4. If match and not already awarded:
   - Set `milestone_X_completed_at = NOW()`
   - Insert into `user_badges`
   - Return `new_badge_earned = TRUE`
5. Client receives badge data
6. Stores in localStorage: `newBadgeEarned`
7. On dashboard return: Toast notification appears

---

#### 4.2 Current Reward: Nutritionist Consultation

**Original Reward (7-day completion):**
- Free 1-on-1 session with certified nutritionist
- Unlocked after completing 7 consecutive days
- User can apply to become a nutritionist OR book a session

**Nutritionist Application System:**
- Admin area: `/admin/applicants`
- Application form (not currently shown to users in main flow)
- Document uploads (certifications, ID)
- Admin review and approval process

**Tables:**
- `nutritionist_applications`
  - User info, documents, status
- Admins can view/approve/reject applications

**Current State:**
- Original 7-day → nutritionist reward
- Now evolved into milestone-based system
- **Gap:** Unclear what happens after earning badges
- **Opportunity:** New rewards system needed

---

## Database Schema

### Core Tables

#### `weight_entries`
```sql
CREATE TABLE weight_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  weight_kg DECIMAL(5,2) NOT NULL,
  photo_url TEXT NOT NULL,
  ocr_confidence DECIMAL(3,2),
  check_in_date DATE NOT NULL,
  day_number INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Purpose:** Store all weight entries with photos

---

#### `user_milestones`
```sql
CREATE TABLE user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  current_milestone INTEGER NOT NULL DEFAULT 7 CHECK (IN (7,14,21,30)),
  current_streak INTEGER NOT NULL DEFAULT 0,
  total_days_completed INTEGER NOT NULL DEFAULT 0,
  milestone_7_completed_at TIMESTAMPTZ,
  milestone_14_completed_at TIMESTAMPTZ,
  milestone_21_completed_at TIMESTAMPTZ,
  milestone_30_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Purpose:** Track user progress through milestones

---

#### `milestone_badges`
```sql
CREATE TABLE milestone_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_day INTEGER UNIQUE NOT NULL CHECK (IN (7,14,21,30)),
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  badge_icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Seed Data:**
- 7: "Week Warrior" 🏆
- 14: "Fortnight Champion" 🥇
- 21: "Triple Week Legend" ⭐
- 30: "Monthly Master" 👑

---

#### `user_badges`
```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  badge_id UUID NOT NULL REFERENCES milestone_badges(id),
  milestone_completed INTEGER NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```
**Purpose:** Track which badges each user has earned

---

#### `user_streaks`
```sql
CREATE TABLE user_streaks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_check_in DATE,
  streak_started_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Purpose:** Track daily check-in streaks

---

#### `user_settings`
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  weight_unit VARCHAR(10) DEFAULT 'kg',
  reminder_time TIME DEFAULT '08:00:00',
  timezone VARCHAR(100),
  location_permission VARCHAR(20),
  consent_ocr BOOLEAN DEFAULT FALSE,
  consent_storage BOOLEAN DEFAULT FALSE,
  consent_nutritionist BOOLEAN DEFAULT FALSE,
  setup_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Purpose:** Store user preferences and consent

---

#### `user_challenges`
```sql
CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  start_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, abandoned
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Purpose:** Track challenge lifecycle

---

#### `nutritionist_applications`
```sql
CREATE TABLE nutritionist_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  phone_e164 TEXT NOT NULL,
  full_name TEXT NOT NULL,
  specialization TEXT,
  years_experience INTEGER,
  bio TEXT,
  certification_url TEXT,
  id_document_url TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Purpose:** Nutritionist application system

---

#### `admins`
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Purpose:** Admin user whitelist

---

### Key Functions

#### `record_daily_weight_checkin()`
**Purpose:** Main function for recording weight entries

**Parameters:**
- `p_user_id UUID`
- `p_weight_kg DECIMAL`
- `p_photo_url TEXT`
- `p_ocr_confidence DECIMAL` (optional)

**Returns:**
```typescript
{
  weight_entry_id: number
  day_number: number
  is_new_day: boolean
  current_streak: number
  days_remaining: number
  current_milestone: number
  total_days_completed: number
  next_milestone: number
  new_badge_earned: boolean
  badge_name: string | null
  badge_icon: string | null
}
```

**Logic:**
1. Check if already checked in today
2. If yes: Update existing entry, return data
3. If no:
   - Increment `total_days_completed`
   - Calculate new `day_number`
   - Insert `weight_entry`
   - Update streak in `user_streaks`
   - Check milestone completion
   - Award badge if milestone reached
   - Update `user_milestones`
   - Return result with badge info

---

#### `get_challenge_progress()`
**Purpose:** Get user's current challenge state

**Parameters:**
- `p_user_id UUID`

**Returns:**
```typescript
{
  challenge_status: 'not_started' | 'active' | 'completed'
  current_day: number
  challenge_start_date: Date
  checked_in_today: boolean
  completed_days: number[]
  days_remaining: number
  current_streak: number
  current_milestone: number
  total_days_completed: number
  next_milestone: number
}
```

---

#### `get_weight_change_summary()`
**Purpose:** Calculate weight change statistics

**Returns:**
```typescript
{
  current_weight: number
  change_from_previous: number
  total_change: number
  trend: 'up' | 'down' | 'neutral'
  message: string
  last_recorded: Date
}
```

---

## Key Features

### 1. Photo OCR System

**Production Mode:**
- Google Cloud Vision API
- Requires: `GOOGLE_APPLICATION_CREDENTIALS_JSON` env var
- Calls Vision API with scale photo
- Text detection + smart parsing

**Development Mode:**
- Mock OCR (no API calls)
- Returns realistic weights: 41-97 kg
- Confidence: 0.92-0.99
- Includes alternatives for testing

**Smart Weight Parsing:**
```typescript
// Handles LED display quirks
"974." → 97.4 kg
"97 4" → 97.4 kg
"97.40" → 97.4 kg

// Filters noise
"2024-01-15" → Ignored (date)
"08:30" → Ignored (time)
"Max: 400" → Ignored (capacity)

// Range validation
40-150 kg accepted
Outside range rejected
```

**Alternative Suggestions:**
- Returns top 3 matches
- User can select if primary is wrong
- Reduces friction from OCR errors

---

### 2. Streak System

**How Streaks Work:**
- Consecutive days with check-ins
- Calculated in `user_streaks` table
- Updated by `record_daily_weight_checkin()`

**Logic:**
```
Last check-in: Day N
Current check-in: Day N+1
→ Increment streak

Last check-in: Day N
Current check-in: Day N+2 or later
→ Reset streak to 1
```

**Grace Period:**
- None currently
- Strict daily check-in required
- **Potential improvement:** Allow 1-day skip

**Display:**
- Dashboard: Current streak number
- Progress page: Streak card with motivational message

---

### 3. Daily Tips System

**Categories:**
1. **Nutrition** (25 tips)
2. **Exercise** (25 tips)
3. **Mindfulness** (25 tips)
4. **Sleep** (25 tips)

**Rotation Logic:**
- Auto-rotates every 8 seconds
- Manual controls: Previous/Next buttons
- Persists selected tip in localStorage
- Resets on page reload (carousel restarts)

**Tip Selection:**
- Based on `day_number % tips_in_category`
- Same day always shows same tip
- Changes daily as user progresses

**Source:**
- `lib/tips-service.ts`
- Static array (no database)

---

### 4. Theme System

**Modes:**
- Light mode (default)
- Dark mode
- System preference sync

**Implementation:**
- `next-themes` library
- CSS variables in `globals.css`
- Persists to localStorage

**Components:**
- `ThemeToggle` button in header
- All components theme-aware
- Charts adapt to current theme

---

## Admin System

### Access Control

**RBAC (Role-Based Access Control):**
- Admin status stored in `admins` table
- Check via `public.is_admin(user_id)` PostgreSQL function
- Server-side guard: `lib/admin/guard.ts`
- Client-side check: `GET /api/admin/check`

**Making a User Admin:**
```sql
INSERT INTO public.admins (user_id, notes)
VALUES ('user-uuid-here', 'Admin user')
ON CONFLICT (user_id) DO NOTHING;
```

---

### Admin Pages

#### `/admin/users`
**Purpose:** Monitor all users and their progress

**Features:**
- User list with stats
- Search/filter users
- View user progress
- See streak information
- Challenge status

**Data Displayed:**
- Email, name
- Current day
- Current streak
- Total days completed
- Last check-in date

---

#### `/admin/applicants`
**Purpose:** Review nutritionist applications

**Features:**
- Application list with status
- Filter: pending/approved/rejected
- View full application details
- Download uploaded documents
  - Certifications
  - ID documents (signed URLs)
- Approve/reject actions
- Admin notes

**Document Viewing:**
- Supabase Storage signed URLs (15 min expiry)
- API: `GET /api/admin/applicants/[id]/files`
- Supports PDFs, images

---

### Admin RLS Bypass

**RLS Policies:**
- Most tables have Row Level Security enabled
- Admin policies allow full access
- Example: Admins can see all users' data

```sql
CREATE POLICY "Admins can view all data"
ON table_name FOR SELECT
USING (public.is_admin(auth.uid()));
```

---

## API Patterns

### Standard Structure

All API routes follow this pattern:

```typescript
// Use withHandler wrapper for error handling + request IDs
import { withHandler } from '@/lib/api/with-handler'
import { ok, fail } from '@/lib/api/responses'

export const POST = withHandler(async (req, { params }, requestId) => {
  // 1. Rate limiting
  const ip = ipFromRequest(req)
  const { success } = await limitByIp(ip, 'endpoint-name', 30)
  if (!success) {
    return NextResponse.json(
      fail('RATE_LIMITED', 'Too many requests'),
      { status: 429 }
    )
  }

  // 2. Input validation with Zod
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      fail('BAD_REQUEST', 'Invalid payload', parsed.error),
      { status: 400 }
    )
  }

  // 3. Business logic...
  // 4. Return standardized response
  return NextResponse.json(ok({ data: result }))
})
```

### Response Format

**Success:**
```typescript
{
  success: true,
  data: { ... },
  timestamp: "2025-11-24T10:30:00Z"
}
```

**Error:**
```typescript
{
  success: false,
  error: "ERROR_CODE",
  message: "User-friendly error message",
  details: { ... }, // Optional
  timestamp: "2025-11-24T10:30:00Z"
}
```

---

### Rate Limiting

**Implementation:**
- In-memory LRU cache (`lib/rate-limit.ts`)
- Per-IP and per-user limits
- Configurable windows (requests per N seconds)

**Example:**
```typescript
limitByIp(ip, 'weight-process', 30) // Max 30 requests/min
limitByUser(userId, 'tracking-save', 60) // Max 60 requests/hour
```

---

### Key Endpoints

#### `POST /api/tracking/save`
**Purpose:** Save weight entry after OCR confirmation

**Payload:**
```typescript
{
  weight_kg: number
  photo_url: string
  ocr_confidence: number
}
```

**Returns:**
```typescript
{
  dayNumber: number
  streak: number
  milestone: number
  newBadge: boolean
  badgeName?: string
  badgeIcon?: string
}
```

---

#### `POST /api/weight/process`
**Purpose:** OCR processing of scale photo

**Payload:**
```typescript
{
  photo_url: string
}
```

**Returns:**
```typescript
{
  weight_kg: number
  confidence: number
  alternatives: Array<{
    weight_kg: number
    confidence: number
  }>
}
```

---

#### `GET /api/settings/get`
**Purpose:** Load user settings

**Returns:**
```typescript
{
  setupCompleted: boolean
  settings: {
    weightUnit: 'kg' | 'lb'
    reminderTime: string // HH:MM:SS
    timezone: string
    locationPermission: string
    consentOcr: boolean
    consentStorage: boolean
    consentNutritionist: boolean
  }
}
```

---

#### `POST /api/settings/save`
**Purpose:** Save user settings (during onboarding)

**Payload:**
```typescript
{
  weightUnit: 'kg' | 'lb'
  reminderTime: string // HH:MM:SS
  timezone: string
  locationPermission: string
  consentOcr: boolean
  consentStorage: boolean
  consentNutritionist: boolean
  setupCompleted: boolean
}
```

---

## Considerations for New Rewards System

### Current State Analysis

**What We Have:**
- ✅ 4 milestone levels (7, 14, 21, 30 days)
- ✅ Badge system with icons
- ✅ Badge award logic in database function
- ✅ Toast notifications when badges earned
- ✅ Streak tracking
- ✅ Progress visualization

**What's Missing:**
- ❌ No badge display page
- ❌ No rewards redemption flow
- ❌ No tangible rewards beyond badges
- ❌ No long-term engagement after 30 days
- ❌ No social/sharing features
- ❌ No leaderboards or competition

---

### Potential Reward Types

#### 1. **Digital Rewards**
- **Achievement Badges:** Already implemented, could expand
- **Progress Reports:** PDF/email summaries
- **Certificates:** Completion certificates for milestones
- **Unlockable Content:** Advanced tips, recipes, workout plans
- **Premium Features:** Extended analytics, custom themes

#### 2. **Service Rewards**
- **Nutritionist Sessions:** Current reward (1 session)
- **Coach Check-ins:** Video/chat with health coach
- **Meal Planning:** Custom meal plans
- **Workout Programs:** Personalized fitness plans

#### 3. **Community Rewards**
- **Leaderboards:** Top streaks, most consistent
- **Social Sharing:** Share badges to social media
- **Challenges:** Group challenges with rewards
- **Mentorship:** Help new users, earn rewards

#### 4. **Point System**
- **Earn Points For:**
  - Daily check-ins (+10 pts)
  - Streak milestones (+bonus)
  - Weight loss progress (+variable)
  - Helping others (+5 pts)
- **Redeem Points For:**
  - Nutritionist sessions (500 pts)
  - Premium features (200 pts)
  - Physical rewards (1000 pts)
  - Donate to charity (any amount)

#### 5. **Physical Rewards**
- **Branded Merch:** T-shirts, water bottles, scale covers
- **Fitness Gear:** Resistance bands, yoga mats
- **Health Products:** Supplements, meal prep containers
- **Gift Cards:** Health food stores, fitness apps

---

### Technical Implementation Ideas

#### Database Extensions

**Add `user_points` table:**
```sql
CREATE TABLE user_points (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  points_balance INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Add `point_transactions` table:**
```sql
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  points INTEGER NOT NULL,
  transaction_type VARCHAR(50), -- earned, redeemed, expired
  reason VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Add `rewards_catalog` table:**
```sql
CREATE TABLE rewards_catalog (
  id UUID PRIMARY KEY,
  reward_type VARCHAR(50), -- badge, service, physical, digital
  reward_name VARCHAR(200),
  reward_description TEXT,
  point_cost INTEGER,
  stock_quantity INTEGER, -- NULL for unlimited
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Add `user_rewards` table:**
```sql
CREATE TABLE user_rewards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  reward_id UUID REFERENCES rewards_catalog(id),
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50), -- pending, fulfilled, cancelled
  fulfillment_notes TEXT
);
```

---

#### New API Endpoints

**Points System:**
- `GET /api/rewards/points` - Get user points balance
- `GET /api/rewards/points/history` - Transaction history
- `POST /api/rewards/points/earn` - Manual point grant (admin)

**Rewards Catalog:**
- `GET /api/rewards/catalog` - List available rewards
- `GET /api/rewards/catalog/[id]` - Reward details
- `POST /api/rewards/redeem` - Redeem reward with points

**Badges:**
- `GET /api/badges/user` - User's earned badges
- `GET /api/badges/all` - All available badges
- `POST /api/badges/share` - Generate shareable badge image

**Leaderboards:**
- `GET /api/leaderboards/streaks` - Top streaks
- `GET /api/leaderboards/weight-loss` - Most weight lost
- `GET /api/leaderboards/consistency` - Most check-ins

---

#### New UI Pages

**`/rewards`**
- Display earned badges
- Show points balance
- Browse rewards catalog
- Redeem rewards

**`/leaderboards`**
- View different leaderboards
- See own ranking
- Filter by timeframe (weekly, monthly, all-time)

**`/profile`**
- User stats overview
- Badge showcase
- Achievement history
- Share profile

---

### User Journey Updates

**Post-Milestone Experience:**
1. User completes 7-day milestone
2. Badge earned notification
3. **NEW:** "View Your Badge" CTA
4. Redirect to `/rewards`
5. See badge showcase + point balance
6. "Browse rewards to redeem" prompt
7. User explores catalog
8. Selects reward (e.g., nutritionist session)
9. Confirmation: "Spend 500 points?"
10. **NEW:** Create redemption record
11. Admin fulfillment workflow
12. User receives reward

**Continuous Engagement:**
- After 30 days: "Start a new challenge!"
- New milestones: 60 days, 90 days, 6 months, 1 year
- Seasonal challenges (New Year, Summer, etc.)
- Community challenges (group milestones)

---

### Gamification Enhancements

**Daily Bonuses:**
- Check in at streak milestones: +bonus points
- Check in on weekends: +5 bonus points
- Check in 30 days in a row: +100 bonus points

**Progress Multipliers:**
- Longer streaks = more points per check-in
- Day 1-7: 10 points/check-in
- Day 8-14: 15 points/check-in
- Day 15-21: 20 points/check-in
- Day 22+: 25 points/check-in

**Special Achievements:**
- "Early Bird": Check in before 7am (+5 pts)
- "Consistent Pro": Check in same time 7 days (+20 pts)
- "Weight Loss Warrior": Lose 5kg (+50 pts)
- "Mentor": Help 3 new users (+30 pts)

---

### Business Model Considerations

**Free Tier:**
- All core features
- Basic badges
- Limited rewards (lower tier)
- Community features

**Premium Tier ($9.99/mo):**
- Advanced analytics
- Priority nutritionist booking
- Exclusive badges
- Higher point multipliers
- Premium rewards access
- Ad-free experience

**Enterprise/B2B:**
- Company wellness programs
- Team challenges
- Admin dashboard for HR
- Custom branding
- Bulk nutritionist sessions

---

### Data to Track

**New Metrics:**
- Points earned/redeemed per user
- Most popular rewards
- Redemption conversion rate
- Average time to first redemption
- Badge completion rates
- Leaderboard engagement
- Social shares
- Referral conversions

**A/B Testing Opportunities:**
- Point values (how many per check-in?)
- Reward costs (optimal pricing)
- Badge designs (which drive engagement?)
- Notification timing (when to nudge?)

---

## Summary

WeightWin is a well-structured habit-building app with:
- ✅ Solid technical foundation (Next.js 14, Supabase, TypeScript)
- ✅ Complete user onboarding flow
- ✅ OCR-powered weight tracking
- ✅ Milestone-based progression (4 levels)
- ✅ Badge system (partially implemented)
- ✅ Admin area for oversight

**Opportunities for rewards system:**
- Expand badge showcase
- Add point/currency system
- Create rewards catalog
- Build redemption flow
- Add leaderboards and social features
- Extend milestones beyond 30 days
- Implement premium tier

**Key Files to Modify:**
- Database: `scripts/17_milestone_system_fixed.sql` (extend)
- API: New routes in `app/api/rewards/`
- UI: New pages in `app/rewards/`, `app/leaderboards/`
- Functions: New PostgreSQL functions for points/redemptions
- Components: Badge showcase, rewards catalog, leaderboard tables

---

**Ready for your new chat with Claude!** 🚀
