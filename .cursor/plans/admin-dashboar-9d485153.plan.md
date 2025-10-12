<!-- 9d485153-87b3-426c-a029-e1b9d248e08a 50989253-40f5-42dc-8c4f-d66578ac7a6b -->
# Milestone-Based Streak System Implementation

## Overview

Transform the fixed 7-day challenge into a progressive milestone system (7→14→21→30 days) with dynamic progress visualization, badge collection, and enhanced theme toggle animations.

## Phase 1: Database Schema & Functions

### Create Milestone & Badge Tables

**File**: `scripts/16_milestone_system.sql`

Create new tables:

- `user_milestones`: Track user progress through milestones (7, 14, 21, 30 days)
  - `user_id`, `current_milestone` (7/14/21/30), `current_streak`, `total_days_completed`
  - `milestone_7_completed_at`, `milestone_14_completed_at`, `milestone_21_completed_at`, `milestone_30_completed_at`

- `milestone_badges`: Define available badges
  - `id`, `milestone_day` (7/14/21/30), `badge_name`, `badge_description`, `badge_icon_url`
  - Seed with: "Week Warrior" (7), "Fortnight Champion" (14), "Triple Week Legend" (21), "Monthly Master" (30)

- `user_badges`: Track awarded badges per user
  - `user_id`, `badge_id`, `earned_at`, `milestone_completed`

### Update `record_daily_weight_checkin` Function

**File**: `scripts/16_milestone_system.sql`

Modify the existing RPC function to:

1. Calculate `current_milestone` based on `total_days_completed` (1-7→7, 8-14→14, 15-21→21, 22-30→30)
2. Update `user_milestones` table instead of just tracking 7-day completion
3. Award badges automatically when milestones are reached (7, 14, 21, 30)
4. Return extended progress data: `current_day`, `current_milestone`, `days_in_milestone`, `completed_days_array`, `next_milestone`, `badges_earned`

### Create Helper Functions

**File**: `scripts/16_milestone_system.sql`

- `get_user_milestone_progress(p_user_id UUID)`: Returns current milestone status
- `get_user_badges(p_user_id UUID)`: Returns all badges earned by user
- `calculate_current_milestone(p_total_days INTEGER)`: Returns appropriate milestone (7/14/21/30)

## Phase 2: Frontend - Dashboard Updates

### Update Dashboard Title Logic

**File**: `app/dashboard/page.tsx` (lines 176-184)

Change from hardcoded "Day X of 7" to dynamic:

```typescript
const currentMilestone = challengeData?.currentMilestone || 7
const currentDayInMilestone = challengeData?.currentDay || 1
<h2>Day {currentDayInMilestone} of {currentMilestone}</h2>
```

Fetch milestone data from new RPC function `get_user_milestone_progress`.

### Dynamic Progress Pills Component

**File**: `components/streak-pills.tsx`

Transform from fixed 7 pills to dynamic milestone-based rendering:

- Accept props: `currentDay`, `currentMilestone`, `completedDaysArray`
- Render `currentMilestone` number of pills (7, 14, 21, or 30)
- Use grid layout with wrapping for larger milestone counts
- Styling: 
  - Completed days: green with checkmark
  - Current day: blue with pulse animation
  - Pending days: gray outline
- Add responsive design for mobile (2-3 rows if needed for 30 days)

### Enhanced Progress Bar

**File**: `app/dashboard/page.tsx` (lines 227-236)

Update progress calculation:

```typescript
const progressPercent = Math.min(100, Math.round((currentDayInMilestone / currentMilestone) * 100))
```

Add milestone indicator below progress bar showing completed milestones with icons (7✓, 14✓, 21, 30).

### Reward Countdown Updates

**File**: `components/reward-countdown.tsx`

Update to show next milestone reward:

- "Only X days until Week Warrior badge!" (for milestone 7)
- "Only X days until Fortnight Champion badge!" (for milestone 14)
- Dynamic messaging based on `currentMilestone` and `daysRemaining`

## Phase 3: Rewards/Badges Page

### Create Rewards Page

**File**: `app/rewards/page.tsx` (new file)

Build a dedicated page to display:

- **Header**: "Your Achievements" with total badges count
- **Badge Gallery**: Grid of milestone badges (4 cards)
  - Each card shows: badge icon, name, description, earned date (or "locked" state)
  - Locked badges appear grayed out with lock icon
  - Earned badges have celebration animation on page load
- **Progress Timeline**: Visual timeline showing 7→14→21→30 with checkmarks for completed milestones
- **Stats Section**: 
  - Total days tracked
  - Current streak
  - Longest streak
  - Next milestone countdown

Fetch data via new RPC: `get_user_badges`.

### Add Rewards Route to Navigation

**File**: `components/profile-dropdown.tsx` (line ~30)

Update `menuItems` array to make "Rewards" functional:

- Change `comingSoon: true` to `comingSoon: false`
- Set `href: '/rewards'`

## Phase 4: Enhanced Theme Toggle Animation

### Improve Theme Toggle Component

**File**: `components/theme-toggle.tsx`

Current implementation already has smooth animations (lines 26-42), but enhance:

1. Add spring animation using Framer Motion for the sliding thumb
2. Add scale pulse effect on click
3. Add glow effect around active icon
4. Slow down transition from 300ms to 500ms for more visible movement

Update dependencies:

```typescript
import { motion } from 'framer-motion'
```

Replace button with motion.button and add spring transition:

```typescript
<motion.button
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  <motion.span
    animate={{ x: isDark ? 28 : 2 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
```

Note: `framer-motion` is already installed (package.json line 58).

## Phase 5: Library Assessment & Optimization

### Current Libraries Analysis

The project already has excellent animation support:

- **framer-motion** (v12.23.18): For advanced animations ✓
- **tailwindcss-animate** (v1.0.7): For Tailwind-based animations ✓
- **lucide-react**: For consistent icons ✓
- **next-themes**: For theme management ✓

### Recommended Additions

**File**: `package.json`

Consider adding (optional, based on future needs):

1. **react-confetti**: For celebration effects when badges are earned
2. **react-spring**: Alternative animation library (if more complex physics needed)

Current stack is sufficient for this implementation - no critical additions needed.

## Phase 6: API Routes

### Create Milestone Progress API

**File**: `app/api/milestone/progress/route.ts` (new)

GET endpoint that calls `get_user_milestone_progress` RPC and returns formatted data.

### Create Badges API

**File**: `app/api/badges/route.ts` (new)

GET endpoint that calls `get_user_badges` RPC and returns user's badge collection.

## Phase 7: Testing & Polish

### Update Weight Check Flow

**File**: `app/api/weight/process/route.ts` (line ~80)

Ensure the weight processing API uses the updated `record_daily_weight_checkin` function and handles new milestone response data.

### Handle Badge Award Notifications

**File**: `app/dashboard/page.tsx`

Add toast notification using existing `sonner` library when user earns a new badge:

```typescript
import { toast } from 'sonner'

if (newBadgeEarned) {
  toast.success('🎉 New Badge Unlocked!', {
    description: `You earned the ${badgeName} badge!`
  })
}
```

### Mobile Responsiveness

Ensure all new components (especially 30-day pill grid and rewards page) are fully responsive with proper breakpoints.

## Implementation Order

1. Database schema & functions (Phase 1)
2. Dashboard title & progress logic updates (Phase 2.1-2.3)
3. Dynamic streak pills component (Phase 2.2)
4. Rewards page & navigation (Phase 3)
5. Theme toggle enhancements (Phase 4)
6. API routes (Phase 6)
7. Testing & polish (Phase 7)

## Critical Notes

- **Backward Compatibility**: Existing users with 7-day data will automatically migrate to milestone system (days 1-7 count toward first milestone)
- **Data Preservation**: All existing `weight_entries` and streak data remain intact
- **Gradual Rollout**: Current dashboard continues working during implementation; new features activate progressively
- **No Logic Destruction**: Existing `get_challenge_progress`, `record_daily_weight_checkin` functions are enhanced, not replaced

### To-dos

- [ ] Create database schema for milestones, badges, and user badges tables with RLS policies
- [ ] Modify record_daily_weight_checkin function to handle milestone progression and badge awards
- [ ] Create helper functions for milestone progress, badge retrieval, and milestone calculation
- [ ] Update dashboard page title to show dynamic 'Day X of Y' based on current milestone
- [ ] Transform StreakPills component to render dynamic number of pills (7/14/21/30) with responsive grid
- [ ] Update progress bar calculation and add milestone indicators below the bar
- [ ] Update RewardCountdown component to show next milestone badge information
- [ ] Create new rewards page with badge gallery, timeline, and stats section
- [ ] Update profile dropdown to make Rewards menu item functional
- [ ] Add Framer Motion spring animations to theme toggle for smoother visual transitions
- [ ] Create API routes for milestone progress and badges data
- [ ] Add toast notifications when users earn new badges
- [ ] Test and polish mobile responsiveness for 30-day pill grid and rewards page