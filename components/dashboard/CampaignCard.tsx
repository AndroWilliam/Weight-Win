'use client'

import Image from 'next/image'
import { Campaign, ParticipatingCampaign } from '@/hooks/useUserCampaigns'

interface CampaignCardProps {
  campaign: Campaign | ParticipatingCampaign
  isParticipating: boolean
  onViewDetails: () => void
  onContinue?: () => void
  onJoin?: () => void
  onSubmitPhone?: () => void
}

function isParticipatingCampaign(
  campaign: Campaign | ParticipatingCampaign
): campaign is ParticipatingCampaign {
  return 'days_completed' in campaign
}

export default function CampaignCard({
  campaign,
  isParticipating,
  onViewDetails,
  onContinue,
  onJoin,
  onSubmitPhone,
}: CampaignCardProps) {
  // Calculate state
  const isEnded = campaign.status === 'ended'
  const isCompleted =
    isParticipatingCampaign(campaign) &&
    campaign.days_completed >= campaign.required_days
  const needsPhone =
    isCompleted &&
    isParticipatingCampaign(campaign) &&
    !campaign.phone_submitted

  // Calculate progress
  const daysCompleted = isParticipatingCampaign(campaign)
    ? campaign.days_completed
    : 0
  const progress = Math.min(
    (daysCompleted / campaign.required_days) * 100,
    100
  )

  // Determine card style
  const getCardStyle = () => {
    if (isEnded) {
      return {
        background: 'linear-gradient(135deg, #6B7280, #374151)',
        badge: { text: '⏹️ ENDED', color: 'bg-gray-700' },
      }
    }
    if (needsPhone) {
      return {
        background: 'linear-gradient(135deg, #10B981, #059669)',
        badge: { text: '✅ READY', color: 'bg-green-600' },
      }
    }
    if (isParticipating) {
      return {
        background: 'linear-gradient(135deg, #10B981, #059669)',
        badge: { text: '✓ PARTICIPATING', color: 'bg-green-600' },
      }
    }
    return {
      background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
      badge: { text: '🆕 NEW CAMPAIGN', color: 'bg-orange-600' },
    }
  }

  const cardStyle = getCardStyle()

  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-xl"
      style={{ background: cardStyle.background }}
    >
      {/* Card Content */}
      <div className="p-6 md:p-8 text-white">
        {/* Badge */}
        <div className="mb-6">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${cardStyle.badge.color} text-white`}
          >
            {cardStyle.badge.text}
          </span>
        </div>

        {/* Logo + Title */}
        <div className="flex items-start gap-4 mb-6">
          {/* Logo */}
          <div className="flex-shrink-0 w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            {campaign.banner_logo_url ? (
              <Image
                src={campaign.banner_logo_url}
                alt={campaign.partner_name}
                width={64}
                height={64}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <span className="text-3xl">🎯</span>
            )}
          </div>

          {/* Name + Partner */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-xl font-bold mb-1 line-clamp-2">
              {campaign.name}
            </h3>
            <p className="text-sm text-white text-opacity-90">
              {campaign.partner_name}
            </p>
          </div>
        </div>

        {/* Progress Bar (for participating campaigns) */}
        {isParticipating && !isEnded && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold">
                Day {daysCompleted}/{campaign.required_days}
              </span>
              <span className="text-sm font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-white bg-opacity-20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Description (for available campaigns) */}
        {!isParticipating && !isEnded && (
          <div className="mb-6">
            <p className="text-sm text-white text-opacity-90 line-clamp-3">
              {campaign.banner_body}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {/* View Details Button */}
          <button
            onClick={onViewDetails}
            disabled={isEnded}
            className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
              isEnded
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm hover:-translate-y-1'
            }`}
          >
            View Details
          </button>

          {/* Action Button */}
          {needsPhone && onSubmitPhone && (
            <button
              onClick={onSubmitPhone}
              className="flex-1 px-4 py-3 bg-white text-green-600 rounded-xl font-bold text-sm hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              Submit Phone
            </button>
          )}

          {isParticipating && !needsPhone && !isEnded && onContinue && (
            <button
              onClick={onContinue}
              className="flex-1 px-4 py-3 bg-white text-green-600 rounded-xl font-bold text-sm hover:-translate-y-1 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
            >
              Continue
              <span className="text-lg">→</span>
            </button>
          )}

          {!isParticipating && !isEnded && onJoin && (
            <button
              onClick={onJoin}
              className="flex-1 px-4 py-3 bg-white text-orange-600 rounded-xl font-bold text-sm hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              Join Challenge
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
