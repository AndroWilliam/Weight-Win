'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      // If user is authenticated, redirect to dashboard
      if (user) {
        router.push('/dashboard')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}


