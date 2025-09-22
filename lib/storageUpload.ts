import { createClient } from '@supabase/supabase-js'

export type UploadProgressCB = (p: { loaded: number; total: number; pct: number }) => void

export async function uploadWithProgress(
  file: File,
  bucket: string,
  path: string,
  onProgress: UploadProgressCB
): Promise<{ path: string }> {
  // For anonymous uploads, we'll use a server-side endpoint
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', bucket)
  formData.append('path', path)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          pct: Math.round((e.loaded / e.total) * 100)
        })
      }
    }
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve({ path: response.path })
        } catch (e) {
          reject(new Error('Invalid response from server'))
        }
      } else {
        reject(new Error(xhr.responseText || `HTTP ${xhr.status}`))
      }
    }
    
    xhr.onerror = () => reject(new Error('Network error'))
    
    xhr.open('POST', '/api/upload/anonymous')
    xhr.send(formData)
  })
}
