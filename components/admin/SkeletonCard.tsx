'use client'

import { cn } from '@/lib/utils'

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-3.5 sm:p-4',
        'animate-pulse',
        className
      )}
    >
      {/* Header: Name + Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="h-4 bg-muted rounded w-2/5" />
        <div className="h-5 w-16 bg-muted rounded-full" />
      </div>

      {/* Email line */}
      <div className="h-3 bg-muted rounded w-3/5 mb-2" />

      {/* Phone line */}
      <div className="h-3 bg-muted rounded w-2/5 mb-4" />

      {/* Action buttons */}
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-muted rounded" />
        <div className="flex-1 h-9 bg-muted rounded" />
        <div className="flex-1 h-9 bg-muted rounded" />
      </div>
    </div>
  )
}

export function SkeletonKPICard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-4',
        'animate-pulse',
        className
      )}
    >
      <div className="h-3 bg-muted rounded w-1/2 mb-3" />
      <div className="h-8 bg-muted rounded w-1/3" />
    </div>
  )
}

export function SkeletonTableRow() {
  return (
    <div className="hidden md:flex items-center gap-4 p-4 border-b border-border animate-pulse">
      <div className="h-4 bg-muted rounded w-1/6" />
      <div className="h-4 bg-muted rounded w-1/5" />
      <div className="h-4 bg-muted rounded w-1/6" />
      <div className="h-4 bg-muted rounded w-1/6" />
      <div className="h-6 bg-muted rounded w-20" />
      <div className="h-8 bg-muted rounded w-24" />
    </div>
  )
}
