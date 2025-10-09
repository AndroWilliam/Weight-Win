import { redirect } from 'next/navigation'
import { userIsAdmin } from '@/lib/admin/guard'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminTabs } from '@/components/admin/AdminTabs'

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

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      <div className="mx-auto max-w-7xl px-6">
        <AdminTabs />
        <main className="pb-12">
          {children}
        </main>
      </div>
    </div>
  )
}

