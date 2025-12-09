'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Campaign, ParticipatingCampaign } from '@/hooks/useUserCampaigns'

interface CampaignDetailsModalProps {
  campaign: Campaign | ParticipatingCampaign | null
  isOpen: boolean
  onClose: () => void
  onJoin?: (campaignId: string) => Promise<void>
  isParticipating?: boolean
}

function isParticipatingCampaign(
  campaign: Campaign | ParticipatingCampaign
): campaign is ParticipatingCampaign {
  return 'days_completed' in campaign
}

export default function CampaignDetailsModal({
  campaign,
  isOpen,
  onClose,
  onJoin,
  isParticipating = false,
}: CampaignDetailsModalProps) {
  const [isJoining, setIsJoining] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  if (!isOpen || !campaign) return null

  const handleJoin = async () => {
    if (!onJoin || isParticipating) return

    try {
      setIsJoining(true)
      await onJoin(campaign.id)

      // Show success animation
      setShowSuccess(true)

      // Auto-close after 2 seconds
      setTimeout(() => {
        setShowSuccess(false)
        setIsJoining(false)
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Failed to join campaign:', error)
      setIsJoining(false)
    }
  }

  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-800">
        {/* Success Animation Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 bg-green-600 bg-opacity-95 flex items-center justify-center z-10 rounded-2xl">
            <div className="text-center">
              <div className="text-7xl mb-4 animate-bounce">✅</div>
              <h3 className="text-2xl font-bold text-white">Success!</h3>
              <p className="text-white opacity-90">
                You&apos;ve joined the campaign
              </p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isJoining}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white transition-colors z-20"
          aria-label="Close modal"
        >
          <span className="text-2xl">×</span>
        </button>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-800">
            {/* Logo */}
            <div className="flex-shrink-0 w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center">
              {campaign.partner.logo_url ? (
                <Image
                  src={campaign.partner.logo_url}
                  alt={campaign.partner.name}
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
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {campaign.name}
              </h2>
              <p className="text-gray-400">{campaign.partner.name}</p>
            </div>
          </div>

          {/* Participating Status */}
          {isParticipating && isParticipatingCampaign(campaign) && (
            <div className="mb-6 p-4 bg-green-600 bg-opacity-20 border border-green-600 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400 text-xl">✓</span>
                <span className="text-green-400 font-bold">
                  You&apos;re participating in this campaign
                </span>
              </div>
              <p className="text-sm text-gray-300">
                Day {campaign.days_completed}/{campaign.required_days} completed
              </p>
            </div>
          )}

          {/* Reward Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span>🎁</span>
              Your Reward
            </h3>
            <div className="p-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl">
              <p className="text-white font-medium">
                {campaign.reward_description}
              </p>
              {campaign.discount_percentage > 0 && (
                <p className="text-white text-opacity-90 text-sm mt-2">
                  {campaign.discount_percentage}% discount on{' '}
                  {campaign.partner.name}
                </p>
              )}
            </div>
          </div>

          {/* Requirements Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span>📋</span>
              Requirements
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3 text-gray-300">
                <span className="text-indigo-400 mt-1">•</span>
                <span>
                  Complete <strong>{campaign.required_days} days</strong> of
                  weight check-ins
                </span>
              </div>
              <div className="flex items-start gap-3 text-gray-300">
                <span className="text-indigo-400 mt-1">•</span>
                <span>Take a photo of your scale daily</span>
              </div>
              {campaign.require_phone && (
                <div className="flex items-start gap-3 text-gray-300">
                  <span className="text-indigo-400 mt-1">•</span>
                  <span>Submit phone number after completion</span>
                </div>
              )}
            </div>
          </div>

          {/* Duration Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span>⏰</span>
              Duration
            </h3>
            <div className="p-4 bg-gray-800 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Start Date</p>
                  <p className="text-white font-medium">
                    {formatDate(campaign.start_date)}
                  </p>
                </div>
                <div className="text-gray-600">→</div>
                <div>
                  <p className="text-sm text-gray-400">End Date</p>
                  <p className="text-white font-medium">
                    {formatDate(campaign.end_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          {campaign.terms_conditions && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span>📜</span>
                Terms &amp; Conditions
              </h3>
              <div className="p-4 bg-gray-800 rounded-xl text-sm text-gray-300 whitespace-pre-wrap">
                {campaign.terms_conditions}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isParticipating && campaign.status === 'active' && onJoin && (
            <div className="flex gap-3 mt-8">
              <button
                onClick={onClose}
                disabled={isJoining}
                className="flex-1 px-6 py-3 rounded-xl font-medium bg-gray-800 hover:bg-gray-700 text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="flex-1 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? 'Joining...' : 'Confirm Join'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
