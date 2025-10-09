'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Bell, Shield } from 'lucide-react'

interface AdminHeaderProps {
  userInitials: string
}

export function AdminHeader({ userInitials }: AdminHeaderProps) {
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState('')

  const isActive = (path: string) => pathname?.startsWith(path)

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          {/* Left: Home + Title */}
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Go to home"
            >
              <Home className="w-5 h-5 text-slate-600" />
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">WeightWin Admin</h1>
                <p className="text-xs text-slate-500">Management Dashboard</p>
              </div>
            </div>
          </div>

          {/* Right: Search, Notifications, Profile */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Notifications */}
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{userInitials}</span>
              </div>
              <span className="text-sm font-medium text-slate-700">Admin</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex gap-2 -mb-px">
          <Link
            href="/admin/applicants"
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              isActive('/admin/applicants')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Applicants
          </Link>
          <Link
            href="/admin/users"
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              isActive('/admin/users')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Users
          </Link>
          <button
            disabled
            className="px-4 py-2.5 text-sm font-medium rounded-t-lg text-slate-400 cursor-not-allowed"
          >
            Reports
          </button>
        </nav>
      </div>
    </header>
  )
}

