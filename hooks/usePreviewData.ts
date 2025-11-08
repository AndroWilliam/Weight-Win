'use client'

import { useEffect, useState } from 'react'
import { 
  getPreviewData, 
  savePreviewData, 
  updatePreviewData as updateCookieData,
  clearPreviewData 
} from '@/lib/preview/previewCookies'
import { PreviewData, DEFAULT_PREVIEW_DATA } from '@/lib/preview/previewData'

/**
 * Hook to manage preview data in cookies
 */
export function usePreviewData() {
  const [data, setData] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const previewData = getPreviewData()
    setData(previewData)
    setLoading(false)
  }, [])

  const updateData = (updates: Partial<PreviewData>) => {
    const currentData = data || DEFAULT_PREVIEW_DATA
    const updatedData = { ...currentData, ...updates }
    setData(updatedData)
    savePreviewData(updatedData)
  }

  const clearData = () => {
    setData(null)
    clearPreviewData()
  }

  const initializeData = () => {
    const newData = {
      ...DEFAULT_PREVIEW_DATA,
      sessionStarted: new Date().toISOString()
    }
    setData(newData)
    savePreviewData(newData)
  }

  return {
    data,
    loading,
    updateData,
    clearData,
    initializeData
  }
}


