'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Gift, 
  Settings, 
  Send, 
  Shield,
  ChevronDown
} from 'lucide-react'

interface ProfileDropdownProps {
  userInitials?: string
  isAdmin?: boolean
}

export function ProfileDropdown({ userInitials, isAdmin = false }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard',
      show: true
    },
    {
      icon: Gift,
      label: 'Rewards',
      href: '/rewards',
      show: true,
      comingSoon: true
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
      show: true,
      comingSoon: true
    },
    {
      icon: Send,
      label: 'Invitations',
      href: '/invitations',
      show: true,
      comingSoon: true
    },
    {
      icon: Shield,
      label: 'Admin',
      href: '/admin',
      show: isAdmin,
      comingSoon: true
    }
  ]

  const handleMenuItemClick = (href: string, comingSoon?: boolean) => {
    if (comingSoon) {
      alert('Coming soon! 🚀')
      setIsOpen(false)
      return
    }
    router.push(href)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border-2 border-primary-600 hover:bg-primary-50 transition-all duration-200 group"
        aria-label="Open profile menu"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm group-hover:scale-110 transition-transform duration-200">
          {userInitials || 'U'}
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-primary-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-neutral-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {menuItems.filter(item => item.show).map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={index}
                onClick={() => handleMenuItemClick(item.href, item.comingSoon)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 group relative overflow-hidden"
                style={{
                  transform: isOpen ? 'translateZ(0)' : 'translateZ(-10px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* 3D hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-primary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                
                {/* Icon with scale animation */}
                <div className="relative">
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </div>
                
                {/* Label */}
                <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                  {item.label}
                </span>
                
                {/* Coming soon badge */}
                {item.comingSoon && (
                  <span className="ml-auto text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                    Soon
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

