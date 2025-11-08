'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { usePreviewData } from '@/hooks/usePreviewData'
import { transferPreviewDataToSupabase } from '@/lib/preview/previewTransfer'

export default function PreviewConfirmationPage() {
  const router = useRouter()
  const { data, clearData } = usePreviewData()
  
  const [transferring, setTransferring] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function transfer() {
      try {
        // Get current user
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        if (!data) {
          router.push('/dashboard')
          return
        }

        // Transfer data
        const result = await transferPreviewDataToSupabase(data, user.id)

        if (result.success) {
          setSuccess(true)
          // Clear preview cookie
          clearData()
        } else {
          setError(result.error || 'Failed to transfer data')
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setTransferring(false)
      }
    }

    transfer()
  }, [data, clearData, router])

  if (transferring) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600">Saving your demo data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-red-600 text-5xl">❌</div>
          <h1 className="text-2xl font-bold text-gray-900">
            Something went wrong
          </h1>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Success Icon */}
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ✨ Welcome to WeightWin! ✨
          </h1>
          <p className="text-gray-600">
            Your demo data has been saved!
          </p>
        </div>

        {/* Saved Items */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Weight entry ({data?.weight} {data?.weightUnit}) saved
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Scale photo saved
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              First Step badge unlocked
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Streak started (Day 1 🔥)
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-gray-700">
            Your 7-day journey starts now!
          </p>

          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>

          <button
            onClick={() => router.push('/consent')}
            className="text-sm text-blue-600 hover:underline"
          >
            Complete Profile Setup →
          </button>
        </div>
      </div>
    </div>
  )
}


