# Vercel Environment Variables Setup

## Required Environment Variables

You need to set these environment variables in your Vercel project:

### 1. Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Go to your project: `weight-pqe40w5dr-andro-williams-projects`
3. Click on "Settings" tab
4. Click on "Environment Variables" in the left sidebar

### 2. Add These Variables

Add these environment variables one by one:

**Variable 1:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://ztknjvpqxlkytkrqsior.supabase.co`
- Environment: Production, Preview, Development

**Variable 2:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25qdnBxeGxreXRrcnFzaW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NTMwOTYsImV4cCI6MjA3NDAyOTA5Nn0.UTsoVJf59HVk6sU7jCGyf1xQxrjC3fxKjq1ZfDaRH0o`
- Environment: Production, Preview, Development

### 3. Redeploy

After adding the environment variables:
1. Go to the "Deployments" tab
2. Click the "..." menu on the latest deployment
3. Click "Redeploy"

Or trigger a new deployment by pushing to GitHub.

## Alternative: Use Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter: https://ztknjvpqxlkytkrqsior.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25qdnBxeGxreXRrcnFzaW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NTMwOTYsImV4cCI6MjA3NDAyOTA5Nn0.UTsoVJf59HVk6sU7jCGyf1xQxrjC3fxKjq1ZfDaRH0o

# Redeploy
vercel --prod
```

## Debug Information

The app now includes debug information that will show:
- ✅ Set - if the environment variable is available
- ❌ Missing - if the environment variable is not set

This will help you verify that the environment variables are properly configured.
