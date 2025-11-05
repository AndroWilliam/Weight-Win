'use client'

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-2">
        <div className="h-5 bg-muted rounded w-32" />
        <div className="h-5 bg-muted rounded-full w-16" />
      </div>

      {/* Contact skeleton */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-muted rounded" />
          <div className="h-3 bg-muted rounded flex-1" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-muted rounded" />
          <div className="h-3 bg-muted rounded w-28" />
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="h-9 bg-muted rounded-md" />
        <div className="h-9 bg-muted rounded-md" />
        <div className="h-9 bg-muted rounded-md" />
      </div>
    </div>
  )
}

export function SkeletonKPICard() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-muted rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-muted rounded w-20 mb-2" />
          <div className="h-6 bg-muted rounded w-12" />
        </div>
      </div>
    </div>
  )
}
