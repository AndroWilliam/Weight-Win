import { createClient } from '@supabase/supabase-js'

export type UploadProgressCB = (p: { loaded: number; total: number; pct: number }) => void

export async function uploadWithProgress(
  file: File,
  bucket: string,
  path: string,
  onProgress: UploadProgressCB
): Promise<{ path: string }> {
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { data: sess } = await supa.auth.getSession()
  const token = sess.session?.access_token
  if (!token) throw new Error('Not authenticated')

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURIComponent(path)}`
  
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('x-upsert', 'true')
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(xhr.responseText || `HTTP ${xhr.status}`))
      }
    }
    
    xhr.onerror = () => reject(new Error('Network error'))
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          pct: Math.round((e.loaded / e.total) * 100)
        })
      }
    }
    
    xhr.send(file)
  })
  
  return { path }
}
