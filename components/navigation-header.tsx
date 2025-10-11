'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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
    <header className="px-4 sm:px-6 py-4 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">WeightWin</h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            How it works
          </button>
          <button 
            onClick={() => scrollToSection('for-nutritionists')}
            className="text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            For Nutritionists
          </button>
        </nav>
        
        {/* Right side - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {!isLoading && user && (
            <ThemeToggle />
          )}
          {!isLoading && user ? (
            <ProfileDropdown 
              userInitials={user.initials}
              isAdmin={user.isAdmin}
            />
          ) : (
            <Link href="/auth/login">
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium">
                Start the 7-Day Challenge
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          {!isLoading && user && (
            <ThemeToggle />
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-6 mt-6">
                {/* Mobile Navigation Links */}
                <div className="space-y-4">
                  <button 
                    onClick={() => scrollToSection('how-it-works')}
                    className="block w-full text-left text-muted-foreground hover:text-foreground font-medium transition-colors py-2"
                  >
                    How it works
                  </button>
                  <button 
                    onClick={() => scrollToSection('for-nutritionists')}
                    className="block w-full text-left text-muted-foreground hover:text-foreground font-medium transition-colors py-2"
                  >
                    For Nutritionists
                  </button>
                </div>

                {/* Mobile User Actions */}
                <div className="border-t border-border pt-6">
                  {!isLoading && user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{user.initials}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Signed in</span>
                      </div>
                      <ProfileDropdown 
                        userInitials={user.initials}
                        isAdmin={user.isAdmin}
                      />
                    </div>
                  ) : (
                    <Link href="/auth/login" className="block">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium">
                        Start the 7-Day Challenge
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
