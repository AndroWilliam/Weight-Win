# Admin Area Setup Guide

This document describes the admin area implementation for WeightWin.

## Overview

The admin area provides secure access to:
- **Applicants**: Review nutritionist applications with document access
- **Users**: Monitor user progress, streaks, and challenge completion

## Security Model

### Role-Based Access Control (RBAC)

Admin access is controlled via the `public.admins` table and `public.is_admin()` function.

### Database Setup

Run the SQL migration script to set up the admin infrastructure:

```sql
-- Run in Supabase SQL Editor
-- File: scripts/10_admin_rbac.sql
```

This creates:
1. `public.admins` table (stores admin user IDs)
2. `public.is_admin(uid)` function (checks if user is admin)
3. RLS policies for admin bypass on application and weight tables
4. `admin_user_progress` view for user monitoring

## Making a User Admin

### Method 1: Direct SQL Insert (Recommended)

```sql
-- Get the user ID from Supabase Auth Dashboard or:
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Add user as admin
INSERT INTO public.admins (user_id, notes)
VALUES ('user-uuid-here', 'First admin user')
ON CONFLICT (user_id) DO NOTHING;
```

### Method 2: Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Run the insert query above with your user's UUID

## Accessing the Admin Area

### Prerequisites

1. User must be authenticated
2. User's UUID must exist in `public.admins` table

### Access

1. **Login** to WeightWin
2. Click your **profile avatar** (top right)
3. Click **Admin** menu item (only visible to admins)
4. Access `/admin/applicants` or `/admin/users`

## Features

### Applicants Page (`/admin/applicants`)

- **View all applications** submitted by nutritionists
- **Search** by name or email
- **Status filters**: Pending, Approved, Rejected, Reviewing
- **OCR status** for ID verification
- **Review drawer** with:
  - Personal information
  - Document viewing (signed URLs)
  - Status tracking

### Users Page (`/admin/users`)

- **Monitor user progress** in 7-day challenge
- **Track streaks**: Current and longest
- **Progress indicators**: Visual progress bars
- **Days to reward**: Highlight users close to completion
- **Challenge status**: Active, Completed, Not Started
- **Last check-in dates**
- **Search** by email

## API Endpoints

### Check Admin Status

```
GET /api/admin/check
Response: { isAdmin: boolean, success: boolean }
```

### Get Application Files

```
GET /api/admin/applicants/[id]/files
Response: { success: boolean, cvUrl: string|null, idUrl: string|null }
Authorization: Admin only (403 if not admin)
```

## Security Features

1. **Server-side guard**: All admin routes check `userIsAdmin()` before rendering
2. **API authorization**: File access requires admin status
3. **RLS policies**: Database-level security for data access
4. **Signed URLs**: Temporary (1-hour) access to applicant documents
5. **Client-side checks**: Profile menu only shows Admin for admins

## Testing

### Manual Testing

```bash
# Run existing tests
npm test

# Admin-specific tests
npm test __tests__/admin-guard.test.ts
npm test __tests__/admin-files-api.test.ts
```

### Smoke Test Checklist

- [ ] Non-admin visiting `/admin` redirects to home
- [ ] Admin sees "Admin" item in profile dropdown
- [ ] Applicants page loads with data
- [ ] Review drawer opens and shows documents
- [ ] Users page loads with progress data
- [ ] Search works on both tables
- [ ] Signed URLs open documents in new tab

## Troubleshooting

### "Unauthorized" Error

**Problem**: User gets redirected when accessing `/admin`

**Solutions**:
1. Check if user UUID is in `public.admins` table
2. Verify `is_admin()` function exists and works:
   ```sql
   SELECT public.is_admin('your-user-uuid');
   ```
3. Check Supabase connection and auth status

### Documents Not Loading

**Problem**: "Not available" for CV or ID documents

**Solutions**:
1. Verify `applicant-docs` bucket exists
2. Check file paths in `nutritionist_applications` table
3. Ensure RLS policies allow admin access to storage
4. Check browser console for errors

### Admin View Not Loading Data

**Problem**: Empty tables or SQL errors

**Solutions**:
1. Verify `admin_user_progress` view exists
2. Check for SQL syntax errors in view definition
3. Ensure proper JOINs on user tables
4. Run view query manually in SQL editor

## Future Enhancements

- [ ] Approve/Reject actions for applications
- [ ] Email notifications to applicants
- [ ] Bulk operations
- [ ] Export data to CSV
- [ ] Advanced filtering and sorting
- [ ] Admin audit logs
- [ ] Multiple admin roles (super admin, moderator, etc.)

## File Structure

```
app/
├── admin/
│   ├── layout.tsx          # Admin shell with guard
│   ├── page.tsx            # Redirects to /admin/applicants
│   ├── applicants/
│   │   └── page.tsx        # Applicants table (server component)
│   └── users/
│       └── page.tsx        # Users table (server component)
├── api/
│   └── admin/
│       ├── check/
│       │   └── route.ts    # Check admin status
│       └── applicants/
│           └── [id]/
│               └── files/
│                   └── route.ts  # Get signed URLs

components/
└── admin/
    ├── ApplicantsTable.tsx   # Client component with search
    ├── ReviewDrawer.tsx      # Document review UI
    └── UsersTable.tsx        # Progress monitoring UI

lib/
└── admin/
    └── guard.ts              # Server & client admin checks

scripts/
└── 10_admin_rbac.sql         # Database setup
```

## Support

For issues or questions, contact the development team or check the main README.

