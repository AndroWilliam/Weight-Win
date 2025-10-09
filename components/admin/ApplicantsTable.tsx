'use client'

import { useState } from 'react'
import { Search, Eye, Download, ChevronDown } from 'lucide-react'
import { ReviewDrawer } from './ReviewDrawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

  const getOCRBadge = (ocrStatus: string | null) => {
    if (!ocrStatus) return <span className="text-xs text-slate-400">N/A</span>
    
    const styles = {
      complete: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    }
    
    const style = styles[ocrStatus.toLowerCase() as keyof typeof styles] || 'bg-slate-100 text-slate-700'
    
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
        {ocrStatus.charAt(0).toUpperCase() + ocrStatus.slice(1)}
      </span>
    )
  }

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
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
        {displayStatus}
      </span>
    )
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-600">No applications found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Applicants</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                    <DropdownMenuRadioItem value="all">All Status</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="new">New</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="in_review">In Review</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="approved">Approved</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="rejected">Rejected</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submitted</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>ID Type</TableHead>
                <TableHead>OCR</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {row.first_name} {row.family_name}
                  </TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.mobile_e164}</TableCell>
                  <TableCell>
                    {row.id_type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </TableCell>
                  <TableCell>{getOCRBadge(row.ocr_status)}</TableCell>
                  <TableCell>{getStatusBadge(row.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedApplicant(row)} className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredRows.length === 0 && (
             <div className="p-8 text-center text-slate-600">
               No results found for "{searchTerm}"
             </div>
           )}

        </CardContent>
      </Card>

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

