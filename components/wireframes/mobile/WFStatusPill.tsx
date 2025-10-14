"use client"

type Status = "new" | "approved" | "rejected"

export function WFStatusPill({ status }: { status: Status }) {
  const label = status === "new" ? "New" : status === "approved" ? "Approved" : "Rejected"
  const classes =
    status === "approved"
      ? "bg-emerald-500 text-white dark:bg-emerald-400"
      : status === "rejected"
      ? "bg-red-500 text-white dark:bg-red-500"
      : "bg-indigo-600 text-white dark:bg-indigo-500"

  return (
    <span className={`inline-block mt-2 text-white text-[10px] px-2 py-0.5 rounded-full ${classes}`}>{label}</span>
  )
}


