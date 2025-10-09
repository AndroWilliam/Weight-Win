'use client'

import { useState } from 'react'
import { Search, Eye, Download } from 'lucide-react'
import { ReviewDrawer } from './ReviewDrawer'

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

  // Client-side filters
  const filteredRows = rows.filter(row => {
    const matchesSearch = 
      row.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.family_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || row.status === statusFilter
    
    return matchesSearch && matchesStatus
  })


  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      in_review: 'bg-blue-100 text-blue-700',
      reviewing: 'bg-blue-100 text-blue-700',
    }
    
    const style = styles[status.toLowerCase() as keyof typeof styles] || 'bg-slate-100 text-slate-700'
    const displayStatus = status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
        {displayStatus}
      </span>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-600">No applications found</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Applicants</h2>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-1.5 w-64 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Export Button */}
              <button className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600">Submitted</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600">Full Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600">Email</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600">Mobile</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600">ID Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600">Status</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row) => (
                <tr 
                  key={row.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {row.first_name} {row.family_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {row.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {row.mobile_e164}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {row.id_type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(row.status)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedApplicant(row)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {filteredRows.length} of {rows.length} applicants
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled
              className="px-3 py-1 text-sm text-slate-400 cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              disabled
              className="px-3 py-1 text-sm bg-slate-900 text-white rounded cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredRows.length === 0 && searchTerm && (
          <div className="p-8 text-center text-slate-600">
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

