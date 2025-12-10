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

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? campaigns.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % campaigns.length)
  }

  return (
    <div className="relative">
      {/* Card */}
      <div className="mb-6 relative">
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

        {/* Navigation Arrows */}
        {campaigns.length > 1 && (
          <>
            {/* Left Arrow */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 hover:scale-110 z-10"
              aria-label="Previous campaign"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 hover:scale-110 z-10"
              aria-label="Next campaign"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
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
