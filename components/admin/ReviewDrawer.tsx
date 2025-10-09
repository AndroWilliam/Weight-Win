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
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              {applicant.first_name} {applicant.family_name}
            </h2>
            <p className="text-sm text-neutral-600">Application Review</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <section>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Personal Information</h3>
            <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-600 font-medium">First Name</p>
                  <p className="text-sm text-neutral-900">{applicant.first_name}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600 font-medium">Family Name</p>
                  <p className="text-sm text-neutral-900">{applicant.family_name}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-600 font-medium">Email</p>
                <p className="text-sm text-neutral-900">{applicant.email}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-600 font-medium">Phone</p>
                <p className="text-sm text-neutral-900">{applicant.mobile_e164}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-600 font-medium">ID Type</p>
                  <p className="text-sm text-neutral-900">{applicant.id_type}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600 font-medium">ID Number</p>
                  <p className="text-sm text-neutral-900">{applicant.id_number}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-600 font-medium">Applied</p>
                <p className="text-sm text-neutral-900">
                  {new Date(applicant.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </section>

          {/* Documents */}
          <section>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Documents</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                <span className="ml-2 text-sm text-neutral-600">Loading documents...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* CV */}
                <div className="border border-neutral-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">CV / Resume</p>
                      <p className="text-xs text-neutral-600">{applicant.cv_file_path}</p>
                    </div>
                  </div>
                  {fileUrls.cvUrl ? (
                    <a
                      href={fileUrls.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </a>
                  ) : (
                    <span className="text-xs text-red-600">Not available</span>
                  )}
                </div>

                {/* ID Document */}
                <div className="border border-neutral-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <IdCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">ID Document</p>
                      <p className="text-xs text-neutral-600">{applicant.id_file_path}</p>
                    </div>
                  </div>
                  {fileUrls.idUrl ? (
                    <a
                      href={fileUrls.idUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </a>
                  ) : (
                    <span className="text-xs text-red-600">Not available</span>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Status & OCR */}
          <section>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Status</h3>
            <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
              <div>
                <p className="text-xs text-neutral-600 font-medium">Application Status</p>
                <p className="text-sm text-neutral-900 capitalize">{applicant.status}</p>
              </div>
            </div>
          </section>

          {/* Actions (Coming Soon) */}
          <section>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Actions</h3>
            <div className="flex gap-3">
              <button
                disabled
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
              >
                Approve (Coming Soon)
              </button>
              <button
                disabled
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
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

