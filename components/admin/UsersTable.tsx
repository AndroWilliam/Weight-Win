'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SkeletonCard } from './SkeletonCard'
import { Button } from '@/components/ui/button'
import { UserActionsDrawer } from './UserActionsDrawer'

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
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingPage, setIsLoadingPage] = useState(false)
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null)
  const [drawerEmail, setDrawerEmail] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const itemsPerPage = 5

  // Client-side search filter
  const filteredRows = rows.filter(row =>
    row.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRows = filteredRows.slice(startIndex, endIndex)

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return
    setIsLoadingPage(true)
    // Simulate loading delay for skeleton
    await new Promise(resolve => setTimeout(resolve, 300))
    setCurrentPage(newPage)
    setIsLoadingPage(false)
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, userFilter])

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

  const openDrawer = (userId: string, email: string) => {
    setDrawerUserId(userId)
    setDrawerEmail(email)
    setIsDrawerOpen(true)
  }

  if (rows.length === 0) {
    return (
      <>
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">No users found</p>
        </div>
        <UserActionsDrawer
          userId={drawerUserId}
          email={drawerEmail}
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        />
      </>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground pl-2">Users</h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-1.5 w-full sm:w-64 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* User Filter */}
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-1.5 w-full sm:w-auto bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden p-4 space-y-3">
        {isLoadingPage ? (
          <>
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </>
        ) : (
          paginatedRows.map((row, index) => {
            const userName = row.email.split('@')[0].split('.').map(part =>
              part.charAt(0).toUpperCase() + part.slice(1)
            ).join(' ')
            const isExpanded = expandedId === row.user_id
            return (
            <div
              key={row.user_id}
              className="rounded-xl border border-border bg-background/60 p-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            >
              {/* Header line */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-foreground leading-tight">{userName}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => openDrawer(row.user_id, row.email)}
                >
                  Actions
                </Button>
              </div>

              {/* Progress visual */}
              <div className="mt-3 space-y-1">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-[width] duration-500"
                    style={{ width: `${row.progress_percent}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">{row.progress_percent}% complete</div>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : row.user_id)}
                  className="text-[11px] text-muted-foreground underline underline-offset-2"
                >
                  {isExpanded ? 'Hide details' : 'Tap for more details'}
                </button>
              </div>

              {/* Expandable details */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-3 border-t border-border pt-3 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="text-foreground">{row.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Streak</span>
                      <span className="text-foreground">{row.longest_streak ?? 0} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last weigh‑in</span>
                      <span className="text-foreground">{formatDate(row.last_weigh_in_at)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Days to reward</span>
                      <span className="text-foreground">{row.days_to_reward}</span>
                    </div>
                    <div className="flex items-center justify-end pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => openDrawer(row.user_id, row.email)}
                      >
                        Actions
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )
          })
        )}
      </div>

      {/* Desktop Table (md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b-2 border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-56">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-36">Progress</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-48">Streak</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-44">Last Weigh-in</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">Days to Reward</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingPage ? (
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <tr key={i} className="border-b border-border animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-24" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-40" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-28" /></td>
                  <td className="px-4 py-4"><div className="flex gap-1">{Array.from({length: 7}).map((_, j) => <div key={j} className="w-6 h-6 bg-muted rounded" />)}</div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-32" /></td>
                  <td className="px-4 py-4"><div className="h-5 bg-muted rounded-full w-20" /></td>
                  <td className="px-4 py-4 text-right"><div className="h-8 bg-muted rounded w-16 ml-auto" /></td>
                </tr>
              ))
            ) : (
              paginatedRows.map((row, index) => {
                const userName = row.email.split('@')[0].split('.').map(part =>
                  part.charAt(0).toUpperCase() + part.slice(1)
                ).join(' ')

                const isEven = index % 2 === 0

                return (
                <tr
                  key={row.user_id}
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${
                    isEven ? 'bg-background' : 'bg-muted/20'
                  }`}
                >
                  <td className="px-4 py-4 text-sm font-medium text-foreground">
                    {userName}
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    {row.email}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-0.5 w-32">
                        {getProgressBarSegments(row.total_weigh_ins)}
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {row.progress_percent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-0.5">
                      {getStreakChips(row.total_weigh_ins)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-foreground whitespace-nowrap">
                    {formatDate(row.last_weigh_in_at)}
                  </td>
                  <td className="px-4 py-4">
                    {row.days_to_reward === 0 || row.total_weigh_ins >= 7 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-medium whitespace-nowrap">
                        Completed ✓
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-foreground whitespace-nowrap">
                        {row.days_to_reward} {row.days_to_reward === 1 ? 'day' : 'days'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDrawer(row.user_id, row.email)}
                    >
                      Actions
                    </Button>
                  </td>
                </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredRows.length)} of {filteredRows.length} users
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoadingPage}
            className="px-3 py-1 text-sm text-foreground hover:bg-muted rounded disabled:text-muted-foreground disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={isLoadingPage}
                className={`w-10 h-10 sm:w-8 sm:h-8 text-sm rounded transition-colors ${
                  page === currentPage
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted disabled:cursor-not-allowed'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoadingPage}
            className="px-3 py-1 text-sm text-foreground hover:bg-muted rounded disabled:text-muted-foreground disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
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

      <UserActionsDrawer
        userId={drawerUserId}
        email={drawerEmail}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </div>
  )
}

