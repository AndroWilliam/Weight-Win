'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function CampaignCard({ campaign, onRefresh }: any) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null)
  
  const statusColors: any = {
    active: 'bg-[#059669] text-white',
    scheduled: 'bg-[#F59E0B] text-black',
    paused: 'bg-[#E11D48] text-white',
    ended: 'bg-[#6B7280] text-white',
  }
  
  const formatDate = (start: string, end: string) => {
    const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${s} - ${e}`
  }
  
  const handleAction = async (action: string) => {
    setIsLoading(true)
    try {
      let endpoint = ''
      let method = 'POST'
      
      if (action === 'pause') endpoint = `/api/admin/campaigns/${campaign.id}/pause`
      if (action === 'activate') endpoint = `/api/admin/campaigns/${campaign.id}/activate`
      if (action === 'clone') endpoint = `/api/admin/campaigns/${campaign.id}/clone`
      if (action === 'archive') {
        endpoint = `/api/admin/campaigns/${campaign.id}`
        method = 'DELETE'
      }
      
      const res = await fetch(endpoint, { method })
      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message || `Campaign ${action}d successfully`)
        onRefresh()
        setConfirmDialog(null)
        if (action === 'clone' && data.data?.id) {
          router.push(`/admin/campaigns/${data.data.id}/edit`)
        }
      } else {
        toast.error(data.message || `Failed to ${action} campaign`)
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  
  const participantCount = campaign.participants?.[0]?.count || 0
  
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 hover:border-[#4F46E5] transition-all">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          {campaign.partner?.logo_url ? (
            <img src={campaign.partner.logo_url} alt={campaign.partner.name} className="w-20 h-20 rounded-xl object-cover" />
          ) : (
            <div 
              className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl"
              style={{ background: `linear-gradient(135deg, ${campaign.primary_color || '#4F46E5'}, ${campaign.secondary_color || '#4338CA'})` }}
            >
              {campaign.name.charAt(0)}
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white mb-1 truncate">{campaign.name}</h3>
          <p className="text-gray-400 text-sm mb-3">
            {campaign.partner?.name || 'Unknown Partner'} • {formatDate(campaign.start_date, campaign.end_date)} • {campaign.required_days}-day
          </p>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[campaign.status] || 'bg-gray-600 text-white'}`}>
              ● {campaign.status.toUpperCase()}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2a2a2a] text-gray-300">
              {participantCount} Participants
            </span>
            {campaign.phone_submissions > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2a2a2a] text-gray-300">
                {campaign.phone_submissions} Phone #s
              </span>
            )}
          </div>
          
          <p className="text-gray-300 text-sm line-clamp-2">{campaign.reward_description}</p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push(`/admin/campaigns/${campaign.id}/analytics`)}
            className="px-4 py-2 bg-[#4F46E5] text-white text-sm font-semibold rounded-lg hover:bg-[#4338CA] whitespace-nowrap"
          >
            📊 Analytics
          </button>
          <button
            onClick={() => router.push(`/admin/campaigns/${campaign.id}/edit`)}
            className="px-4 py-2 bg-[#2a2a2a] text-white text-sm font-semibold rounded-lg hover:bg-[#3a3a3a] border border-[#4F46E5] whitespace-nowrap"
          >
            ✏️ Edit
          </button>
          {campaign.status === 'active' && (
            <button
              onClick={() => setConfirmDialog('pause')}
              className="px-4 py-2 bg-[#2a2a2a] text-white text-sm font-semibold rounded-lg hover:bg-[#3a3a3a] border border-[#E11D48] whitespace-nowrap"
            >
              ⏸️ Pause
            </button>
          )}
          {(campaign.status === 'paused' || campaign.status === 'scheduled') && (
            <button
              onClick={() => setConfirmDialog('activate')}
              className="px-4 py-2 bg-[#2a2a2a] text-white text-sm font-semibold rounded-lg hover:bg-[#3a3a3a] border border-[#059669] whitespace-nowrap"
            >
              ▶️ {campaign.status === 'paused' ? 'Resume' : 'Start'}
            </button>
          )}
          <button
            onClick={() => setConfirmDialog('clone')}
            className="px-4 py-2 bg-[#2a2a2a] text-white text-sm font-semibold rounded-lg hover:bg-[#3a3a3a] border border-[#333] whitespace-nowrap"
          >
            📋 Clone
          </button>
        </div>
      </div>
      
      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              Confirm {confirmDialog.charAt(0).toUpperCase() + confirmDialog.slice(1)}
            </h3>
            <p className="text-gray-300 mb-6">
              {confirmDialog === 'pause' && `Pause "${campaign.name}"? Banner will be hidden.`}
              {confirmDialog === 'activate' && `Activate "${campaign.name}"? Campaign will go live.`}
              {confirmDialog === 'clone' && `Clone "${campaign.name}"? You'll edit the new campaign.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(confirmDialog)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA]"
              >
                {isLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

