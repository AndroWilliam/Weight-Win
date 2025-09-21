# WeightWin Deployment Guide

## 🚀 Vercel Deployment

### Step 1: GitHub Repository Setup

1. **Create GitHub Repository**
   - Go to [GitHub New Repository](https://github.com/new)
   - Repository name: `Weight-Win`
   - Description: `7 Days to Better Health - A modern weight tracking app with dynamic tips and reward system`
   - Make it **Public**
   - Don't initialize with README (we already have one)
   - Click "Create repository"

2. **Push to GitHub**
   ```bash
   # Add remote origin (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/Weight-Win.git
   
   # Push to GitHub
   git push -u origin main
   ```

### Step 2: Vercel Deployment

1. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository `Weight-Win`
   - Select the repository and click "Import"

2. **Configure Project Settings**
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `pnpm build` (or `npm run build`)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `pnpm install` (or `npm install`)

3. **Environment Variables**
   Add these environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://weight-win.vercel.app`

### Step 3: Supabase Configuration

1. **Update Supabase Settings**
   - Go to your Supabase project dashboard
   - Navigate to Authentication > URL Configuration
   - Add your Vercel domain to "Site URL"
   - Add redirect URLs:
     - `https://weight-win.vercel.app/auth/callback`
     - `https://weight-win.vercel.app/auth/callback?next=/consent`

2. **Database Setup**
   - Run the SQL scripts in `scripts/` directory
   - Ensure RLS policies are enabled
   - Test authentication flow

### Step 4: Testing

1. **Test Authentication**
   - Visit your deployed app
   - Try Google OAuth login
   - Test email/password login

2. **Test Core Features**
   - Complete onboarding flow
   - Test photo capture
   - Verify dynamic tips
   - Check countdown timer

3. **Test Responsiveness**
   - Test on mobile devices
   - Check tablet layout
   - Verify desktop experience

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Authentication Issues**
   - Verify Supabase URLs are correct
   - Check redirect URLs in Supabase
   - Ensure environment variables are set

3. **Database Issues**
   - Verify SQL scripts were run
   - Check RLS policies
   - Test database connections

### Environment Variables Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### Performance Optimization

1. **Image Optimization**
   - Images are automatically optimized by Next.js
   - Consider using WebP format for better compression

2. **Caching**
   - Static pages are cached by Vercel
   - API routes use appropriate cache headers

3. **Bundle Size**
   - Code splitting is handled by Next.js
   - Unused code is automatically removed

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor performance metrics
- Track user engagement

### Error Tracking
- Check Vercel function logs
- Monitor Supabase logs
- Set up error tracking (Sentry, etc.)

## 🔄 Continuous Deployment

- Every push to `main` branch triggers automatic deployment
- Preview deployments for pull requests
- Easy rollback to previous versions

## 📱 Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to Vercel project settings
   - Add your domain
   - Configure DNS records

2. **Update Supabase**
   - Update Site URL in Supabase
   - Add new redirect URLs

---

**Your WeightWin app is now live! 🎉**

Visit your deployed app and start tracking your health journey!
