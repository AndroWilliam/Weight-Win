'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PreviewNavigationProps {
  onPrevious?: () => void
  onNext?: () => void
  previousLabel?: string
  nextLabel?: string
  previousDisabled?: boolean
  nextDisabled?: boolean
  loading?: boolean
  className?: string
}

export function PreviewNavigation({
  onPrevious,
  onNext,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  previousDisabled = false,
  nextDisabled = false,
  loading = false,
  className = ''
}: PreviewNavigationProps) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {onPrevious ? (
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={previousDisabled || loading}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {previousLabel}
        </Button>
      ) : (
        <div /> // Spacer
      )}
      
      {onNext && (
        <Button
          onClick={onNext}
          disabled={nextDisabled || loading}
          className="flex items-center gap-2"
        >
          {nextLabel}
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}


