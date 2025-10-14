'use client'

import { useState, useEffect } from 'react'
import { X, FileText, IdCard, Loader2, ExternalLink } from 'lucide-react'

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

interface ReviewDrawerProps {
  applicant: Applicant
  onClose: () => void
}

interface FileUrls {
  cvUrl: string | null
  idUrl: string | null
}

export function ReviewDrawer({ applicant, onClose }: ReviewDrawerProps) {
  const [fileUrls, setFileUrls] = useState<FileUrls>({ cvUrl: null, idUrl: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFileUrls() {
      try {
        const response = await fetch(`/api/admin/applicants/${applicant.id}/files`)
        const data = await response.json()
        
        if (data.success) {
          setFileUrls({
            cvUrl: data.cvUrl,
            idUrl: data.idUrl
          })
        }
      } catch (error) {
        console.error('[Review Drawer] Error fetching file URLs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFileUrls()
  }, [applicant.id])

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:max-w-2xl bg-background shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-border">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {applicant.first_name} {applicant.family_name}
            </h2>
            <p className="text-sm text-muted-foreground">Application Review</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">Personal Information</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">First Name</p>
                  <p className="text-sm text-foreground">{applicant.first_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Family Name</p>
                  <p className="text-sm text-foreground">{applicant.family_name}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Email</p>
                <p className="text-sm text-foreground">{applicant.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Phone</p>
                <p className="text-sm text-foreground">{applicant.mobile_e164}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">ID Type</p>
                  <p className="text-sm text-foreground">{applicant.id_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">ID Number</p>
                  <p className="text-sm text-foreground">{applicant.id_number}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Applied</p>
                <p className="text-sm text-foreground">
                  {new Date(applicant.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </section>

          {/* Documents */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">Documents</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Loading documents...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* CV */}
                <div className="border border-border rounded-lg p-4 flex items-center justify-between bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-400/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">CV / Resume</p>
                      <p className="text-xs text-muted-foreground">{applicant.cv_file_path}</p>
                    </div>
                  </div>
                  {fileUrls.cvUrl ? (
                    <a
                      href={fileUrls.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </a>
                  ) : (
                    <span className="text-xs text-red-500 dark:text-red-400">Not available</span>
                  )}
                </div>

                {/* ID Document */}
                <div className="border border-border rounded-lg p-4 flex items-center justify-between bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 dark:bg-green-400/20 rounded-lg flex items-center justify-center">
                      <IdCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">ID Document</p>
                      <p className="text-xs text-muted-foreground">{applicant.id_file_path}</p>
                    </div>
                  </div>
                  {fileUrls.idUrl ? (
                    <a
                      href={fileUrls.idUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </a>
                  ) : (
                    <span className="text-xs text-red-500 dark:text-red-400">Not available</span>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Status & OCR */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">Status</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Application Status</p>
                <p className="text-sm text-foreground capitalize">{applicant.status}</p>
              </div>
            </div>
          </section>

          {/* Actions (Coming Soon) */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">Actions</h3>
            <div className="flex gap-3">
              <button
                disabled
                className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
              >
                Approve (Coming Soon)
              </button>
              <button
                disabled
                className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
              >
                Reject (Coming Soon)
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

