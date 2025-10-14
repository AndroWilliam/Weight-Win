"use client"

export function WFPagination() {
  return (
    <div className="sticky bottom-0 left-0 right-0 mt-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700">
      <div className="max-w-[680px] mx-auto px-3 py-3 flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">Showing 5 of 42</span>
        <div className="flex items-center gap-2">
          <button className="border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs px-3 py-1.5 rounded-md">Previous</button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-md">Next</button>
        </div>
      </div>
    </div>
  )
}


