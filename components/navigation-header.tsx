'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProfileDropdown } from "@/components/profile-dropdown"

export function NavigationHeader() {
  const [user, setUser] = useState<{ initials: string; isAdmin: boolean } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          // Get user initials from email or metadata
          const email = authUser.email || ''
          const nameParts = email.split('@')[0].split('.')
          
          let initials = ''
          if (nameParts.length >= 2) {
            // If email is like "john.doe@example.com"
            initials = nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase()
          } else if (email.length > 0) {
            // Otherwise use first two letters of email
            initials = email.substring(0, 2).toUpperCase()
          }
          
          // Check if user is admin (you can add admin check logic here)
          const isAdmin = authUser.user_metadata?.role === 'admin' || false
          
          setUser({ initials, isAdmin })
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUser()
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900">WeightWin</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors"
          >
            How it works
          </button>
          <button 
            onClick={() => scrollToSection('for-nutritionists')}
            className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors"
          >
            For Nutritionists
          </button>
        </nav>
        
        {/* Show profile dropdown if user is logged in, otherwise show CTA button */}
        {!isLoading && user ? (
          <ProfileDropdown 
            userInitials={user.initials}
            isAdmin={user.isAdmin}
          />
        ) : (
          <Link href="/auth/login">
            <Button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium">
              Start the 7-Day Challenge
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
