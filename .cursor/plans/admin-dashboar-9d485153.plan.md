<!-- 9d485153-87b3-426c-a029-e1b9d248e08a d2947819-b4cb-4790-b392-f907e8c62997 -->
# Mobile Responsiveness & Dark Mode Implementation

## Phase 1: Theme Infrastructure Setup

### 1.1 Extract Figma Dark Mode Colors

- Access Figma design via MCP to extract exact dark mode color values
- Document all color tokens (backgrounds, text colors, borders, accents)
- Update CSS variables in `app/globals.css` with Figma dark mode colors

### 1.2 Configure Theme Provider

- Update `app/layout.tsx` to wrap app with `ThemeProvider` from `next-themes`
- Set `attribute="class"` for Tailwind CSS dark mode
- Enable `enableSystem={true}` for system preference detection
- Set `defaultTheme="system"` to follow device settings

### 1.3 Create Theme Toggle Component

- Create `components/theme-toggle.tsx` with sun/moon icon switch
- Add smooth transition animation between light/dark states
- Style according to Figma toggle design (shown in screenshots)
- Make component reusable for footer and header placement

## Phase 2: Landing Page Mobile & Dark Mode

### 2.1 Landing Page (`app/page.tsx`)

**Mobile Responsiveness:**

- Fix hero section: adjust text sizes from `text-5xl md:text-6xl` to `text-3xl sm:text-4xl md:text-6xl`
- Stack CTA buttons vertically on mobile (`flex-col sm:flex-row`)
- Adjust padding/spacing: reduce `py-16` to `py-8 sm:py-12 md:py-16`
- Optimize scale image section for mobile viewport
- Make feature cards stack on mobile (already has `grid md:grid-cols-3`)
- Adjust "How it works" section spacing and numbered steps for mobile

**Dark Mode:**

- Add dark mode classes to all sections:
- Hero: `dark:bg-neutral-900 dark:text-white`
- Cards: `dark:bg-card dark:text-card-foreground`
- Buttons: ensure proper contrast in dark mode
- Update footer background: `bg-neutral-900` works for both themes

### 2.2 Navigation Header (`components/navigation-header.tsx`)

**Mobile Responsiveness:**

- Add hamburger menu for mobile navigation (currently `hidden md:flex`)
- Create mobile menu drawer/sheet component
- Stack navigation items vertically in mobile menu
- Ensure profile dropdown works on mobile

**Dark Mode:**

- Add dark mode classes to header
- Theme toggle button in header for authenticated users
- Ensure logo and navigation items have proper dark mode colors

### 2.3 Footer Theme Toggle

- Add `ThemeToggle` component to footer (line 233 in `app/page.tsx`)
- Position with proper spacing and alignment
- Add animation on theme change (fade/slide transition)

## Phase 3: Dashboard & User Pages Mobile & Dark Mode

### 3.1 Dashboard (`app/dashboard/page.tsx`)

**Mobile Responsiveness:**

- Optimize breadcrumb navigation for mobile
- Adjust "Day X of 7" heading size for mobile screens
- Stack "Take Photo" card and "Your Progress" card vertically on mobile
- Make progress pills (1-7) scrollable horizontally on small screens
- Adjust "Your Reward" card layout for mobile

**Dark Mode:**

- Update all card backgrounds with `dark:bg-card`
- Ensure proper contrast for progress indicators
- Update text colors: `dark:text-foreground`
- Style buttons for dark mode compatibility

### 3.2 Setup Flow Pages

- `app/setup/page.tsx`: Stack form elements, adjust input sizes
- `app/consent/page.tsx`: Optimize text blocks for mobile reading
- `app/commit/page.tsx`: Ensure checkbox and consent text readable on mobile
- Add dark mode classes to all form elements

### 3.3 Weight Check & Tracking Pages

- `app/weight-check/page.tsx`: Optimize camera interface for mobile
- `app/track/page.tsx`: Adjust photo upload UI for mobile screens
- `app/progress/page.tsx`: Make charts/graphs responsive
- Add dark mode styling to all interactive elements

## Phase 4: Admin Dashboard Mobile & Dark Mode

### 4.1 Admin Layout (`app/admin/layout.tsx`)

**Mobile Responsiveness:**

- Make admin header responsive with hamburger menu
- Optimize search bar for mobile
- Adjust profile dropdown positioning

**Dark Mode:**

- Apply dark mode to admin header
- Update search input styling for dark mode

### 4.2 Applicants Page (`app/admin/applicants/page.tsx`)

**Mobile Responsiveness:**

- Convert KPI cards from grid to vertical stack on mobile
- Transform applicants table to card-based layout on mobile:
- Each row becomes a card with key info visible
- Use collapsible sections for additional details
- Add "View Details" button to open review drawer
- Make tabs scrollable horizontally if needed
- Optimize filters and search for mobile

**Dark Mode:**

- Apply dark mode to KPI cards
- Update table/card styling for dark mode
- Ensure status pills have proper dark mode colors
- Style drawer/modal components for dark mode

### 4.3 Users Page (`app/admin/users/page.tsx`)

**Mobile Responsiveness:**

- Same card-based approach as Applicants page
- Optimize progress bars for mobile display
- Make streak indicators touch-friendly
- Stack user info vertically in cards

**Dark Mode:**

- Apply consistent dark mode styling
- Ensure progress bars visible in dark mode
- Update action buttons for dark mode

### 4.4 Admin Components

- `components/admin/ApplicantsTable.tsx`: Create mobile card view
- `components/admin/UsersTable.tsx`: Create mobile card view
- `components/admin/ReviewDrawer.tsx`: Optimize drawer for mobile
- `components/admin/KPICards.tsx`: Stack vertically on mobile

## Phase 5: Authentication Pages Mobile & Dark Mode

### 5.1 Login Page (`app/auth/login/page.tsx`)

**Mobile Responsiveness:**

- Center content with proper padding
- Adjust button sizes for mobile (min 44px touch target)
- Optimize Google sign-in button for mobile

**Dark Mode:**

- Update form background for dark mode
- Ensure sufficient contrast for input fields
- Style authentication providers for dark mode

### 5.2 Callback & Error Pages

- `app/auth/callback/route.ts`: No UI changes needed
- `app/auth/auth-code-error/page.tsx`: Apply mobile/dark mode styling

## Phase 6: Nutritionist Application Mobile & Dark Mode

### 6.1 Application Form (`app/apply/nutritionist/page.tsx`)

**Mobile Responsiveness:**

- Stack form fields vertically on mobile
- Optimize file upload components for mobile
- Adjust document preview for mobile screens
- Make form inputs touch-friendly (min height 44px)

**Dark Mode:**

- Apply dark mode to form containers
- Update input field styling for dark mode
- Ensure file upload dropzone visible in dark mode
- Style preview modal for dark mode

## Phase 7: Global Components & Polish

### 7.1 Shared Components

- `components/profile-dropdown.tsx`: Ensure mobile-friendly positioning
- `components/photo-capture.tsx`: Optimize camera UI for mobile
- All UI components in `components/ui/`: Add dark mode variants

### 7.2 Testing & Refinement

- Test all pages on mobile viewports (375px, 390px, 414px)
- Verify theme switching works across all pages
- Check system preference detection
- Ensure smooth animations
- Verify color contrast meets WCAG AA standards

## Key Files to Modify

**Core Infrastructure:**

- `app/layout.tsx` - Add ThemeProvider wrapper
- `app/globals.css` - Update dark mode CSS variables with Figma colors
- `components/theme-toggle.tsx` - NEW: Create theme toggle component

**Pages (Mobile + Dark Mode):**

- `app/page.tsx` - Landing page
- `app/dashboard/page.tsx` - User dashboard
- `app/admin/applicants/page.tsx` - Admin applicants
- `app/admin/users/page.tsx` - Admin users
- `app/apply/nutritionist/page.tsx` - Nutritionist application
- All setup/flow pages (`setup`, `consent`, `commit`, `weight-check`, `track`)

**Components (Mobile Variants):**

- `components/navigation-header.tsx` - Add mobile menu
- `components/admin/ApplicantsTable.tsx` - Add card view
- `components/admin/UsersTable.tsx` - Add card view
- All other admin components

**Styling Utilities:**

- May need to add mobile-specific utility classes in `app/globals.css`

### To-dos

- [ ] Set up theme infrastructure (Figma color extraction, ThemeProvider configuration, ThemeToggle component)
- [ ] Implement mobile responsiveness and dark mode for landing page and navigation
- [ ] Implement mobile responsiveness and dark mode for dashboard and user flow pages
- [ ] Implement mobile responsiveness (card-based layout) and dark mode for admin dashboard
- [ ] Implement mobile responsiveness and dark mode for authentication and nutritionist application pages
- [ ] Test all pages on multiple mobile viewports, verify theme switching, and polish animations