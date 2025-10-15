import { SkeletonCard, SkeletonKPICard } from '@/components/admin/SkeletonCard'

export default function UsersLoading() {
  return (
    <div className="px-4 sm:px-6 space-y-4 sm:space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SkeletonKPICard />
        <SkeletonKPICard />
        <SkeletonKPICard />
        <SkeletonKPICard />
      </div>

      {/* Mobile Card List Skeleton */}
      <div className="md:hidden space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden">
        <div className="animate-pulse">
          {/* Table Header */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 border-b border-border">
            <div className="h-4 bg-muted rounded w-1/6" />
            <div className="h-4 bg-muted rounded w-1/5" />
            <div className="h-4 bg-muted rounded w-1/6" />
            <div className="h-4 bg-muted rounded w-1/6" />
            <div className="h-4 bg-muted rounded w-20" />
            <div className="h-4 bg-muted rounded w-24" />
          </div>
          {/* Table Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-border">
              <div className="h-4 bg-muted rounded w-1/6" />
              <div className="h-4 bg-muted rounded w-1/5" />
              <div className="h-4 bg-muted rounded w-1/6" />
              <div className="h-4 bg-muted rounded w-1/6" />
              <div className="h-6 bg-muted rounded w-20" />
              <div className="h-8 bg-muted rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
