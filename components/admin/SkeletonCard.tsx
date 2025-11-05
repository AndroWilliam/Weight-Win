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
