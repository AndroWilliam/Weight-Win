import { redirect } from 'next/navigation'
import { userIsAdmin } from '@/lib/admin/guard'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side admin guard
  const isAdmin = await userIsAdmin()
  
  if (!isAdmin) {
    console.log('[Admin Layout] Non-admin user attempted to access admin area, redirecting to home')
    redirect('/')
  }

  // Get user info for header
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : 'AD'

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader userInitials={userInitials} />

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-6">
        {children}
      </main>
    </div>
  )
}

