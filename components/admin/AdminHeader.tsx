'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Bell, Shield, Settings, LayoutDashboard, Gift, LogOut, AlertCircle } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { MobileTopNav } from '@/components/layout/mobile-top-nav'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface AdminHeaderProps {
  userInitials: string
  notificationCount?: number
}

export function AdminHeader({ userInitials, notificationCount = 0 }: AdminHeaderProps) {
  const pathname = usePathname()

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

            {/* Right: Theme, Notifications, Profile - Desktop */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <Link
                href="/admin/notifications"
                className="p-2 hover:bg-muted rounded-lg transition-colors relative"
                aria-label={notificationCount > 0 ? `${notificationCount} notifications` : 'Notifications'}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-semibold rounded-full">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </Link>

              {/* Admin Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">{userInitials}</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Admin</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem disabled>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <Gift className="w-4 h-4 mr-2" />
                    Rewards
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="text-red-600 dark:text-red-400">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            <Link
              href="/admin/errors"
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors inline-flex items-center gap-2 ${
                isActive('/admin/errors')
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Errors
            </Link>
          </nav>
        </div>
      </header>
    </>
  )
}

