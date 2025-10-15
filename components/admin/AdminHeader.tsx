'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Bell, Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { MobileTopNav } from '@/components/layout/mobile-top-nav'

interface AdminHeaderProps {
  userInitials: string
  notificationCount?: number
}

export function AdminHeader({ userInitials, notificationCount = 0 }: AdminHeaderProps) {
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState('')

  const isActive = (path: string) => pathname?.startsWith(path)

  return (
    <>
      {/* Mobile Top Navigation - Only visible on mobile */}
      <MobileTopNav notificationCount={notificationCount} />

      {/* Desktop Header - Hidden on mobile */}
      <header className="hidden md:block bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-3 sm:py-4">
            {/* Left: Home + Title */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Go to home"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </Link>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-3 h-3 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-foreground">WeightWin Admin</h1>
                  <p className="text-xs text-muted-foreground">Management Dashboard</p>
                </div>
              </div>
            </div>

            {/* Right: Search, Theme, Notifications, Profile - Desktop */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <button className="p-2 hover:bg-muted rounded-lg transition-colors relative">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {/* Admin Avatar */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">{userInitials}</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">Admin</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs - Desktop Only */}
          <nav className="flex gap-2 -mb-px">
            <Link
              href="/admin/applicants"
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                isActive('/admin/applicants')
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Applicants
            </Link>
            <Link
              href="/admin/users"
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                isActive('/admin/users')
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Users
            </Link>
            <button
              disabled
              className="px-4 py-2.5 text-sm font-medium rounded-t-lg text-muted-foreground cursor-not-allowed"
            >
              Reports
            </button>
          </nav>
        </div>
      </header>
    </>
  )
}

