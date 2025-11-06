'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)
      
      // Hide "reconnected" message after 3 seconds
      setTimeout(() => {
        setShowReconnected(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowReconnected(false)
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Don't render anything if online and not showing reconnected message
  if (isOnline && !showReconnected) {
    return null
  }

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-3 z-50 shadow-lg">
          <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto">
            <WifiOff className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 text-center">
              <p className="text-sm font-medium">
                You're offline
              </p>
              <p className="text-xs opacity-90 mt-0.5">
                Some features may not work until you reconnect
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reconnected Banner */}
      {showReconnected && isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-green-600 text-white px-4 py-3 z-50 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto">
            <Wifi className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Back online!
            </p>
          </div>
        </div>
      )}
    </>
  )
}

