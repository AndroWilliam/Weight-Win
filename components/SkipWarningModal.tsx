'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface SkipWarningModalProps {
  isOpen: boolean
  onBack: () => void  // Return to phone input
  onConfirmSkip: () => void  // Close all modals
}

export function SkipWarningModal({
  isOpen,
  onBack,
  onConfirmSkip
}: SkipWarningModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        {/* Warning Icon */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-[#F59E0B]" />
          </div>
          <DialogTitle className="text-2xl font-bold text-[#F59E0B] mb-2">
            ⚠️ Wait!
          </DialogTitle>
        </div>

        <DialogHeader className="space-y-3">
          <div className="text-center space-y-4">
            <p className="text-base font-semibold text-foreground">
              Without your mobile number, we cannot redeem your reward and get you the discount.
            </p>
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <p className="text-sm text-orange-900 dark:text-orange-200">
                BOLD Soccer needs to verify your eligibility for the 30% discount. Your phone number is required for redemption.
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={onBack}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold"
          >
            Enter Phone Number
          </Button>
          <Button
            onClick={onConfirmSkip}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            I Understand, Skip
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
