/**
 * Track campaign banner click
 */
export async function trackCampaignClick(
  campaignId: string,
  userId: string
): Promise<void> {
  try {
    await fetch('/api/campaigns/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: campaignId,
        user_id: userId,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null
      })
    })
  } catch (error) {
    console.error('Failed to track click:', error)
  }
}

/**
 * Join a campaign
 */
export async function joinCampaign(
  campaignId: string,
  userId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/campaigns/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: campaignId,
        user_id: userId
      })
    })
    
    const data = await res.json()
    return data
  } catch (error) {
    console.error('Failed to join campaign:', error)
    return { success: false, message: 'An error occurred' }
  }
}

/**
 * Check if user can join campaign
 */
export async function canJoinCampaign(
  campaignId: string,
  userId: string
): Promise<{ can_join: boolean; reason?: string }> {
  try {
    const res = await fetch(
      `/api/campaigns/check-eligibility?campaign_id=${campaignId}&user_id=${userId}`
    )
    
    const data = await res.json()
    return data
  } catch (error) {
    console.error('Failed to check eligibility:', error)
    return { can_join: false, reason: 'An error occurred' }
  }
}

