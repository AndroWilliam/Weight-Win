"use client"

export function WFIDChip({ type }: { type: "ID" | "PPT" }) {
  return (
    <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded">
      {type === "PPT" ? "ID:PPT" : "ID:ID"}
    </span>
  )
}


