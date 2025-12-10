'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useUserCampaigns, Campaign, ParticipatingCampaign } from '@/hooks/useUserCampaigns'
import CampaignCarousel from './CampaignCarousel'
import CampaignDetailsModal from './CampaignDetailsModal'

export default function CampaignWidget() {
  const { participating, available, isLoading, isError, refresh } = useUserCampaigns()

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | ParticipatingCampaign | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false)
  const [selectedCampaignForPhone, setSelectedCampaignForPhone] = useState<ParticipatingCampaign | null>(null)

  // Combine campaigns (participating first)
  const allCampaigns = [...participating, ...available]

  // Handle view details
  const handleViewDetails = (campaign: Campaign | ParticipatingCampaign) => {
    setSelectedCampaign(campaign)
    setIsModalOpen(true)
  }

  // Handle continue (scroll to progress)
  const handleContinue = () => {
    const progressSection = document.getElementById('progress-section')
    if (progressSection) {
      progressSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Handle join campaign
  const handleJoin = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setIsModalOpen(true)
  }

  // Handle confirm join
  const handleConfirmJoin = async (campaignId: string) => {
    try {
      const res = await fetch('/api/campaigns/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ campaign_id: campaignId }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to join campaign')
      }

      // Refresh campaigns list
      await refresh()

      // Toast will show after modal closes
      setTimeout(() => {
        toast.success('Successfully joined campaign!', {
          description: 'Start your daily check-ins to earn your reward.',
        })
      }, 2100)
    } catch (error) {
      console.error('Join campaign error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to join campaign')
      throw error
    }
  }

  // Handle submit phone
  const handleSubmitPhone = (campaign: ParticipatingCampaign) => {
    setSelectedCampaignForPhone(campaign)
    setPhoneNumber('')
    setIsPhoneModalOpen(true)
  }

  // Handle confirm phone submission
  const handleConfirmPhoneSubmit = async () => {
    if (!selectedCampaignForPhone || !phoneNumber.trim()) {
      toast.error('Please enter a valid phone number')
      return
    }

    try {
      setIsSubmittingPhone(true)

      const res = await fetch('/api/campaigns/submit-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_campaign_id: selectedCampaignForPhone.participation_id,
          phone_number: phoneNumber.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to submit phone number')
      }

      // Refresh campaigns list
      await refresh()

      // Close modal and show success
      setIsPhoneModalOpen(false)
      setPhoneNumber('')
      setSelectedCampaignForPhone(null)

      toast.success('Phone number submitted!', {
        description: 'You will receive your reward soon.',
      })
    } catch (error) {
      console.error('Submit phone error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit phone number')
    } finally {
      setIsSubmittingPhone(false)
    }
  }

  // Handle retry on error
  const handleRetry = () => {
    refresh()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-900 bg-opacity-50 rounded-xl border border-gray-800 p-6">
        <div className="h-7 w-40 bg-gray-800 rounded animate-pulse mb-6" />
        <div className="h-80 bg-gray-800 rounded-xl animate-pulse" />
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-gray-900 bg-opacity-50 rounded-xl border border-gray-800 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
          <span>🎯</span>
          Your Campaigns
        </h3>
        <div className="h-80 rounded-xl bg-red-900 bg-opacity-20 border border-red-800 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-2">
            Failed to Load Campaigns
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            There was an error loading your campaigns.
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gray-900 bg-opacity-50 rounded-xl border border-gray-800 p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
          <span>🎯</span>
          Your Campaigns
        </h3>

        <CampaignCarousel
          campaigns={allCampaigns}
          onViewDetails={handleViewDetails}
          onContinue={handleContinue}
          onJoin={handleJoin}
          onSubmitPhone={handleSubmitPhone}
        />
      </div>

      {/* Campaign Details Modal */}
      <CampaignDetailsModal
        campaign={selectedCampaign}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCampaign(null)
        }}
        onJoin={handleConfirmJoin}
        isParticipating={'days_completed' in (selectedCampaign || {})}
      />

      {/* Phone Submission Modal */}
      {isPhoneModalOpen && selectedCampaignForPhone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-gray-800 p-6 md:p-8">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsPhoneModalOpen(false)
                setPhoneNumber('')
                setSelectedCampaignForPhone(null)
              }}
              disabled={isSubmittingPhone}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white transition-colors"
              aria-label="Close modal"
            >
              <span className="text-2xl">×</span>
            </button>

            {/* Content */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Congratulations!
              </h2>
              <p className="text-gray-400">
                You&apos;ve completed the challenge. Enter your phone number to receive your reward.
              </p>
            </div>

            {/* Campaign Info */}
            <div className="mb-6 p-4 bg-gray-800 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Campaign</p>
              <p className="text-white font-bold">{selectedCampaignForPhone.name}</p>
              <p className="text-sm text-gray-300 mt-2">
                {selectedCampaignForPhone.banner_body}
              </p>
            </div>

            {/* Phone Input */}
            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+20 123 456 7890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isSubmittingPhone}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsPhoneModalOpen(false)
                  setPhoneNumber('')
                  setSelectedCampaignForPhone(null)
                }}
                disabled={isSubmittingPhone}
                className="flex-1 px-6 py-3 rounded-xl font-medium bg-gray-800 hover:bg-gray-700 text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPhoneSubmit}
                disabled={isSubmittingPhone || !phoneNumber.trim()}
                className="flex-1 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingPhone ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
