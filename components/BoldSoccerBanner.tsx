'use client'

export default function BoldSoccerBanner() {
  const handleCTA = async () => {
    // CRITICAL: Follow EXACT same logic as "Start Your Journey" button
    // Import dynamically to avoid SSR issues
    const { createClient } = await import('@/lib/supabase/client')
    const { isPreviewCompleted } = await import('@/lib/preview/previewCookies')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Authenticated user → Dashboard
      window.location.href = '/dashboard'
    } else {
      // Not authenticated → Check preview completion
      const completed = isPreviewCompleted()
      const targetUrl = completed
        ? '/preview-signup?returning=true'  // Returning user
        : '/preview/weight-check'           // First-time user
      window.location.href = targetUrl
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#EF4444] p-8 md:p-10">
        {/* Animated Soccer Ball Background */}
        <div className="absolute -right-5 -top-5 text-[150px] opacity-15 animate-spin-slow">
          ⚽
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Soccer Ball Icon (Left) */}
          <div className="text-6xl md:text-7xl shrink-0">
            ⚽
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-black mb-2 flex items-center justify-center md:justify-start gap-2">
              🔥 LIMITED TIME OFFER!
            </h3>
            <p className="text-black/85 text-base md:text-lg mb-4">
              Finish 7 days of tracking and unlock exclusive 30% savings at BOLD Soccer Academy!
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
              <button
                onClick={handleCTA}
                className="bg-black text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform animate-pulse-slow"
              >
                Let&apos;s Play! →
              </button>
              <div className="bg-black/20 px-4 py-2 rounded-full font-bold text-black text-sm">
                ⏰ Campaign Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
