'use client'

import { PartnerForm } from './PartnerForm'

interface PartnerModalProps {
  partner: any | null
  onClose: () => void
  onSuccess: () => void
}

export function PartnerModal({ partner, onClose, onSuccess }: PartnerModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {partner ? 'Edit Partner' : 'Add Partner'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Form */}
        <PartnerForm
          partner={partner}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}

