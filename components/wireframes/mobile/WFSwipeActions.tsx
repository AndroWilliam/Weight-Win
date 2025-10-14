"use client"

export function WFSwipeActions({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <div className="absolute inset-0 grid grid-cols-2 rounded-xl overflow-hidden">
      <div className="flex items-center justify-start pl-4 bg-emerald-600 text-white">✓ Approve</div>
      <div className="flex items-center justify-end pr-4 bg-rose-600 text-white">Reject ✕</div>
    </div>
  )
}


