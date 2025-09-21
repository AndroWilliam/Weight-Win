# Supabase OAuth Configuration Fix

## The Problem
After deploying to Vercel, Google OAuth redirects users to `localhost:3000` instead of the Vercel domain. This happens because the Supabase OAuth configuration is set up for local development.

## The Solution

### 1. Update Supabase OAuth Settings

You need to update the OAuth redirect URLs in your Supabase dashboard:

1. **Go to Supabase Dashboard**:
   - Visit [supabase.com](https://supabase.com)
   - Go to your project: `ztknjvpqxlkytkrqsior`
   - Navigate to "Authentication" → "URL Configuration"

2. **Update Site URL**:
   - Change from: `http://localhost:3000`
   - Change to: `https://weight-ayjol8cqh-andro-williams-projects.vercel.app`

3. **Update Redirect URLs**:
   - Add these URLs to the "Redirect URLs" list:
     - `https://weight-ayjol8cqh-andro-williams-projects.vercel.app/auth/callback`
     - `https://weight-ayjol8cqh-andro-williams-projects.vercel.app/auth/callback?next=/consent`
     - `https://weight-ayjol8cqh-andro-williams-projects.vercel.app/auth/callback?next=/dashboard`

4. **Keep Localhost for Development**:
   - Also keep these for local development:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/callback?next=/consent`

### 2. Update Google OAuth Configuration

1. **Go to Google Cloud Console**:
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Go to "APIs & Services" → "Credentials"
   - Find your OAuth 2.0 Client ID

2. **Update Authorized Redirect URIs**:
   - Add: `https://ztknjvpqxlkytkrqsior.supabase.co/auth/v1/callback`
   - Keep: `http://localhost:3000/auth/callback` (for development)

### 3. Code Changes Made

I've updated the code to:
- Better detect production vs development environment
- Use proper redirect URLs based on the current domain
- Add better logging for debugging

### 4. Test the Fix

After making these changes:

1. **Redeploy** your Vercel app (it should auto-deploy from GitHub)
2. **Test Google OAuth** - it should now redirect to Vercel instead of localhost
3. **Test Email Auth** - should also work correctly

### 5. Debug Information

The app now logs:
- Current redirect URL being used
- Environment detection (production/development)
- Vercel detection
- Hostname information

Check the browser console for these logs to verify the correct URLs are being used.

## Expected Result

After these changes:
- ✅ Google OAuth redirects to Vercel domain
- ✅ Email authentication works on Vercel
- ✅ Users can complete the full authentication flow
- ✅ No more localhost redirects in production

## If Issues Persist

If you still see localhost redirects:

1. **Check Supabase logs** in the dashboard
2. **Verify the redirect URLs** are exactly as specified above
3. **Clear browser cache** and try again
4. **Check the browser console** for the debug logs

The most common issue is that the Supabase Site URL is still set to localhost - make sure to change this to your Vercel domain.
