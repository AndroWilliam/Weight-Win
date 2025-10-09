'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AdminTabs() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  const tabs = [
    { name: 'Applicants', href: '/admin/applicants' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Reports', href: '/admin/reports', disabled: true },
  ]

  return (
    <nav className="flex justify-center py-4">
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.disabled ? '#' : tab.href}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              isActive(tab.href) && !tab.disabled
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            } ${
              tab.disabled ? 'text-slate-400 cursor-not-allowed' : ''
            }`}
            aria-disabled={tab.disabled}
            tabIndex={tab.disabled ? -1 : undefined}
          >
            {tab.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}
