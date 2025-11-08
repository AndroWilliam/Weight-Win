'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PreviewTooltipProps {
  title: string
  description: string
  onDismiss: () => void
  className?: string
}

export function PreviewTooltip({ 
  title, 
  description, 
  onDismiss,
  className = ''
}: PreviewTooltipProps) {
  return (
    <div className={`bg-white border-2 border-blue-500 rounded-lg p-4 shadow-xl ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💡</span>
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {description}
          </p>
        </div>
        
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss tooltip"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <Button 
        onClick={onDismiss}
        className="w-full"
      >
        Got it! →
      </Button>
    </div>
  )
}


