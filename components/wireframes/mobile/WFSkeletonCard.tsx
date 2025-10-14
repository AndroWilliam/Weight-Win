"use client"

export function WFSkeletonCard() {
  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="shrink-0 h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="mt-2 h-2 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="mt-1 h-2 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-3 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="mt-3 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
  )
}


