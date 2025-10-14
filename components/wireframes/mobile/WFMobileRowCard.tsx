"use client"

import { WFStatusPill } from './WFStatusPill'
import { WFIDChip } from './WFIDChip'
import { WFSwipeActions } from './WFSwipeActions'

interface RowCardProps {
  name: string
  phone: string
  email: string
  date: string
  status: 'new' | 'approved' | 'rejected'
  idType?: 'ID' | 'PPT'
  showSwipe?: boolean
}

export function WFMobileRowCard({ name, phone, email, date, status, idType = 'ID', showSwipe = false }: RowCardProps) {
  return (
    <div className="relative">
      <WFSwipeActions visible={showSwipe} />
      <div className="relative rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="shrink-0 h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{name}</div>
              <WFIDChip type={idType} />
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">📞 {phone}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">✉️ {email}</div>
            <WFStatusPill status={status} />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 ml-2 whitespace-nowrap">{date}</div>
        </div>
        <div className="mt-3 flex items-center justify-end">
          <button className="border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs px-3 py-1.5 rounded-md">
            View
          </button>
        </div>
      </div>
    </div>
  )
}


