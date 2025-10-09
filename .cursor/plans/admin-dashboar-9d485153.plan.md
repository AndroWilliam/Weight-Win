<!-- 9d485153-87b3-426c-a029-e1b9d248e08a d3fd58d7-58c1-4e11-9e6d-c0bc157a932c -->
# Simplify Nutritionist Application - Remove OCR & Fix Preview

## Overview

Remove all OCR functionality from the nutritionist application process, simplify to basic document uploads (CV + National ID), fix the document preview loading issue, and clean up admin interface.

## Problems to Fix

1. Document preview gets stuck on "Loading preview..." and never shows the actual document
2. OCR functionality is overcomplicated and not needed
3. ID type auto-detection and auto-fill creates confusion
4. Admin page shows OCR status column that's not needed

## Frontend Changes

### 1. Simplify UploadCard Component

**File**: `components/UploadCard.tsx`

**Remove:**

- All OCR-related logic (ID extraction, auto-detection)
- `onIdExtracted`, `onIdTypeDetected`, `onNotify` props
- ID scanning state and API calls to `/api/ocr/id-extract`
- Toast notifications for ID review

**Keep:**

- File upload with progress
- Preview generation (but fix the loading issue)
- File validation (size, type)
- Upload to Supabase storage

**Fix Preview Issue:**

The preview gets stuck because:

1. The signed URL is created correctly
2. But the Dialog component might not be properly rendering the preview
3. Need to ensure the preview URL is valid and the iframe/image loads properly

**Changes:**

```typescript
// Simplified props
interface UploadCardProps {
  formFieldName: 'cvPath' | 'idPath'
  title: string
  accept: string
  prefix: 'cv' | 'id'
}

// Remove OCR scanning logic
// Keep only: upload → generate preview → show success
```

### 2. Update Nutritionist Application Page

**File**: `app/apply/nutritionist/page.tsx`

**Remove:**

- `idTypeLocked` state
- `onIdTypeDetected` callback
- `onIdExtracted` callback  
- Auto-lock ID type logic
- Toast notifications for ID extraction

**Simplify:**

- Keep manual ID type selection (National ID / Passport)
- Keep manual ID number input
- Remove auto-fill and auto-detection features

**Changes:**

```tsx
// Remove these from UploadCard usage:
- idType={idType}
- onIdExtracted={(id) => setValue('idNumber', id)}
- onIdTypeDetected={(type) => { setValue('idType', type); setIdTypeLocked(true); }}
- onNotify={(opts) => toast(opts)}

// Simplify to:
<UploadCard
  formFieldName="idPath"
  title="National ID Photo"
  accept="image/*,application/pdf"
  prefix="id"
/>
```

### 3. Fix Document Preview Modal

**File**: `components/UploadCard.tsx`

**Debug and Fix:**

- Ensure signed URL is properly passed to Dialog
- Check if iframe src is set correctly for PDFs
- Check if img src is set correctly for images
- Add error handling for failed preview loads
- Add fallback "Open in new tab" link if preview fails

**Potential fixes:**

```tsx
// For PDFs - use iframe with proper attributes
<iframe 
  src={preview} 
  className="w-full h-full"
  title="Document preview"
  onLoad={() => console.log('PDF loaded')}
  onError={() => console.log('PDF failed to load')}
/>

// For images - use img with proper loading
<img 
  src={preview} 
  alt="Preview"
  className="max-w-full h-auto"
  onLoad={() => console.log('Image loaded')}
  onError={() => console.log('Image failed to load')}
/>

// Add fallback link
<a href={preview} target="_blank" rel="noopener noreferrer">
  Open in new tab
</a>
```

### 4. Update Admin Applicants Table

**File**: `components/admin/ApplicantsTable.tsx`

**Remove:**

- OCR Status column from table header
- `getOCRBadge()` function
- OCR status display in table rows

**Keep:**

- All other columns (Submitted, Full Name, Email, Mobile, ID Type, Status, Actions)
- Status badges (New, In Review, Approved, Rejected)
- Review drawer functionality

**Changes:**

```tsx
// Remove from table headers
<th>OCR</th>

// Remove from table rows
<td>{getOCRBadge(row.ocr_status)}</td>
```

### 5. Update Review Drawer

**File**: `components/admin/ReviewDrawer.tsx`

**Remove:**

- OCR Status field display
- OCR confidence display
- Any OCR-related information

**Keep:**

- Applicant details
- Document previews (CV and ID)
- Action buttons (Approve, Reject, etc.)

## Database Changes

### 6. Clean Up Database Schema (Optional)

**File**: `scripts/18_remove_ocr_fields.sql` (new)

Since OCR is no longer used, we can optionally clean up the database:

```sql
-- Optional: Remove OCR-related columns from nutritionist_applications
-- (Keep for now if there's existing data, can clean up later)

-- ALTER TABLE nutritionist_applications 
-- DROP COLUMN IF EXISTS ocr_status,
-- DROP COLUMN IF EXISTS id_validation_status,
-- DROP COLUMN IF EXISTS id_validation_confidence;
```

**Decision:** Keep these columns in the database for now (don't break existing data), but stop using them in the UI.

## API Changes

### 7. Update Application Submission API

**File**: `app/api/applications/submit/route.ts`

**Remove:**

- Any OCR status updates
- ID validation logic

**Keep:**

- File path storage
- Application creation
- Status management

## Testing Plan

After implementation:

1. Test file upload for CV (PDF/image)
2. Test file upload for National ID (PDF/image)
3. **Verify preview modal shows document correctly** (not stuck on loading)
4. Test manual ID type selection
5. Test manual ID number input
6. Verify admin table doesn't show OCR column
7. Test application submission end-to-end
8. Verify admin can review applications without OCR fields

## Preview Fix Priority

The main issue is the preview getting stuck on "Loading preview...". Investigation steps:

1. **Check Console Logs**: Look for errors when preview opens
2. **Check Network Tab**: Verify signed URL request succeeds
3. **Check Dialog Component**: Ensure it properly renders children
4. **Check File Type Detection**: Verify PDF vs image detection works
5. **Add Debug Logging**: Log when preview state changes

Most likely cause: The Dialog component state or the preview URL isn't properly triggering a re-render when the signed URL arrives.

**Fix approach:**

- Add `key={preview}` to Dialog to force re-render
- Use `useEffect` to update preview when signed URL changes
- Add loading/error states to iframe/img elements
- Provide fallback download link

### To-dos

- [ ] Create SQL script to add 'rejected' to application_status enum
- [ ] Create SQL script for context-aware KPI functions (applicants and users)
- [ ] Create ApplicantsKPICards component with correct labels and icons
- [ ] Create UsersKPICards component with correct labels and icons
- [ ] Update applicants page to use get_applicants_kpis() and ApplicantsKPICards
- [ ] Update users page to use get_users_kpis() and UsersKPICards
- [ ] Update ApplicantsTable to handle rejected status with red badge
- [ ] Test all KPI calculations and verify design matches Figma