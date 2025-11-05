'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './ui/button'

interface ManualWeightEntryProps {
  errorMessage: string
  errorSuggestion: string
  onSubmit: (weight: number) => void
  onCancel: () => void
}

export function ManualWeightEntry({
  errorMessage,
  errorSuggestion,
  onSubmit,
  onCancel
}: ManualWeightEntryProps) {
  const [manualWeight, setManualWeight] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleSubmit = () => {
    const weight = parseFloat(manualWeight)
    
    // Validate weight
    if (!manualWeight || isNaN(weight)) {
      setValidationError('Please enter a valid weight')
      return
    }
    
    if (weight < 30 || weight > 300) {
      setValidationError('Weight must be between 30 and 300 kg')
      return
    }
    
    onSubmit(weight)
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
      <div className="space-y-3">
        {/* Error Message */}
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">{errorMessage}</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{errorSuggestion}</p>
          </div>
        </div>

        {/* Manual Entry Form */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
            Enter weight manually:
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={manualWeight}
              onChange={(e) => {
                setManualWeight(e.target.value)
                setValidationError('')
              }}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. 75.5"
            />
            <Button onClick={handleSubmit} className="whitespace-nowrap">
              Continue
            </Button>
          </div>
          
          {validationError && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {validationError}
            </p>
          )}
        </div>

        {/* Cancel/Retry Options */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onCancel}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
          >
            Try taking another photo
          </button>
        </div>
      </div>
    </div>
  )
}

