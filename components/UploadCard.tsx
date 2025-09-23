'use client'

import { useState } from 'react'
import { uploadWithProgress } from '@/lib/storageUpload'
import { useFormContext } from 'react-hook-form'
import { createClient } from '@supabase/supabase-js'
import { APPLICANT_BUCKET } from '@/lib/supabase/constants'
import { Loader2, FileText, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function UploadCard({
  formFieldName, // 'cvPath' | 'idPath'
  title, // string (dynamic for ID/Passport)
  accept, // 'application/pdf,image/*'
  prefix, // userId prefix will be added internally
}: {
  formFieldName: 'cvPath' | 'idPath'
  title: string
  accept: string
  prefix: 'cv' | 'id'
}) {
  const { setValue } = useFormContext()
  const [state, setState] = useState<'idle' | 'uploading' | 'scanning' | 'success' | 'error'>('idle')
  const [pct, setPct] = useState(0)
  const [path, setPath] = useState<string>()
  const [preview, setPreview] = useState<string>() // signed URL
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return

    // Check file size (10MB max)
    if (f.size > 10 * 1024 * 1024) {
      setState('error')
      setErrorMessage('File too large. Maximum size is 10MB.')
      return
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(f.type)) {
      setState('error')
      setErrorMessage('Invalid file type. Please upload PDF, JPG, or PNG.')
      return
    }

    setState('uploading')
    setPct(0)
    setErrorMessage(undefined)

    // Generate a unique path for anonymous uploads
    const ext = f.name.split('.').pop()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const p = `anonymous/${prefix}-${timestamp}-${randomId}.${ext}`

    try {
      await uploadWithProgress(f, APPLICANT_BUCKET, p, ({ pct }) => setPct(pct))
      setPath(p)
      setValue(formFieldName, p, { shouldValidate: true, shouldDirty: true })

      // Create preview using server-side signed URL
      const previewResponse = await fetch('/api/upload/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket: APPLICANT_BUCKET, path: p })
      })
      
      if (previewResponse.ok) {
        const { signedUrl } = await previewResponse.json()
        setPreview(signedUrl)
      }

      setState('scanning')

      // Call OCR
      const ocrResponse = await fetch(`/api/ocr/${prefix === 'cv' ? 'cv' : 'id'}`, {
        method: 'POST',
        body: JSON.stringify({ path: p }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!ocrResponse.ok) {
        throw new Error('OCR processing failed')
      }

      setState('success')
      // Auto-open preview after successful processing
      setIsPreviewOpen(true)
    } catch (e) {
      console.error('Upload error:', e)
      setState('error')
      setErrorMessage(e instanceof Error ? e.message : 'Upload failed. Please try again.')
    }
  }

  const getStateStyles = () => {
    switch (state) {
      case 'success':
        return 'border-emerald-500 bg-emerald-50'
      case 'error':
        return 'border-rose-500 bg-rose-50'
      case 'uploading':
      case 'scanning':
        return 'border-blue-300 bg-blue-50'
      default:
        return 'border-dashed border-slate-300 bg-slate-50'
    }
  }

  const isPdf = preview?.includes('pdf') || path?.toLowerCase().endsWith('.pdf')

  return (
    <div className={`rounded-xl border-2 ${getStateStyles()} p-6 transition-all duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-slate-900">{title}</h3>
        {state === 'uploading' && (
          <span className="text-sm text-blue-600 font-medium">{pct}%</span>
        )}
        {state === 'scanning' && (
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        )}
        {state === 'success' && (
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        )}
        {state === 'error' && (
          <AlertCircle className="w-4 h-4 text-rose-600" />
        )}
      </div>

      {state === 'idle' && (
        <label className="inline-flex cursor-pointer">
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={onPick}
          />
          <span className="px-4 py-2 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors">
            Upload file
          </span>
        </label>
      )}

      {state === 'uploading' && (
        <div className="space-y-2">
          <div className="h-2 rounded bg-slate-200">
            <div
              className="h-2 rounded bg-blue-600 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm text-slate-600">
            Uploading... {Math.round((pct / 100) * 10) / 10}MB of 10MB max
          </p>
        </div>
      )}

      {state === 'scanning' && (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <p className="text-sm text-slate-600">Running OCR...</p>
        </div>
      )}

      {state === 'success' && (
        <div className="flex items-center gap-3">
          {isPdf ? (
            <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-md">
              <FileText className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-700">{path?.split('/').pop()}</span>
            </div>
          ) : (
            <img
              src={preview}
              alt="preview"
              className="h-14 w-14 rounded object-cover border border-slate-200"
            />
          )}
          <div className="flex-1">
            <p className="text-sm text-emerald-700 font-medium">Key details extracted</p>
            <p className="text-xs text-slate-500">Document processed successfully</p>
          </div>
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-sm"
          >
            Preview
          </button>
          <label className="inline-flex cursor-pointer">
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={onPick}
            />
            <span className="px-3 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-sm">
              Replace
            </span>
          </label>
        </div>
      )}

      {state === 'error' && (
        <div className="space-y-2">
          <p className="text-sm text-rose-600">{errorMessage}</p>
          <label className="inline-flex cursor-pointer">
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={onPick}
            />
            <span className="px-3 py-1 rounded border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors text-sm">
              Retry
            </span>
          </label>
        </div>
      )}
    </div>
    
    {/* Preview dialog */}
    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Document preview</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          {isPdf ? (
            <iframe
              src={preview}
              className="w-full h-[70vh] rounded border"
              title="PDF preview"
            />
          ) : (
            <img src={preview} alt="Document preview" className="w-full max-h-[70vh] object-contain rounded border" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
