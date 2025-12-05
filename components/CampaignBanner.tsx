'use client'

import { useState, useEffect } from 'react'
import { useCampaigns } from '@/hooks/useCampaigns'
import { trackCampaignClick, joinCampaign, canJoinCampaign } from '@/lib/helpers/campaign-tracker'
import { toast } from 'sonner'

interface CampaignBannerProps {
  userId: string
}

export function CampaignBanner({ userId }: CampaignBannerProps) {
  const { campaigns, isLoading } = useCampaigns()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isJoining, setIsJoining] = useState(false)
  
  // Feature flag check
  const featureFlagEnabled = process.env.NEXT_PUBLIC_BOLD_CAMPAIGN_ENABLED === 'true'
  
  if (!featureFlagEnabled || isLoading) return null
  if (campaigns.length === 0) return null
  
  const campaign = campaigns[currentIndex]
  
  // Rotate campaigns every 10 seconds if multiple
  useEffect(() => {
    if (campaigns.length <= 1) return
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % campaigns.length)
    }, 10000)
    
    return () => clearInterval(timer)
  }, [campaigns.length])
  
  const handleClick = async () => {
    // Track click
    await trackCampaignClick(campaign.id, userId)
    
    // Check eligibility
    setIsJoining(true)
    const { can_join, reason } = await canJoinCampaign(campaign.id, userId)
    
    if (!can_join) {
      toast.error(reason || 'You cannot join this campaign')
      setIsJoining(false)
      return
    }
    
    // Join campaign
    const result = await joinCampaign(campaign.id, userId)
    
    if (result.success) {
      toast.success('Campaign joined! Start your challenge now! 🎉')
    } else {
      toast.error(result.message || 'Failed to join campaign')
    }
    
    setIsJoining(false)
  }
  
  return (
    <div className="mb-6">
      {/* Desktop Banner */}
      <div
        className="hidden md:block relative rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
        onClick={handleClick}
        style={{
          background: campaign.banner_bg_url
            ? `url(${campaign.banner_bg_url}) center/cover`
            : `linear-gradient(135deg, ${campaign.primary_color}, ${campaign.secondary_color})`
        }}
      >
        {campaign.banner_bg_url && (
          <div className="absolute inset-0 bg-black/40" />
        )}
        
        <div className="relative p-8 flex items-center gap-6">
          {/* Partner Logo */}
          {(campaign.banner_logo_url || campaign.partner.logo_url) && (
            <img
              src={campaign.banner_logo_url || campaign.partner.logo_url || ''}
              alt={campaign.partner.name}
              className="w-24 h-24 rounded-xl object-cover bg-white/90 p-2"
            />
          )}
          
          {/* Content */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">
              {campaign.banner_heading}
            </h3>
            <p className="text-white/90 text-lg mb-4">
              {campaign.banner_body}
            </p>
            <button
              disabled={isJoining}
              className="px-6 py-3 bg-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
              style={{ color: campaign.primary_color }}
            >
              {isJoining ? 'Joining...' : campaign.cta_text}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Banner */}
      <div
        className="md:hidden relative rounded-2xl overflow-hidden cursor-pointer"
        onClick={handleClick}
        style={{
          background: campaign.banner_bg_url
            ? `url(${campaign.banner_bg_url}) center/cover`
            : `linear-gradient(135deg, ${campaign.primary_color}, ${campaign.secondary_color})`
        }}
      >
        {campaign.banner_bg_url && (
          <div className="absolute inset-0 bg-black/40" />
        )}
        
        <div className="relative p-6 text-center">
          {(campaign.banner_logo_url || campaign.partner.logo_url) && (
            <img
              src={campaign.banner_logo_url || campaign.partner.logo_url || ''}
              alt={campaign.partner.name}
              className="w-16 h-16 mx-auto mb-4 rounded-lg object-cover bg-white/90 p-1"
            />
          )}
          
          <h3 className="text-xl font-bold text-white mb-2">
            {campaign.banner_heading}
          </h3>
          <p className="text-white/90 text-sm mb-4">
            {campaign.banner_body}
          </p>
          <button
            disabled={isJoining}
            className="px-6 py-2 bg-white font-bold rounded-lg text-sm disabled:opacity-50"
            style={{ color: campaign.primary_color }}
          >
            {isJoining ? 'Joining...' : campaign.cta_text}
          </button>
        </div>
      </div>
      
      {/* Campaign Indicator (if multiple) */}
      {campaigns.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {campaigns.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

