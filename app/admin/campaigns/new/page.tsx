'use client'

import { CampaignWizard } from '@/components/admin/campaigns/wizard/CampaignWizard'

export default function NewCampaignPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">✨ Create New Campaign</h1>
          <p className="text-gray-400">Follow the steps to create your marketing campaign</p>
        </div>
        
        <CampaignWizard mode="create" />
      </div>
    </div>
  )
}

