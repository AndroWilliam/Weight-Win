'use client'

import { useState } from 'react'
import { Search, Eye, Bell } from 'lucide-react'

interface UserProgress {
  user_id: string
  email: string
  current_streak: number | null
  longest_streak: number | null
  last_check_in: string | null
  challenge_start_date: string | null
  challenge_status: string | null
  total_weigh_ins: number
  last_weigh_in_at: string | null
  days_to_reward: number
  progress_percent: number
}

interface UsersTableProps {
  rows: UserProgress[]
}

export function UsersTable({ rows }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [userFilter, setUserFilter] = useState('all')

  // Client-side search filter
  const filteredRows = rows.filter(row => 
    row.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getProgressBarSegments = (totalWeighIns: number) => {
    const segments = []
    const maxDays = 7
    
    for (let i = 0; i < maxDays; i++) {
      const isComplete = i < totalWeighIns
      const isPartial = i === totalWeighIns && totalWeighIns < maxDays
      
      let bgColor = 'bg-slate-200 dark:bg-slate-700'
      if (isComplete) {
        if (totalWeighIns >= 7) bgColor = 'bg-indigo-500 dark:bg-indigo-400'
        else if (totalWeighIns >= 5) bgColor = 'bg-indigo-500 dark:bg-indigo-400'
        else bgColor = 'bg-indigo-500 dark:bg-indigo-400'
      }
      if (isPartial) bgColor = 'bg-orange-400 dark:bg-orange-500'
      
      segments.push(
        <div
          key={i}
          className={`h-2 flex-1 ${bgColor} ${i === 0 ? 'rounded-l-full' : ''} ${i === maxDays - 1 ? 'rounded-r-full' : ''}`}
        />
      )
    }
    
    return segments
  }

  const getStreakChips = (totalWeighIns: number) => {
    const chips = []
    for (let day = 1; day <= 7; day++) {
      const isComplete = day <= totalWeighIns
      chips.push(
        <span
          key={day}
          className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded ${
            isComplete 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
          }`}
        >
          {day}
        </span>
      )
    }
    return chips
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
  }

  if (rows.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <p className="text-muted-foreground">No users found</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground pl-2">Users</h2>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-1.5 w-64 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* User Filter */}
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table (enable horizontal scroll on small screens) */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">User</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Progress</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Streak</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Last Weigh-in</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Days to Reward</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRows.map((row) => {
              const userName = row.email.split('@')[0].split('.').map(part => 
                part.charAt(0).toUpperCase() + part.slice(1)
              ).join(' ')
              
              return (
                <tr 
                  key={row.user_id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {userName}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {row.email}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-0.5 w-32">
                        {getProgressBarSegments(row.total_weigh_ins)}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {row.progress_percent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {getStreakChips(row.total_weigh_ins)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(row.last_weigh_in_at)}
                  </td>
                  <td className="px-4 py-3">
                    {row.days_to_reward === 0 || row.total_weigh_ins >= 7 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-medium">
                        Completed ✓
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-foreground">
                        {row.days_to_reward} {row.days_to_reward === 1 ? 'day' : 'days'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        disabled
                        className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-muted-foreground cursor-not-allowed"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        disabled
                        className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-muted-foreground cursor-not-allowed"
                      >
                        <Bell className="w-4 h-4" />
                        Nudge
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredRows.length} of {rows.length} users
        </p>
        <div className="flex items-center gap-2">
          <button 
            disabled
            className="px-3 py-1 text-sm text-muted-foreground cursor-not-allowed"
          >
            Previous
          </button>
          <button 
            disabled
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredRows.length === 0 && searchTerm && (
        <div className="p-8 text-center text-muted-foreground">
          No results found for "{searchTerm}"
        </div>
      )}
    </div>
  )
}

