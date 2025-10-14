"use client"

export function WFErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-2 text-sm">
      {message}
    </div>
  )
}


