'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface ExportButtonProps {
  campaignId: string
  campaignName: string
}

export function ExportButton({ campaignId, campaignName }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  
  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/export`)
      
      if (!res.ok) {
        throw new Error('Export failed')
      }
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${campaignName.toLowerCase().replace(/\s+/g, '-')}-participants.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Export downloaded successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }
  
  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="px-4 py-2 bg-[#10B981] text-white font-semibold rounded-lg hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          Exporting...
        </>
      ) : (
        <>
          📥 Export CSV
        </>
      )}
    </button>
  )
}

