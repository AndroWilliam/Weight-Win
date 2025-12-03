# Phase 4: BOLD Soccer Campaign - Testing Guide

## Overview
This document provides a comprehensive testing checklist for the BOLD Soccer Campaign implementation completed in Phases 1-3. Use this guide to systematically verify all features before production deployment.

## Quick Start
1. Set `NEXT_PUBLIC_BOLD_CAMPAIGN_ENABLED=true` in your environment
2. Deploy to a staging environment
3. Follow each test section below
4. Document any issues found
5. Verify fixes before production deployment

---

## TEST 1: FEATURE FLAG CONTROL

### Purpose
Verify the campaign can be enabled/disabled via environment variable without code changes.

### Setup
- Access to Vercel dashboard or environment configuration
- Ability to redeploy application

### Test Steps

**Test 1.1: Campaign Enabled**
- [ ] Set `NEXT_PUBLIC_BOLD_CAMPAIGN_ENABLED=true`
- [ ] Redeploy application
- [ ] Visit landing page (/)
- [ ] **Expected**: BOLD Soccer banner is visible between hero and "Why WeightWin works" section
- [ ] Complete Day 7 of challenge
- [ ] **Expected**: Phone collection modal appears after weight saved

**Test 1.2: Campaign Disabled**
- [ ] Set `NEXT_PUBLIC_BOLD_CAMPAIGN_ENABLED=false`
- [ ] Redeploy application
- [ ] Visit landing page (/)
- [ ] **Expected**: BOLD Soccer banner does NOT appear
- [ ] **Expected**: Landing page looks normal without banner
- [ ] Complete Day 7 of challenge
- [ ] **Expected**: Phone modal does NOT appear
- [ ] **Expected**: Redirected directly to dashboard

**Test 1.3: Re-enable Campaign**
- [ ] Set `NEXT_PUBLIC_BOLD_CAMPAIGN_ENABLED=true`
- [ ] Redeploy application
- [ ] Verify banner returns
- [ ] Verify phone modal works again

### Success Criteria
- ✅ Banner visibility controlled by environment variable
- ✅ Phone modal controlled by environment variable
- ✅ No code changes required to toggle feature
- ✅ Quick rollback possible (2-3 minute redeploy)

---

## TEST 2: PROMOTIONAL BANNER

### Desktop Testing (≥768px)

**Visual Appearance**
- [ ] Banner appears between hero section and "Why WeightWin works"
- [ ] Gold/orange gradient (#F59E0B → #EF4444) renders correctly
- [ ] Soccer ball emoji (⚽) visible and rotating slowly (20s loop)
- [ ] "LIMITED TIME OFFER!" text in bold black
- [ ] Body text readable and properly formatted
- [ ] "⏰ Campaign Active" badge displays with yellow background
- [ ] "Let's Play!" button visible with animation

**Animations**
- [ ] Soccer ball rotates smoothly (no jank)
- [ ] Button pulses smoothly (scale animation)
- [ ] No layout shifts during animation
- [ ] Animations don't cause performance issues

**Button Functionality - New User**
- [ ] Clear browser cookies/storage
- [ ] Visit landing page
- [ ] Click "Let's Play!" button
- [ ] **Expected**: Redirect to `/preview/weight-check`
- [ ] **Expected**: Demo flow starts

**Button Functionality - Returning Demo User**
- [ ] Complete entire demo flow
- [ ] Return to landing page (still not logged in)
- [ ] Click "Let's Play!" button
- [ ] **Expected**: Redirect to `/preview-signup?returning=true`
- [ ] **Expected**: "Welcome Back!" message with saved data

**Button Functionality - Authenticated User**
- [ ] Login with existing account
- [ ] Visit landing page
- [ ] Click "Let's Play!" button
- [ ] **Expected**: Redirect to `/dashboard`
- [ ] **Expected**: Dashboard loads normally

### Mobile Testing (<768px)

**Visual Appearance**
- [ ] Banner full-width with proper padding
- [ ] Soccer ball icon centered
- [ ] Text properly wrapped and readable
- [ ] Button full-width and easy to tap
- [ ] Badge wraps appropriately
- [ ] No horizontal scroll

**Touch Targets**
- [ ] Button minimum 44x44px (iOS/Android standard)
- [ ] Easy to tap without mis-taps
- [ ] Adequate spacing around interactive elements

**Performance**
- [ ] Animations smooth on mobile devices
- [ ] No lag during scroll
- [ ] Page loads quickly

**Browser Testing**
- [ ] Chrome (Android)
- [ ] Safari (iOS)
- [ ] Firefox (Android)
- [ ] Samsung Internet

### Success Criteria
- ✅ Banner displays correctly on all screen sizes
- ✅ Button routing logic matches "Start Your Journey" button
- ✅ Animations smooth on all devices
- ✅ No accessibility issues (good contrast, readable text)

---

## TEST 3: PHONE COLLECTION FLOW

### Preparation
1. Create test user or use existing at Day 6
2. Complete Days 1-6 normally
3. Ready to complete Day 7

### Day 7 Completion Flow

**Initial Trigger**
- [ ] Complete Day 7 weight check-in
- [ ] **Expected**: Success message shows briefly (2 seconds)
- [ ] **Expected**: Phone modal appears AFTER success message
- [ ] **Expected**: Modal appears BEFORE badge celebration
- [ ] **Expected**: Background dimmed/blurred

**Modal Visual Verification**
- [ ] Gold/orange gradient header (#F59E0B → #EF4444)
- [ ] Celebration emoji 🎉 displays
- [ ] Title "Congratulations!" in bold black
- [ ] Subtitle "You completed the 7-day challenge!"
- [ ] Message about BOLD Soccer 30% discount
- [ ] Phone input field with "+20" pre-filled
- [ ] Placeholder shows "+20XXXXXXXXXX"
- [ ] Format hint below input: "+20 followed by 9 digits"
- [ ] Two buttons: "Submit" (gold gradient) and "Skip for now" (gray)

**AutoFocus Test**
- [ ] Modal opens
- [ ] **Expected**: Phone input automatically focused
- [ ] **Expected**: Keyboard appears on mobile
- [ ] **Expected**: Can start typing immediately

### Phone Number Validation

**Invalid Input Tests**
Test each of these invalid inputs:

1. **Too Short**
   - [ ] Enter: `123`
   - [ ] Click Submit
   - [ ] **Expected**: Error message "Invalid phone format. Must be +20 followed by 9 digits."

2. **Wrong Format**
   - [ ] Enter: `01234567890`
   - [ ] Click Submit
   - [ ] **Expected**: Error message displayed

3. **Missing +20 Prefix**
   - [ ] Try to enter number without +20
   - [ ] **Expected**: Input automatically resets to "+20"

4. **Too Short After +20**
   - [ ] Enter: `+20123`
   - [ ] Click Submit
   - [ ] **Expected**: Error message displayed

5. **Too Long**
   - [ ] Try to enter: `+2012345678901` (13 characters)
   - [ ] **Expected**: Input prevents typing beyond 12 characters

6. **Non-Numeric Characters**
   - [ ] Try to enter: `+20123abc7890`
   - [ ] **Expected**: Only numbers allowed after +20

**Valid Input Test**
- [ ] Enter: `+201234567890` (12 characters total)
- [ ] Click Submit
- [ ] **Expected**: Button shows loading state
- [ ] **Expected**: Success message appears
- [ ] **Expected**: "✅ Phone Number Submitted!"
- [ ] **Expected**: "We'll contact you soon..." message
- [ ] **Expected**: Modal closes after 2 seconds
- [ ] **Expected**: Badge celebration modal appears
- [ ] **Expected**: Can continue to dashboard

**Database Verification**
- [ ] Open Supabase dashboard
- [ ] Navigate to `user_settings` table
- [ ] Find test user's record
- [ ] **Expected**: `phone_number` column contains `+201234567890`
- [ ] **Expected**: Format exactly as entered

### Skip Flow Testing

**Skip Initiation**
- [ ] Complete Day 7
- [ ] Phone modal appears
- [ ] Click "Skip for now" button
- [ ] **Expected**: Warning modal appears
- [ ] **Expected**: First modal still visible behind warning

**Warning Modal Verification**
- [ ] Warning emoji ⚠️ displays
- [ ] Title "Wait!" in orange/amber color
- [ ] Warning message about not being able to redeem reward
- [ ] Two buttons: "Enter Phone Number" (yellow) and "I Understand, Skip" (gray)

**Return to Phone Input**
- [ ] Click "Enter Phone Number" button
- [ ] **Expected**: Warning modal closes
- [ ] **Expected**: Phone input modal returns
- [ ] **Expected**: Input field cleared/reset to "+20"
- [ ] **Expected**: Can now enter phone number normally

**Confirm Skip**
- [ ] Complete Day 7 again (or use new test user)
- [ ] Phone modal appears
- [ ] Click "Skip for now"
- [ ] Warning modal appears
- [ ] Click "I Understand, Skip"
- [ ] **Expected**: Both modals close
- [ ] **Expected**: Badge celebration modal appears immediately
- [ ] **Expected**: Can continue normally to dashboard
- [ ] **Expected**: Phone number NOT saved in database

### ESC Key Handler

**ESC During Phone Input**
- [ ] Phone modal open
- [ ] Press ESC key
- [ ] **Expected**: Warning modal appears (same as clicking "Skip for now")
- [ ] Press ESC again
- [ ] **Expected**: No effect (warning modal stays open)

**ESC During Success State**
- [ ] Submit valid phone
- [ ] Success message shows
- [ ] Press ESC key
- [ ] **Expected**: No effect (modal closes automatically after 2 seconds)

### Mobile-Specific Testing

**iOS Safari**
- [ ] Modal centered and readable
- [ ] Phone keyboard opens automatically
- [ ] Keyboard doesn't overlap input
- [ ] Buttons easy to tap
- [ ] Can dismiss keyboard if needed
- [ ] Modal persists through keyboard open/close

**Android Chrome**
- [ ] Same as iOS tests above
- [ ] Back button handling: does NOT close modal
- [ ] Proper keyboard layout

### Success Criteria
- ✅ Phone modal appears only on Day 7 completion
- ✅ Modal blocks badge celebration until dismissed
- ✅ Validation prevents invalid phone numbers
- ✅ Valid phones saved correctly to database
- ✅ Skip flow works with proper warning
- ✅ Mobile UX smooth and intuitive
- ✅ ESC key handler works as expected

---

## TEST 4: ADMIN DASHBOARD EXPORT

### Access Control

**Non-Admin User**
- [ ] Login as regular user (non-admin)
- [ ] Try to access `/admin/users`
- [ ] **Expected**: Redirected or "Unauthorized" message
- [ ] Try to access export endpoint directly:
  ```
  POST https://your-domain.com/api/admin/export/users
  ```
- [ ] **Expected**: 403 Forbidden error

**Admin User**
- [ ] Login as admin user
- [ ] Access `/admin/users`
- [ ] **Expected**: Dashboard loads successfully
- [ ] **Expected**: Can see list of users

### Export Button Visibility

**Location Verification**
- [ ] On `/admin/users` page
- [ ] **Expected**: "Export Users" button visible in header
- [ ] **Expected**: Button positioned at end of toolbar row
- [ ] **Expected**: Document icon (📄) visible next to text
- [ ] **Expected**: Button opposite "All Users" filter

**Responsive Layout**
- [ ] Desktop (≥1024px): Button right-aligned, inline with filters
- [ ] Tablet (768-1023px): Button full-width below filters
- [ ] Mobile (<768px): Button full-width, easy to tap

**Disabled State**
- [ ] Search for non-existent user (no results)
- [ ] **Expected**: Export button disabled
- [ ] **Expected**: Button grayed out
- [ ] Hover: no click effect
- [ ] Clear search
- [ ] **Expected**: Button enabled again

### Export Functionality

**Basic Export - All Users**
- [ ] Navigate to `/admin/users`
- [ ] Don't apply any filters
- [ ] Click "Export Users" button
- [ ] **Expected**: Button shows loading state "Exporting..."
- [ ] **Expected**: Loader icon spins
- [ ] **Expected**: Button disabled during export
- [ ] **Expected**: Excel file downloads automatically
- [ ] **Expected**: Filename format: `users-export-YYYY-MM-DD.xlsx`

**Excel File Verification**
- [ ] Open downloaded Excel file
- [ ] **Header Row**:
  - [ ] Bold white text on indigo background
  - [ ] Columns: Name | Email | Phone Number | Days Completed | BOLD Status
  - [ ] Proper column widths

- [ ] **Data Rows**:
  - [ ] All currently visible users included
  - [ ] Names extracted correctly
  - [ ] Emails formatted correctly
  - [ ] Phone numbers in +20XXXXXXXXX format or "Not provided"
  - [ ] Days Completed shows numbers 0-7
  - [ ] BOLD Status shows "Eligible" or "Not Eligible"

- [ ] **BOLD Highlighting**:
  - [ ] Users with 7+ days + phone number have GREEN background
  - [ ] Green is light and readable (not too dark)
  - [ ] Text on green background is bold and dark green
  - [ ] Non-eligible users have white/normal background
  - [ ] Easy to identify eligible users at a glance

- [ ] **Formatting**:
  - [ ] All cells have borders
  - [ ] Days Completed and BOLD Status columns centered
  - [ ] Professional appearance
  - [ ] Opens correctly in Microsoft Excel
  - [ ] Opens correctly in Google Sheets
  - [ ] Opens correctly in Apple Numbers

**Filtered Export**
- [ ] Use search box: enter "william"
- [ ] **Expected**: Table filters to matching users
- [ ] Click "Export Users"
- [ ] **Expected**: Excel contains ONLY filtered users
- [ ] **Expected**: No users outside filter included
- [ ] Clear filter and verify full export works again

**Search + Export**
- [ ] Search for specific domain: "@gmail.com"
- [ ] **Expected**: Only Gmail users visible
- [ ] Export
- [ ] Verify: Excel contains only Gmail users

**Large Dataset Test**
- [ ] If possible, create 20+ test users
- [ ] Mix of eligible and non-eligible
- [ ] Export all
- [ ] **Expected**: Export completes in < 5 seconds
- [ ] **Expected**: All 20+ users in Excel
- [ ] **Expected**: Highlighting still works correctly
- [ ] **Expected**: File opens without issues

### Success Notification

**After Successful Export**
- [ ] Toast notification appears
- [ ] **Expected**: "Export successful!"
- [ ] **Expected**: Message shows count: "Exported X users to Excel"
- [ ] **Expected**: Toast auto-dismisses after few seconds

**After Export Failure**
- [ ] Temporarily break API (if possible in dev)
- [ ] Try to export
- [ ] **Expected**: Toast shows error
- [ ] **Expected**: "Failed to export users"
- [ ] **Expected**: "Please try again" message
- [ ] **Expected**: Button returns to normal state

### Browser Compatibility

**Download Behavior**
- [ ] Test in Chrome: File downloads to Downloads folder
- [ ] Test in Safari: Download prompt or auto-download
- [ ] Test in Firefox: Download works correctly
- [ ] Test in Edge: Download works correctly

### Success Criteria
- ✅ Only admins can access export
- ✅ Export respects current filters/search
- ✅ Excel file formatted professionally
- ✅ BOLD participants clearly highlighted green
- ✅ Export works with large datasets
- ✅ Proper error handling and user feedback

---

## TEST 5: USER INFORMATION SIDEBAR

### Opening Sidebar

**Desktop**
- [ ] Navigate to `/admin/users`
- [ ] Click "⋮" (three dots) or "Actions" on any user row
- [ ] **Expected**: Sidebar slides in from right
- [ ] **Expected**: Backdrop dims page
- [ ] **Expected**: Can still see main table (semi-transparent backdrop)

**Mobile**
- [ ] Same as desktop
- [ ] **Expected**: Sidebar takes full width
- [ ] **Expected**: Easy to dismiss

### User Information Section

**Location**
- [ ] Section appears at TOP of sidebar
- [ ] **Expected**: Indigo background/border
- [ ] **Expected**: "USER INFORMATION" header in indigo text
- [ ] **Expected**: Clear visual distinction from other sections

**Fields Display - User WITH Phone**
- [ ] Click Actions on user who completed 7 days + submitted phone
- [ ] Verify each field:
  - [ ] **Name**: Displays user's name or email username
  - [ ] **Email**: Full email address
  - [ ] **User ID**: Truncated UUID with "..." (e.g., "276166bc-8dbd-4051...")
  - [ ] **Phone Number**: Shows `+20XXXXXXXXX` format
  - [ ] **"NEW" Badge**: Yellow badge next to Phone Number label
  - [ ] **Days Completed**: Shows "7/7 ✓" in green with checkmark
  - [ ] **Current Streak**: Shows "X days 🔥" with fire emoji (if > 0)
  - [ ] **Last Check-in**: Formatted date (e.g., "12/2/2025")

**Fields Display - User WITHOUT Phone**
- [ ] Click Actions on user without phone number
- [ ] **Phone Number**: Shows "Not provided" in gray text
- [ ] **No "NEW" badge displayed**
- [ ] Other fields display normally

**Copy to Clipboard - Name**
- [ ] Click copy icon next to Name
- [ ] **Expected**: Icon changes to green checkmark (✓)
- [ ] **Expected**: Toast notification: "Name copied successfully"
- [ ] **Expected**: Icon reverts to copy icon after 2 seconds
- [ ] Paste somewhere (Ctrl+V / Cmd+V)
- [ ] **Expected**: Name value pasted correctly

**Copy to Clipboard - Email**
- [ ] Click copy icon next to Email
- [ ] Same verification as Name above
- [ ] **Expected**: Full email copied

**Copy to Clipboard - Phone Number**
- [ ] Click copy icon next to Phone Number (if present)
- [ ] Same verification as above
- [ ] **Expected**: Phone copied in +20XXXXXXXXX format
- [ ] User without phone: No copy icon shown

### BOLD Soccer Campaign Status

**Eligible User (7 days + phone)**
- [ ] Section has green background
- [ ] **Expected**: "🎁 BOLD SOCCER CAMPAIGN" header in green
- [ ] **Expected**: Message: "This user completed 7 days and submitted their phone number..."
- [ ] **Expected**: Reference to table export button

**Not Eligible - Incomplete Days**
- [ ] User with < 7 days
- [ ] Section has muted/gray background
- [ ] **Expected**: "🎁 BOLD SOCCER CAMPAIGN" header in gray
- [ ] **Expected**: Message: "User needs to complete 7 days to be eligible."

**Not Eligible - No Phone**
- [ ] User with 7 days but no phone
- [ ] Section has muted/gray background
- [ ] **Expected**: Message: "User hasn't submitted phone number yet."

### Existing Functionality Verification

**Admin Access Toggle**
- [ ] Toggle Admin access switch
- [ ] **Expected**: Switch animates
- [ ] **Expected**: Toast confirmation
- [ ] **Expected**: Works as before (not broken)

**Manage Invitations Toggle**
- [ ] Toggle Manage invitations switch
- [ ] Same verification as Admin access

**Password Reset**
- [ ] Click "Send email" button
- [ ] **Expected**: Button shows loading
- [ ] **Expected**: Success toast
- [ ] **Expected**: "Last sent" timestamp updates
- [ ] **Expected**: Works as before

**Admin Summary**
- [ ] Verify section still displays
- [ ] Shows current permissions correctly

### Mobile Testing

**Sidebar Behavior**
- [ ] Test on mobile device
- [ ] Sidebar full-width
- [ ] Can scroll entire sidebar content
- [ ] User Information section visible at top
- [ ] All text readable
- [ ] Copy buttons easy to tap
- [ ] Can close sidebar easily

### Success Criteria
- ✅ User Information section prominent at top
- ✅ All fields display correctly
- ✅ Copy to clipboard works for Name, Email, Phone
- ✅ BOLD status clearly indicated
- ✅ Existing admin features still work
- ✅ Mobile responsive and usable

---

## TEST 6: EDGE CASES & ERROR HANDLING

### Database Connection Issues

**Phone Submission During Outage**
- [ ] If possible, temporarily break database connection
- [ ] Try to submit phone number
- [ ] **Expected**: Error toast appears
- [ ] **Expected**: "Failed to save phone number"
- [ ] **Expected**: Modal stays open (can retry)
- [ ] Restore connection
- [ ] Click Submit again
- [ ] **Expected**: Successful save

### Duplicate Phone Submission

**Same User, Day 7 Again**
- [ ] User who already submitted phone on Day 7
- [ ] Complete Day 7 again (if possible, or test with new challenge)
- [ ] **Expected**: Phone modal should NOT appear
- [ ] **Expected**: Goes directly to badge celebration
- [ ] OR if modal appears, submission handles gracefully (no error)

### Network Issues

**Slow Connection - Phone Submit**
- [ ] Throttle network to Slow 3G (Chrome DevTools)
- [ ] Submit valid phone number
- [ ] **Expected**: Loading state shows longer
- [ ] **Expected**: Eventually completes successfully
- [ ] **Expected**: No timeout errors
- [ ] **Expected**: Success message appears when done

**Slow Connection - Export**
- [ ] Same throttled network
- [ ] Export users
- [ ] **Expected**: Loading state persists
- [ ] **Expected**: Eventually downloads file
- [ ] **Expected**: No timeout errors

### Browser Errors

**JavaScript Disabled**
- [ ] Disable JavaScript in browser
- [ ] Visit landing page
- [ ] **Expected**: Page still renders (static content visible)
- [ ] **Expected**: Banner visible but not interactive
- [ ] Re-enable JavaScript

**Ad Blockers**
- [ ] Enable ad blocker
- [ ] Visit landing page
- [ ] **Expected**: Banner still visible
- [ ] **Expected**: Not blocked as advertisement
- [ ] **Expected**: All functionality works

### Concurrent Users

**Multiple Admins Exporting**
- [ ] Two admin users logged in
- [ ] Both click export simultaneously
- [ ] **Expected**: Both get their own Excel files
- [ ] **Expected**: No conflicts or errors

### Success Criteria
- ✅ Graceful error handling for database issues
- ✅ Duplicate submissions handled correctly
- ✅ Works on slow connections
- ✅ Proper feedback on all errors
- ✅ No data corruption or loss

---

## TEST 7: PERFORMANCE & OPTIMIZATION

### Page Load Performance

**Landing Page**
- [ ] Open Chrome DevTools → Performance tab
- [ ] Hard refresh landing page (Ctrl+Shift+R)
- [ ] Measure time to interactive
- [ ] **Expected**: Page interactive in < 3 seconds
- [ ] **Expected**: Banner appears immediately (no FOUC)
- [ ] **Expected**: No layout shifts

**Admin Dashboard**
- [ ] Navigate to `/admin/users`
- [ ] Measure initial load
- [ ] **Expected**: Users table loads in < 2 seconds
- [ ] **Expected**: Export button visible immediately

### Animation Performance

**Banner Animations**
- [ ] Record performance while viewing banner
- [ ] **Expected**: 60 FPS (16.67ms per frame)
- [ ] **Expected**: No janky animations
- [ ] **Expected**: Low CPU usage
- [ ] Test on older device if possible

**Modal Animations**
- [ ] Open phone modal
- [ ] **Expected**: Smooth slide-in animation
- [ ] **Expected**: No frame drops
- [ ] Close modal
- [ ] **Expected**: Smooth slide-out

### Database Query Performance

**Phone Number Save**
- [ ] Open Supabase dashboard → Logs
- [ ] Submit phone number
- [ ] Check query time
- [ ] **Expected**: < 100ms for insert query
- [ ] **Expected**: Single query (not multiple)

**Export Query**
- [ ] Export users
- [ ] Check Supabase logs
- [ ] **Expected**: < 500ms for 100 users
- [ ] **Expected**: Efficient query (no N+1 issues)
- [ ] **Expected**: Proper indexes used

### Memory Leaks

**Long Session Test**
- [ ] Keep admin dashboard open for 30+ minutes
- [ ] Perform various actions (filter, export, open sidebars)
- [ ] Check Chrome DevTools → Memory
- [ ] **Expected**: No significant memory increase
- [ ] **Expected**: Event listeners cleaned up

### Mobile Performance

**Low-End Device**
- [ ] Test on older Android device (if available)
- [ ] Banner animations smooth
- [ ] Modal interactions responsive
- [ ] Export works without crashing

### Success Criteria
- ✅ Fast page loads (< 3 seconds)
- ✅ Smooth animations (60 FPS)
- ✅ Efficient database queries
- ✅ No memory leaks
- ✅ Good performance on low-end devices

---

## TEST 8: ACCESSIBILITY

### Keyboard Navigation

**Landing Page Banner**
- [ ] Tab to "Let's Play!" button
- [ ] **Expected**: Focus indicator visible
- [ ] Press Enter
- [ ] **Expected**: Button activates

**Phone Modal**
- [ ] Modal opens
- [ ] **Expected**: Focus automatically in input field
- [ ] Tab to Submit button
- [ ] **Expected**: Focus indicator visible
- [ ] Tab to Skip button
- [ ] **Expected**: Can navigate all interactive elements
- [ ] Shift+Tab to go backwards
- [ ] **Expected**: Focus stays within modal

**Export Button**
- [ ] Tab to Export button in admin header
- [ ] **Expected**: Focus visible
- [ ] Press Enter
- [ ] **Expected**: Export starts

### Screen Reader Testing

**Banner Announcement**
- [ ] Enable screen reader (VoiceOver/NVDA)
- [ ] Navigate to banner
- [ ] **Expected**: Reads promotion text clearly
- [ ] **Expected**: Announces button as clickable

**Phone Modal Announcement**
- [ ] Open phone modal
- [ ] **Expected**: Announces dialog title "Congratulations!"
- [ ] **Expected**: Reads description about discount
- [ ] **Expected**: Input field labeled as "Phone Number"
- [ ] **Expected**: Format hint read aloud

**Error Announcements**
- [ ] Submit invalid phone
- [ ] **Expected**: Error message announced
- [ ] **Expected**: User knows what's wrong

### Color Contrast

**Check WCAG AA Compliance**
- [ ] Banner text on gradient background: Ratio ≥ 4.5:1
- [ ] Phone modal black text: Ratio ≥ 4.5:1
- [ ] Button text readable
- [ ] Error messages readable
- [ ] Use contrast checker tool if needed

### Success Criteria
- ✅ Full keyboard navigation support
- ✅ Screen reader friendly
- ✅ WCAG AA contrast compliance
- ✅ All interactive elements accessible

---

## ROLLBACK PROCEDURES

### Option 1: Feature Flag Disable (FASTEST - 2-3 minutes)

**When to Use**: Minor issues, want to disable quickly

**Steps**:
1. Go to Vercel dashboard
2. Navigate to Environment Variables
3. Set `NEXT_PUBLIC_BOLD_CAMPAIGN_ENABLED=false`
4. Trigger redeployment
5. Verify banner and phone modal disappear

**Verification**:
- [ ] Banner not visible on landing page
- [ ] Phone modal doesn't appear on Day 7
- [ ] Admin export still works (for existing data)
- [ ] Rest of site works normally

### Option 2: Git Revert (3-5 minutes)

**When to Use**: Critical bugs in implementation

**Steps**:
```bash
# Find commit before Phase 1
git log --oneline | grep "Phase"

# Revert to commit before changes
git revert <commit-hash>
git push origin main

# Vercel auto-deploys
```

**Verification**:
- [ ] All Phase 1-4 changes removed
- [ ] Site returns to pre-campaign state
- [ ] No errors or warnings

### Option 3: Database Rollback (If Needed)

**When to Use**: Database schema issues

**Steps**:
```sql
-- Run in Supabase SQL Editor:
ALTER TABLE user_settings DROP COLUMN IF EXISTS phone_number;
```

**Verification**:
- [ ] Column removed successfully
- [ ] No orphaned data
- [ ] Applications still work

### Emergency Contact

**If all rollbacks fail**:
1. Contact: [Your DevOps/Platform team]
2. Escalate to: [Senior developer]
3. Check status: [Status page URL]

---

## FINAL TESTING REPORT TEMPLATE

### Test Execution Summary

**Tested By**: [Your Name]
**Date**: [Date]
**Environment**: [Staging/Production]
**Build Version**: [Commit hash]

### Test Results Overview

| Test Section | Total Tests | Passed | Failed | Skipped |
|--------------|------------|---------|--------|---------|
| Feature Flag | X | X | X | X |
| Promotional Banner | X | X | X | X |
| Phone Collection | X | X | X | X |
| Admin Export | X | X | X | X |
| User Info Sidebar | X | X | X | X |
| Edge Cases | X | X | X | X |
| Performance | X | X | X | X |
| Accessibility | X | X | X | X |
| **TOTAL** | **X** | **X** | **X** | **X** |

### Critical Issues Found

**Issue #1**: [Title]
- **Severity**: Critical/High/Medium/Low
- **Description**: [What's broken]
- **Steps to Reproduce**: [How to see it]
- **Expected**: [What should happen]
- **Actual**: [What actually happens]
- **Impact**: [Who/what is affected]
- **Status**: Open/Fixed/Deferred

*[Repeat for each issue]*

### Browser Compatibility Matrix

| Browser | Version | Desktop | Mobile | Status | Notes |
|---------|---------|---------|--------|--------|-------|
| Chrome | 120+ | ✅ | ✅ | Pass | - |
| Safari | 17+ | ✅ | ✅ | Pass | - |
| Firefox | 120+ | ✅ | ⚠️ | Partial | [Issue] |
| Edge | 120+ | ✅ | - | Pass | - |

### Performance Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Landing Page Load | < 3s | X.Xs | ✅/❌ |
| Admin Dashboard Load | < 2s | X.Xs | ✅/❌ |
| Export Generation (100 users) | < 5s | X.Xs | ✅/❌ |
| Phone Save Query | < 100ms | Xms | ✅/❌ |
| Animation FPS | 60 FPS | XPS | ✅/❌ |

### Screenshots

**Include screenshots of**:
1. BOLD Soccer banner (desktop + mobile)
2. Phone collection modal
3. Admin user information sidebar
4. Excel export with highlighting
5. Any bugs or issues found

### Recommendations

**Before Production**:
- [ ] Fix all critical issues
- [ ] Fix all high-priority issues
- [ ] Test on real mobile devices
- [ ] Performance optimization if needed
- [ ] Final security review

**Post-Production Monitoring**:
- [ ] Monitor error rates in Sentry
- [ ] Check database performance
- [ ] Watch for user feedback
- [ ] Track export usage analytics
- [ ] Monitor phone submission rate

### Sign-off

**QA Approval**: _________________ Date: _________
**Developer Approval**: _________________ Date: _________
**Product Owner Approval**: _________________ Date: _________

---

## SUCCESS CRITERIA CHECKLIST

Phase 4 is complete when ALL of these are true:

### Functional Requirements
- ✅ Feature flag controls campaign visibility
- ✅ Banner displays correctly on all devices
- ✅ Banner button routing logic works
- ✅ Phone modal appears on Day 7 only
- ✅ Phone validation prevents invalid entries
- ✅ Skip flow works with warning modal
- ✅ Admin export generates correct Excel file
- ✅ BOLD participants highlighted green
- ✅ User info sidebar displays all fields
- ✅ Copy to clipboard works for Name/Email/Phone

### Non-Functional Requirements
- ✅ No critical bugs found
- ✅ Performance acceptable (< 3s page loads)
- ✅ Mobile responsive on all features
- ✅ Keyboard navigation works
- ✅ Screen reader accessible
- ✅ WCAG AA color contrast compliance
- ✅ Browser compatibility verified
- ✅ Rollback procedure tested
- ✅ Documentation complete

### Deployment Readiness
- ✅ All tests passing
- ✅ No TypeScript errors (or all known/expected)
- ✅ Environment variables documented
- ✅ Database migration confirmed
- ✅ Admin users can access dashboard
- ✅ Feature flag set correctly in production
- ✅ Monitoring/alerting configured
- ✅ Rollback plan documented and understood

---

## NOTES

- Keep this document updated as you test
- Document all issues with screenshots
- Test on real devices when possible
- Don't skip edge cases - they matter!
- Get multiple people to test if possible
- Celebrate when all tests pass! 🎉

**Last Updated**: [Date]
**Version**: 1.0
