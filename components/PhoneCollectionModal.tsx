'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Check } from 'lucide-react'

interface PhoneCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (phoneNumber: string, campaignId?: string) => Promise<void>
  onSkip: () => void
  campaignName?: string
  campaignId?: string
  rewardDescription?: string
}

export function PhoneCollectionModal({
  isOpen,
  onClose,
  onSubmit,
  onSkip,
  campaignName,
  campaignId,
  rewardDescription
}: PhoneCollectionModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('+20')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Phone validation: +20 followed by exactly 9 digits
  const validatePhone = (phone: string): boolean => {
    return /^\+20\d{9}$/.test(phone)
  }

  const handleSubmit = async () => {
    setError(null)

    // Validate format
    if (!validatePhone(phoneNumber)) {
      setError('Invalid phone format. Must be +20 followed by 9 digits.')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(phoneNumber, campaignId)

      // Show success state
      setShowSuccess(true)

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 2000)
    } catch (error: any) {
      setError(error.message || 'Failed to save phone number')
      setIsSubmitting(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Ensure it starts with +20
    if (!value.startsWith('+20')) {
      setPhoneNumber('+20')
      return
    }

    // Only allow +20 followed by digits (max 12 characters: +20 + 9 digits)
    if (value.length <= 12 && /^\+20\d*$/.test(value)) {
      setPhoneNumber(value)
      setError(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit()
    }
  }

  // Handle ESC key to trigger skip warning
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showSuccess) {
        onSkip()
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [isOpen, showSuccess, onSkip])

  // Success State
  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-2">
              ✅ Phone Number Submitted!
            </h3>
            <p className="text-green-700 dark:text-green-400">
              {campaignName 
                ? `We'll contact you soon with your ${campaignName} reward details.`
                : "We'll contact you soon with your discount details."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" aria-labelledby="phone-modal-title" aria-describedby="phone-modal-description">
        {/* Header with BOLD Soccer gradient */}
        <div className="bg-gradient-to-br from-[#F59E0B] to-[#EF4444] rounded-t-lg -mx-6 -mt-6 px-6 pt-6 pb-4 mb-4">
          <div className="text-center">
            <div className="text-5xl mb-2" role="img" aria-label="Celebration">🎉</div>
            <h2 id="phone-modal-title" className="text-2xl font-bold text-black mb-1">
              Congratulations!
            </h2>
            <p className="text-black/85 text-base">
              You completed the 7-day challenge!
            </p>
          </div>
        </div>

        <DialogHeader className="space-y-3">
          <div className="text-center">
            {campaignName && (
              <div className="bg-muted rounded-lg p-3 mb-3">
                <p className="text-xs text-muted-foreground mb-1">Campaign</p>
                <p className="text-sm font-semibold text-foreground">{campaignName}</p>
              </div>
            )}
            <p className="text-lg font-semibold text-foreground mb-2">
              {rewardDescription || "You've unlocked an exclusive reward!"}
            </p>
            <p id="phone-modal-description" className="text-sm text-muted-foreground">
              Enter your phone number and we'll contact you with your exclusive offer.
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Phone Input */}
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+20XXXXXXXXXX"
              value={phoneNumber}
              onChange={handlePhoneChange}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
              className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              +20 followed by 9 digits
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || phoneNumber.length !== 12}
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
            <Button
              onClick={onSkip}
              disabled={isSubmitting}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
