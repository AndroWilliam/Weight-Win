'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePreviewData } from '@/hooks/usePreviewData'

export default function PreviewSignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data } = usePreviewData()
  
  const isReturning = searchParams.get('returning') === 'true'
  const [daysSinceDemo, setDaysSinceDemo] = useState(0)

  useEffect(() => {
    if (!data) {
      router.push('/')
      return
    }

    // Calculate days since demo
    if (data.sessionStarted) {
      const start = new Date(data.sessionStarted)
      const now = new Date()
      const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      setDaysSinceDemo(days)
    }
  }, [data, router])

  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          {isReturning ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900">
                👋 Welcome Back!
              </h1>
              <p className="text-gray-600">
                You&apos;ve already tried our demo!
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900">
                🎉 Demo Complete!
              </h1>
              <p className="text-gray-600">
                You&apos;ve experienced WeightWin!
              </p>
            </>
          )}
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Uploaded your first scale photo
            </p>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Saw AI extract your weight automatically
            </p>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Explored your dashboard and progress
            </p>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Earned your first reward badge
            </p>
          </div>
        </div>

        {/* Data Summary */}
        {isReturning && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              Your preview data is still waiting:
            </p>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Weight: {data.weight} {data.weightUnit}</li>
              <li>Scale photo saved</li>
              <li>First Step badge earned</li>
              {daysSinceDemo > 0 && (
                <li>Demo completed {daysSinceDemo} day{daysSinceDemo !== 1 ? 's' : ''} ago</li>
              )}
            </ul>
          </div>
        )}

        {/* Call to Action */}
        <div className="space-y-4">
          <p className="text-center text-gray-700">
            {isReturning 
              ? 'Ready to start your real journey and save this progress?'
              : 'Ready to start your real 7-day journey?'
            }
          </p>

          {!isReturning && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 text-center">
                ✅ Your demo data will be saved!<br />
                <span className="text-xs">
                  (Weight: {data.weight}kg, Photo, First Step badge)
                </span>
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push('/auth/login?from=preview')}
            >
              🚀 Create Free Account
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/auth/login?from=preview&returning=true')}
            >
              Already have an account? Log In
            </Button>
          </div>
        </div>

        {/* Back to Demo */}
        {!isReturning && (
          <div className="text-center">
            <button
              onClick={() => router.push('/preview/weight-check')}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              ← Back to Demo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


