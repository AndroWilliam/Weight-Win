# WeightWin - 7 Days to Better Health

A modern, user-friendly weight tracking application that helps users build healthy habits through a simple 7-day challenge. Complete the challenge and earn a free session with a certified nutritionist!

## 🚀 Features

### Core Functionality
- **7-Day Challenge**: Track your weight daily for a week
- **Photo OCR**: Automatic weight detection from scale photos
- **Progress Tracking**: Visual progress indicators and statistics
- **Reward System**: Earn a free nutritionist session upon completion

### User Experience
- **Google OAuth**: Quick and secure authentication
- **Onboarding Flow**: Privacy consent, setup, and commitment pages
- **Dynamic Tips**: 4 rotating daily tips with auto-slider
- **Live Countdown**: Real-time countdown to reward
- **Responsive Design**: Works perfectly on all devices

### Technical Features
- **Next.js 14**: Latest React framework with App Router
- **Supabase**: Authentication and database
- **TypeScript**: Full type safety
- **Tailwind CSS**: Modern, responsive styling
- **Real-time Updates**: Live countdown and dynamic content

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Deployment**: Vercel
- **State Management**: React Hooks, LocalStorage

## 📱 User Flow

1. **Landing Page**: Learn about the 7-day challenge
2. **Authentication**: Sign up with Google or email
3. **Privacy Consent**: Review data usage and permissions
4. **Setup**: Choose weight units, reminder time, timezone
5. **Commitment**: Review choices and start challenge
6. **Dashboard**: Track progress with dynamic tips and countdown
7. **Weight Check**: Take photos with camera or upload
8. **Progress**: View weight trends and statistics
9. **Reward**: Unlock free nutritionist session

## 🎨 Design System

### Colors
- **Primary**: Indigo (#4F46E5)
- **Success**: Green (#059669)
- **Warning**: Orange (#D97706)
- **Danger**: Red (#E11D48)
- **Neutrals**: Slate scale

### Typography
- **Font**: Inter (Google Fonts)
- **Scale**: Display, H1, H2, Body, Caption
- **Spacing**: 8px grid system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weight-win.git
   cd weight-win
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Database Setup**
   Run the SQL scripts in the `scripts/` directory:
   ```sql
   -- 01_create_weightwin_tables.sql
   -- 02_seed_expert_sessions.sql
   -- 03_create_helper_functions.sql
   ```

5. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
weight-win/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard
│   ├── progress/          # Progress tracking
│   └── weight-check/      # Photo capture
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── daily-tips.tsx    # Dynamic tips component
│   └── reward-countdown.tsx # Countdown component
├── lib/                  # Utility functions
│   ├── supabase/         # Supabase configuration
│   └── tips-service.ts   # Tips management
├── scripts/              # Database SQL scripts
└── styles/               # Global styles
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the SQL scripts in `scripts/` directory
3. Configure authentication providers (Google OAuth)
4. Set up Row Level Security (RLS) policies

### Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Database URLs for direct access
POSTGRES_URL=your_postgres_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Manual Deployment
```bash
# Build the project
pnpm build

# Start production server
pnpm start
```

## 📊 Features in Detail

### Dynamic Daily Tips
- **4 Categories**: Healthy Diet, Lifestyle, Workout, Motivational
- **Auto-rotation**: Tips change every 5 seconds
- **Manual Navigation**: Arrow buttons and dot indicators
- **Daily Refresh**: New tips every day

### Reward Countdown
- **Real-time Timer**: Updates every second
- **Progress Bar**: Visual completion percentage
- **Completion State**: Special UI when challenge is done

### Photo Capture
- **Camera Access**: Live camera preview
- **Upload Option**: Select from photo library
- **OCR Processing**: Automatic weight detection
- **Photo Preview**: Review before confirming

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

For support, email support@weightwin.app or create an issue in this repository.

---

**WeightWin** - Simple, consistent, rewarding weight tracking. 🎯
