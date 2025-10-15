'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Bell, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SegmentedControl, type SegmentedControlOption } from '@/components/ui/segmented-control'
import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/lib/utils'

interface MobileTopNavProps {
  notificationCount?: number
  className?: string
}

const NAV_OPTIONS: SegmentedControlOption[] = [
  { value: '/admin/applicants', label: 'Applicants' },
  { value: '/admin/users', label: 'Users' },
]

const NAV_OPTIONS_SMALL: SegmentedControlOption[] = [
  { value: '/admin/applicants', label: 'Apps' },
  { value: '/admin/users', label: 'Users' },
]

export function MobileTopNav({ notificationCount = 0, className }: MobileTopNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Detect small screens (320px - 374px)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 375)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleTabChange = (value: string) => {
    router.push(value)
  }

  const handleHomeClick = () => {
    router.push('/dashboard')
  }

  const handleNotificationClick = () => {
    router.push('/admin/notifications')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Get current active tab
  const activeTab = pathname || '/admin/applicants'

  // Choose options based on screen size
  const options = isSmallScreen ? NAV_OPTIONS_SMALL : NAV_OPTIONS

  if (!mounted) {
    return (
      <nav className={cn('md:hidden bg-[#1a1a1a] border-b border-[#333]', className)}>
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="w-9 h-9 bg-[#2a2a2a] rounded-lg animate-pulse" />
          <div className="flex-1 h-9 bg-[#2a2a2a] rounded-lg animate-pulse max-w-[240px]" />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#2a2a2a] rounded-lg animate-pulse" />
            <div className="w-9 h-9 bg-[#2a2a2a] rounded-lg animate-pulse" />
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav
      className={cn(
        'md:hidden sticky top-0 z-50',
        'bg-[#1a1a1a] dark:bg-[#1a1a1a]',
        'border-b border-[#333] dark:border-[#333]',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between',
          'px-4 py-3',
          isSmallScreen && 'px-3 py-2.5 gap-2'
        )}
      >
        {/* Home Icon */}
        <IconButton
          onClick={handleHomeClick}
          aria-label="Go to home"
          size={isSmallScreen ? 'sm' : 'md'}
          className="flex-shrink-0"
        >
          <Home
            className={cn(
              'text-primary',
              isSmallScreen ? 'w-[18px] h-[18px]' : 'w-6 h-6'
            )}
          />
        </IconButton>

        {/* Tab Switcher (Segmented Control) */}
        <div className="flex-1 flex justify-center">
          <SegmentedControl
            options={options}
            value={activeTab}
            onChange={handleTabChange}
            size={isSmallScreen ? 'sm' : 'md'}
            className="max-w-[240px] w-full"
          />
        </div>

        {/* Right side buttons */}
        <div className={cn('flex items-center gap-2 flex-shrink-0', isSmallScreen && 'gap-1.5')}>
          {/* Dark Mode Toggle */}
          <IconButton
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            size={isSmallScreen ? 'sm' : 'md'}
          >
            {theme === 'dark' ? (
              <Moon className={isSmallScreen ? 'w-4 h-4' : 'w-5 h-5'} />
            ) : (
              <Sun className={isSmallScreen ? 'w-4 h-4' : 'w-5 h-5'} />
            )}
          </IconButton>

          {/* Notification Button */}
          <IconButton
            onClick={handleNotificationClick}
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
            badge={notificationCount > 0 ? notificationCount : false}
            size={isSmallScreen ? 'sm' : 'md'}
          >
            <Bell className={isSmallScreen ? 'w-4 h-4' : 'w-5 h-5'} />
          </IconButton>
        </div>
      </div>
    </nav>
  )
}
