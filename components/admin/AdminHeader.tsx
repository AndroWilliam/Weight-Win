'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Bell, Shield, Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface AdminHeaderProps {
  userInitials: string
}

export function AdminHeader({ userInitials }: AdminHeaderProps) {
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState('')

  const isActive = (path: string) => pathname?.startsWith(path)

  return (
    <header className="bg-background border-b border-border">
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
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg font-bold text-foreground">WeightWin Admin</h1>
                <p className="text-xs text-muted-foreground">Management Dashboard</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold text-foreground">Admin</h1>
              </div>
            </div>
          </div>

          {/* Right: Search, Theme, Notifications, Profile - Desktop */}
          <div className="hidden md:flex items-center gap-3 sm:gap-4">
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
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{userInitials}</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Admin</span>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 mt-6">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Mobile Navigation */}
                  <div className="space-y-4">
                    <Link
                      href="/admin/applicants"
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isActive('/admin/applicants') 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="text-sm font-medium">Applicants</span>
                    </Link>
                    <Link
                      href="/admin/users"
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isActive('/admin/users') 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="text-sm font-medium">Users</span>
                    </Link>
                  </div>

                  {/* Mobile Profile Section */}
                  <div className="border-t border-border pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">{userInitials}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Admin User</span>
                    </div>
                    <button className="w-full p-2 hover:bg-muted rounded-lg transition-colors text-left">
                      <Bell className="w-4 h-4 text-muted-foreground inline mr-2" />
                      <span className="text-sm text-muted-foreground">Notifications</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Navigation Tabs - Desktop Only */}
        <nav className="hidden md:flex gap-2 -mb-px">
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
  )
}

