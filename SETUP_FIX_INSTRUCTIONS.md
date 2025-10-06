# Fix User Setup & Settings Persistence

## Problem
- Settings are stored in localStorage (browser), which gets cleared
- Returning users are treated as new users and forced through setup again
- No database persistence for user preferences

## Solution
Store all settings in Supabase `user_settings` table with proper authentication flow.

---

## Step 1: Run SQL Migration in Supabase

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire content from `scripts/09_user_settings_table.sql`
3. Run the script
4. Verify tables created:
   - `user_settings` table
   - Functions: `upsert_user_settings()`, `has_completed_setup()`

---

## Step 2: Test the Database Functions

Run this in Supabase SQL Editor to test:

```sql
-- Test with your user ID (replace with actual ID)
SELECT * FROM upsert_user_settings(
  p_user_id := 'YOUR-USER-ID-HERE'::uuid,
  p_weight_unit := 'kg',
  p_reminder_time := '08:00:00',
  p_timezone := 'Africa/Cairo',
  p_location_permission := 'granted',
  p_consent_ocr := TRUE,
  p_consent_storage := TRUE,
  p_consent_nutritionist := TRUE
);

-- Check if setup completed
SELECT has_completed_setup('YOUR-USER-ID-HERE'::uuid);

-- View all settings
SELECT * FROM user_settings;
```

---

## Step 3: Update Frontend Pages (Next Steps)

The following files need to be updated to use the API routes instead of localStorage:

### Pages to Update:
1. `/app/setup/page.tsx` - Save to database via `/api/settings/save`
2. `/app/consent/page.tsx` - Update consents via `/api/settings/save`
3. `/app/commit/page.tsx` - Fetch from `/api/settings/get`
4. `/app/dashboard/page.tsx` - Check setup status, redirect if incomplete
5. `/app/page.tsx` (landing) - Check if user logged in + setup complete

### Authentication Flow:
```
User logs in with Google
    ↓
Check: has_completed_setup(user.id)?
    ↓
    ├─ YES → Redirect to /dashboard
    └─ NO  → Redirect to /setup
```

---

## Step 4: API Routes Created

✅ `/app/api/settings/save/route.ts` - Save user settings
✅ `/app/api/settings/get/route.ts` - Get user settings

---

## Step 5: Quick Test (Manual)

For immediate testing, manually insert settings for your user:

```sql
-- Replace with your actual user ID from auth.users
INSERT INTO user_settings (
  user_id,
  weight_unit,
  reminder_time,
  timezone,
  consent_ocr_processing,
  consent_data_storage,
  consent_share_nutritionist,
  setup_completed,
  setup_completed_at
)
VALUES (
  'YOUR-USER-ID-HERE'::uuid,
  'kg',
  '08:00:00',
  'Africa/Cairo',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET setup_completed = TRUE;
```

After running this, try logging in again. The app should detect you've completed setup.

---

## What's Next?

Would you like me to:
1. **Update all frontend pages** to use the database (recommended)
2. **Just do a quick manual fix** for your current user (fast test)
3. **Both** - manual fix first, then proper implementation

Let me know which approach you prefer!

