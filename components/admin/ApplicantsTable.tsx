'use client'

import { useEffect, useState } from 'react'
import { Search, Eye, Download, Mail, Phone, Check, X, Loader2 } from 'lucide-react'
import { ReviewDrawer } from './ReviewDrawer'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { SkeletonCard } from './SkeletonCard'

interface Applicant {
  id: string
  created_at: string
  first_name: string
  family_name: string
  email: string
  mobile_e164: string
  id_type: string
  id_number: string
  ocr_status: string | null
  status: string
  cv_file_path: string
  id_file_path: string
}

interface ApplicantsTableProps {
  rows: Applicant[]
}

export function ApplicantsTable({ rows }: ApplicantsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
  const [apps, setApps] = useState<Applicant[]>(rows)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingPage, setIsLoadingPage] = useState(false)
  const itemsPerPage = 5

  useEffect(() => {
    setApps(rows)
  }, [rows])

  // Client-side filters
  const filteredRows = apps.filter(row => {
    const matchesSearch =
      row.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.family_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || row.status === statusFilter

    return matchesSearch && matchesStatus
  })

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
  }, [searchTerm, statusFilter])

  const updateStatus = async (id: string, nextStatus: 'approved' | 'rejected', showUndo = true, previousStatus?: string) => {
    try {
      setLoadingId(id)
      const supabase = createClient()
      const { error } = await supabase
        .from('nutritionist_applications')
        .update({ status: nextStatus })
        .eq('id', id)

      if (error) throw error

      setApps(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus } : a))

      const msg = nextStatus === 'approved' ? 'Application approved ✓' : 'Application rejected ✕'
      if (showUndo && previousStatus) {
        toast.success(msg, {
          action: {
            label: 'Undo',
            onClick: () => updateStatus(id, previousStatus as 'approved' | 'rejected', false),
          },
        })
      } else {
        toast.success(msg)
      }
    } catch (err: any) {
      console.error('[ApplicantsTable] Failed to update status', err)
      toast.error(err?.message || 'Failed to update application status')
    } finally {
      setLoadingId(null)
    }
  }

  const handleApprove = (app: Applicant) => updateStatus(app.id, 'approved', true, app.status)
  const handleReject = (app: Applicant) => updateStatus(app.id, 'rejected', true, app.status)


  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      in_review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      reviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    }
    
    const style = styles[status.toLowerCase() as keyof typeof styles] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    const displayStatus = status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
        {displayStatus}
      </span>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <p className="text-muted-foreground">No applications found</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-foreground pl-2">Applicants</h2>

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

              <div className="flex gap-3">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 flex-1 sm:flex-initial bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* Export Button */}
                <button className="inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors whitespace-nowrap">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
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
              const fullName = `${row.first_name} ${row.family_name}`
              const isLoading = loadingId === row.id
              return (
                <div
                  key={row.id}
                  className="rounded-xl border border-border bg-background/60 p-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-base font-semibold text-foreground leading-tight">{fullName}</p>
                  {getStatusBadge(row.status)}
                </div>

                {/* Contact */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate" title={row.email}>{row.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="truncate" title={row.mobile_e164}>{row.mobile_e164}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedApplicant(row)}
                    className="px-3 py-2 rounded-md text-xs font-medium bg-indigo-600 text-white active:scale-[0.99] transition-transform"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      Review
                    </div>
                  </button>
                  <button
                    onClick={() => handleApprove(row)}
                    disabled={isLoading}
                    className="px-3 py-2 rounded-md text-xs font-medium bg-green-600 text-white active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-transform"
                  >
                    <div className="flex items-center justify-center gap-1">
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Approve
                    </div>
                  </button>
                  <button
                    onClick={() => handleReject(row)}
                    disabled={isLoading}
                    className="px-3 py-2 rounded-md text-xs font-medium bg-red-600 text-white active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-transform"
                  >
                    <div className="flex items-center justify-center gap-1">
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                      Reject
                    </div>
                  </button>
                </div>
              </div>
              )
            })
          )}

          {filteredRows.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No results found{searchTerm ? ` for "${searchTerm}"` : ''}
            </div>
          )}
        </div>

        {/* Desktop Table (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b-2 border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingPage ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <tr key={i} className="border-b border-border animate-pulse">
                    <td className="px-6 py-5"><div className="h-4 bg-muted rounded w-24" /></td>
                    <td className="px-6 py-5"><div className="h-4 bg-muted rounded w-32" /></td>
                    <td className="px-6 py-5"><div className="h-4 bg-muted rounded w-40" /></td>
                    <td className="px-6 py-5"><div className="h-4 bg-muted rounded w-28" /></td>
                    <td className="px-6 py-5"><div className="h-4 bg-muted rounded w-20" /></td>
                    <td className="px-6 py-5"><div className="h-5 bg-muted rounded-full w-20" /></td>
                    <td className="px-6 py-5 text-right"><div className="h-8 bg-muted rounded w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : (
                paginatedRows.map((row, index) => {
                  const isEven = index % 2 === 0
                  return (
                  <tr
                    key={row.id}
                    className={`border-b border-border hover:bg-muted/50 transition-colors ${
                      isEven ? 'bg-background' : 'bg-muted/20'
                    }`}
                  >
                    <td className="px-6 py-5 text-sm text-foreground">
                      {new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-foreground">
                      {row.first_name} {row.family_name}
                    </td>
                    <td className="px-6 py-5 text-sm text-foreground">
                      {row.email}
                    </td>
                    <td className="px-6 py-5 text-sm text-foreground">
                      {row.mobile_e164}
                    </td>
                    <td className="px-6 py-5 text-sm text-foreground">
                      {row.id_type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(row.status)}
                    </td>
                    <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => setSelectedApplicant(row)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs md:text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </button>
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
            Showing {startIndex + 1}-{Math.min(endIndex, filteredRows.length)} of {filteredRows.length} applicants
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
      </div>

      {/* Review Drawer */}
      {selectedApplicant && (
        <ReviewDrawer
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
        />
      )}
    </>
  )
}

