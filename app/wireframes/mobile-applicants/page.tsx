"use client"

import { useState } from 'react'
import { WFMobileRowCard } from '@/components/wireframes/mobile/WFMobileRowCard'
import { WFSkeletonCard } from '@/components/wireframes/mobile/WFSkeletonCard'
import { WFErrorBanner } from '@/components/wireframes/mobile/WFErrorBanner'
import { WFPagination } from '@/components/wireframes/mobile/WFPagination'

type Row = {
  name: string
  phone: string
  email: string
  date: string
  status: 'new' | 'approved' | 'rejected'
  idType?: 'ID' | 'PPT'
}

const SAMPLE_ROWS: Row[] = [
  { name: 'Jane Smith', phone: '+2010 123 4567', email: 'jane.smith@example.com', date: 'Oct 11', status: 'new', idType: 'PPT' },
  { name: 'David Adel', phone: '+2012 241 7600', email: 'davidadel65@gmail.com', date: 'Oct 11', status: 'approved', idType: 'ID' },
  { name: 'Test User', phone: '+2010 123 4567', email: 'test@example.com', date: 'Oct 11', status: 'rejected', idType: 'ID' },
]

export default function MobileApplicantsWireframePage() {
  const [isDark, setIsDark] = useState(true)
  const [showSwipe, setShowSwipe] = useState(true)

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100">
        {/* Header / README note */}
        <div className="max-w-[680px] mx-auto px-3 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold">Mobile Applicants Wireframe</h1>
            <button
              onClick={() => setIsDark(v => !v)}
              className="border border-slate-200 dark:border-slate-700 text-xs px-3 py-1.5 rounded-md"
            >
              {isDark ? 'Light' : 'Dark'}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            Palette: Indigo(#4F46E5/ #6366F1), Emerald(#10B981/#34D399), Rose(#EF4444/#F87171), Surfaces(#FFFFFF/#0B0F1A).
          </p>
        </div>

        {/* Error Banner */}
        <div className="max-w-[680px] mx-auto px-3">
          <WFErrorBanner message="Could not load applicants." />
        </div>

        {/* Loading State */}
        <section className="max-w-[680px] mx-auto px-3 py-4 space-y-3">
          <WFSkeletonCard />
          <WFSkeletonCard />
          <WFSkeletonCard />
        </section>

        {/* Default List */}
        <section className="max-w-[680px] mx-auto px-3 py-4 space-y-3">
          {SAMPLE_ROWS.map((row, idx) => (
            <WFMobileRowCard key={idx} {...row} showSwipe={showSwipe && idx === 0} />
          ))}
        </section>

        {/* Empty State */}
        <section className="max-w-[680px] mx-auto px-3 py-4">
          <div className="space-y-3">
            <div className="text-xs text-slate-600 dark:text-slate-400">Empty</div>
            {/* simple import inline to avoid extra file */}
            <div className="rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-8 text-center">
              <div className="h-16 w-16 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800" />
              <h3 className="mt-4 text-sm font-semibold">No applicants yet</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Pull to refresh.</p>
            </div>
          </div>
        </section>

        {/* Pagination Footer */}
        <WFPagination />
      </div>
    </div>
  )
}


