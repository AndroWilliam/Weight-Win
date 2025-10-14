"use client"

export function WFEmptyState() {
  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-8 text-center">
      <div className="h-16 w-16 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800" />
      <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">No applicants yet</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Pull to refresh.</p>
      <div className="mt-4">
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-md">Refresh</button>
      </div>
    </div>
  )
}


