'use client'

import { useState, useEffect } from 'react'
import CampaignCard from './CampaignCard'
import { Campaign, ParticipatingCampaign } from '@/hooks/useUserCampaigns'

interface CampaignCarouselProps {
  campaigns: (Campaign | ParticipatingCampaign)[]
  onViewDetails: (campaign: Campaign | ParticipatingCampaign) => void
  onContinue: (campaign: ParticipatingCampaign) => void
  onJoin: (campaign: Campaign) => void
  onSubmitPhone: (campaign: ParticipatingCampaign) => void
}

function isParticipatingCampaign(
  campaign: Campaign | ParticipatingCampaign
): campaign is ParticipatingCampaign {
  return 'days_completed' in campaign
}

export default function CampaignCarousel({
  campaigns,
  onViewDetails,
  onContinue,
  onJoin,
  onSubmitPhone,
}: CampaignCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-rotation every 10 seconds
  useEffect(() => {
    if (campaigns.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length)
    }, 10000)

    return () => clearInterval(timer)
  }, [campaigns.length])

  // Empty state
  if (campaigns.length === 0) {
    return (
      <div className="h-80 rounded-xl bg-gray-900 bg-opacity-50 border border-gray-800 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-bold text-white mb-2">
          No Campaigns Available
        </h3>
        <p className="text-sm text-gray-400">
          Check back soon for new challenges!
        </p>
      </div>
    )
  }

  const currentCampaign = campaigns[currentIndex]
  const isParticipating = isParticipatingCampaign(currentCampaign)

  return (
    <div className="relative">
      {/* Card */}
      <div className="mb-6">
        <CampaignCard
          campaign={currentCampaign}
          isParticipating={isParticipating}
          onViewDetails={() => onViewDetails(currentCampaign)}
          onContinue={
            isParticipating
              ? () => onContinue(currentCampaign as ParticipatingCampaign)
              : undefined
          }
          onJoin={
            !isParticipating
              ? () => onJoin(currentCampaign as Campaign)
              : undefined
          }
          onSubmitPhone={
            isParticipating
              ? () => onSubmitPhone(currentCampaign as ParticipatingCampaign)
              : undefined
          }
        />
      </div>

      {/* Dot Navigation */}
      {campaigns.length > 1 && (
        <div className="flex justify-center items-center gap-2">
          {campaigns.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-indigo-500'
                  : 'w-2 bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to campaign ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
