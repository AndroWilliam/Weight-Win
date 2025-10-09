<!-- 9d485153-87b3-426c-a029-e1b9d248e08a 57d54985-cd3e-42b4-a424-2d2b9f0116b9 -->
# Admin Dashboard KPI Redesign & Dynamic Data Implementation

## Overview

Redesign the admin dashboard to match the Figma design with proper spacing, context-aware KPI cards, and accurate dynamic data from the database.

## Database Changes (Run in Supabase SQL Editor)

### 1. Update Application Status Enum

**File**: `scripts/16_add_rejected_status.sql` (new)

- Add 'rejected' to the `application_status` enum
- Update existing policies to handle rejected status
- Ensure backward compatibility with existing data
```sql
-- Add 'rejected' to application_status enum
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'rejected';

-- Update any constraints or triggers if needed
```


### 2. Update KPI Functions for Context-Aware Metrics

**File**: `scripts/17_context_aware_kpis.sql` (new)

Create separate KPI functions for Applicants and Users contexts:

**For Applicants Tab:**

- `get_applicants_kpis()` returns:
  - `new_applicants`: Count of applications with status = 'new' (all time, until reviewed)
  - `rejected_applicants`: Count of applications with status = 'rejected' (all time or this week)
  - `approved_this_week`: Count of applications with status = 'approved' AND approved in last 7 days
  - `active_users_today`: Count of users who completed weigh-in today (from weight_entries WHERE DATE(recorded_at) = CURRENT_DATE)

**For Users Tab:**

- `get_users_kpis()` returns:
  - `new_users_this_week`: Count of users who started challenge in last 7 days
  - `users_in_progress`: Count of users with active challenge and < 7 weigh-ins
  - `completed_this_week`: Count of users who completed challenge (7+ weigh-ins) in last 7 days
  - `active_users_today`: Count of users who completed weigh-in today

Both functions must include `is_admin()` check for security.

## Frontend Changes

### 3. Create Context-Aware KPI Components

**File**: `components/admin/ApplicantsKPICards.tsx` (new)

- Create dedicated KPI component for Applicants tab
- Props: `newApplicants`, `rejectedApplicants`, `approvedThisWeek`, `activeUsersToday`
- Labels match Figma:
  - "New Applicants" (blue icon)
  - "Rejected Applicants" (red/orange icon - change from "In Review")
  - "Approved This Week" (green icon)
  - "Active Users Today" (indigo icon)
- Use same styling as current KPICards with mb-12 spacing

**File**: `components/admin/UsersKPICards.tsx` (new)

- Create dedicated KPI component for Users tab
- Props: `newUsersThisWeek`, `usersInProgress`, `completedThisWeek`, `activeUsersToday`
- Labels match Figma:
  - "New Applicants" → "New Users This Week" (blue icon)
  - "In Review" → "Users In Progress" (orange icon)
  - "Approved This Week" → "Completed This Week" (green icon)
  - "Active Users Today" (indigo icon)

### 4. Update Admin Pages

**File**: `app/admin/applicants/page.tsx`

- Replace `get_admin_kpis()` with `get_applicants_kpis()` RPC call
- Replace `<KPICards />` with `<ApplicantsKPICards />`
- Map KPI data correctly:
  - `new_applicants` → count where status = 'new'
  - `rejected_applicants` → count where status = 'rejected'
  - `approved_this_week` → count where status = 'approved' AND DATE(created_at) >= CURRENT_DATE - 7
  - `active_users_today` → count from weight_entries today
- Remove fallback static "247" value
- Handle errors with fallback to 0 values

**File**: `app/admin/users/page.tsx`

- Replace `get_admin_kpis()` with `get_users_kpis()` RPC call
- Replace `<KPICards />` with `<UsersKPICards />`
- Map KPI data correctly:
  - `new_users_this_week` → users who started challenge in last 7 days
  - `users_in_progress` → active challenges with < 7 weigh-ins
  - `completed_this_week` → users with 7+ weigh-ins in last 7 days
  - `active_users_today` → users who weighed in today
- Remove fallback calculation logic
- Handle errors with fallback to 0 values

### 5. Update Application Table to Handle Rejected Status

**File**: `components/admin/ApplicantsTable.tsx`

- Update status badge colors to include 'rejected' (red badge)
- Update status filter dropdown to include "Rejected" option
- Ensure rejected applications are displayed correctly

### 6. Remove Old Generic KPI Component

**File**: `components/admin/KPICards.tsx`

- Can be deleted after migration is complete (or kept for reference)

## Design Alignment

### Spacing (Already Done ✓)

- KPI cards have `mb-12` margin below them
- Proper separation from tables below

### Tab-Specific KPIs

- Applicants tab shows nutritionist-related metrics
- Users tab shows user challenge metrics
- Both show "Active Users Today" for consistency

### Dynamic Data

- All KPI values come from real database queries
- No hardcoded static values (like 247)
- Proper error handling with 0 fallbacks

## Testing Checklist

After implementation:

1. Run SQL scripts in Supabase SQL Editor in order (16, 17)
2. Verify 'rejected' status exists in application_status enum
3. Test `get_applicants_kpis()` function returns correct data
4. Test `get_users_kpis()` function returns correct data
5. Verify Applicants tab shows correct KPI labels and values
6. Verify Users tab shows correct KPI labels and values
7. Test that rejecting an application updates "Rejected Applicants" count
8. Test that approving an application updates "Approved This Week" count
9. Verify "Active Users Today" shows 0 when no users weighed in today
10. Verify proper spacing between KPI cards and tables

## SQL Scripts Summary

**Script 16: Add Rejected Status**

```sql
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'rejected';
```

**Script 17: Context-Aware KPI Functions**

- `get_applicants_kpis()` - returns nutritionist application metrics
- `get_users_kpis()` - returns user challenge metrics
- Both include admin authorization checks
- Grant execute permissions to authenticated users

### To-dos

- [ ] Create SQL script to add 'rejected' to application_status enum
- [ ] Create SQL script for context-aware KPI functions (applicants and users)
- [ ] Create ApplicantsKPICards component with correct labels and icons
- [ ] Create UsersKPICards component with correct labels and icons
- [ ] Update applicants page to use get_applicants_kpis() and ApplicantsKPICards
- [ ] Update users page to use get_users_kpis() and UsersKPICards
- [ ] Update ApplicantsTable to handle rejected status with red badge
- [ ] Test all KPI calculations and verify design matches Figma