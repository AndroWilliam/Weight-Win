'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function PartnerCard({ partner, onEdit, onRefresh }: any) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const campaignCount = partner.campaigns?.[0]?.count || 0
  
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/partners/${partner.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Partner deleted successfully')
        onRefresh()
        setShowDeleteDialog(false)
      } else {
        toast.error(data.message || 'Failed to delete partner')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsDeleting(false)
    }
  }
  
  const handleViewCampaigns = () => {
    router.push(`/admin/campaigns?partner_id=${partner.id}`)
  }
  
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 hover:border-[#4F46E5] transition-all">
      {/* Logo & Name */}
      <div className="flex items-start gap-4 mb-4">
        {partner.logo_url ? (
          <img 
            src={partner.logo_url} 
            alt={partner.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-2xl font-bold">
            {partner.name.charAt(0)}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white mb-1 truncate">
            {partner.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              partner.active 
                ? 'bg-[#059669] text-white' 
                : 'bg-[#6B7280] text-white'
            }`}>
              {partner.active ? '✓ Active' : '● Inactive'}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-[#2a2a2a] text-gray-300">
              {campaignCount} {campaignCount === 1 ? 'Campaign' : 'Campaigns'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Contact Info */}
      <div className="space-y-2 mb-4 text-sm">
        {partner.location && (
          <div className="flex items-center gap-2 text-gray-400">
            <span>📍</span>
            <span className="truncate">{partner.location}</span>
          </div>
        )}
        {partner.contact_email && (
          <div className="flex items-center gap-2 text-gray-400">
            <span>✉️</span>
            <span className="truncate">{partner.contact_email}</span>
          </div>
        )}
        {partner.contact_phone && (
          <div className="flex items-center gap-2 text-gray-400">
            <span>📞</span>
            <span>{partner.contact_phone}</span>
          </div>
        )}
        {partner.website && (
          <div className="flex items-center gap-2 text-gray-400">
            <span>🌐</span>
            <a 
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:text-[#4F46E5] transition-colors"
            >
              {partner.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>
      
      {/* Notes */}
      {partner.notes && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {partner.notes}
        </p>
      )}
      
      {/* Actions */}
      <div className="flex gap-2">
        {campaignCount > 0 && (
          <button
            onClick={handleViewCampaigns}
            className="flex-1 px-3 py-2 bg-[#4F46E5] text-white text-sm font-semibold rounded-lg hover:bg-[#4338CA] transition-colors"
          >
            View Campaigns
          </button>
        )}
        <button
          onClick={() => onEdit(partner)}
          className="flex-1 px-3 py-2 bg-[#2a2a2a] text-white text-sm font-semibold rounded-lg hover:bg-[#3a3a3a] border border-[#4F46E5] transition-colors"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="px-3 py-2 bg-[#2a2a2a] text-white text-sm font-semibold rounded-lg hover:bg-[#3a3a3a] border border-[#E11D48] transition-colors"
        >
          🗑️
        </button>
      </div>
      
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Delete Partner?</h3>
            <p className="text-gray-300 mb-2">
              Are you sure you want to delete <strong>{partner.name}</strong>?
            </p>
            {campaignCount > 0 && (
              <p className="text-red-400 text-sm mb-6">
                ⚠️ This partner has {campaignCount} active {campaignCount === 1 ? 'campaign' : 'campaigns'}. 
                You must end or archive all campaigns first.
              </p>
            )}
            {campaignCount === 0 && (
              <p className="text-gray-400 text-sm mb-6">
                This action cannot be undone.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || campaignCount > 0}
                className="flex-1 px-4 py-2 bg-[#E11D48] text-white rounded-lg hover:bg-[#BE123C] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

