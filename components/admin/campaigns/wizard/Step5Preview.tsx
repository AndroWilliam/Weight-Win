import { BannerPreview } from '@/components/admin/campaigns/BannerPreview'

export function Step5Preview({ formData }: any) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Review Campaign</h3>
        <p className="text-gray-400">Double-check everything before publishing</p>
      </div>
      
      {/* Banner Preview */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-3">Banner Preview</h4>
        <BannerPreview
          heading={formData.banner_heading}
          body={formData.banner_body}
          ctaText={formData.cta_text}
          primaryColor={formData.primary_color}
          secondaryColor={formData.secondary_color}
          logoUrl={formData.banner_logo_url}
          bgUrl={formData.banner_bg_url}
        />
      </div>
      
      {/* Campaign Details */}
      <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-6 space-y-4">
        <h4 className="text-lg font-semibold text-white">Campaign Details</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400 mb-1">Campaign Name</div>
            <div className="text-white font-semibold">{formData.name || 'Not set'}</div>
          </div>
          
          <div>
            <div className="text-gray-400 mb-1">Reward Type</div>
            <div className="text-white font-semibold capitalize">{formData.reward_type.replace('_', ' ')}</div>
          </div>
          
          {formData.reward_type === 'discount' && (
            <div>
              <div className="text-gray-400 mb-1">Discount</div>
              <div className="text-white font-semibold">{formData.discount_percentage}% OFF</div>
            </div>
          )}
          
          <div>
            <div className="text-gray-400 mb-1">Challenge Duration</div>
            <div className="text-white font-semibold">{formData.required_days} days</div>
          </div>
          
          <div>
            <div className="text-gray-400 mb-1">Phone Required</div>
            <div className="text-white font-semibold">{formData.require_phone ? 'Yes' : 'No'}</div>
          </div>
          
          <div>
            <div className="text-gray-400 mb-1">Capacity</div>
            <div className="text-white font-semibold">{formData.capacity || 'Unlimited'}</div>
          </div>
          
          <div>
            <div className="text-gray-400 mb-1">Start Date</div>
            <div className="text-white font-semibold">{formatDate(formData.start_date)}</div>
          </div>
          
          <div>
            <div className="text-gray-400 mb-1">End Date</div>
            <div className="text-white font-semibold">{formatDate(formData.end_date)}</div>
          </div>
        </div>
        
        <div>
          <div className="text-gray-400 mb-2">Reward Description</div>
          <div className="text-white bg-[#1a1a1a] border border-[#333] rounded-lg p-3">
            {formData.reward_description || 'Not set'}
          </div>
        </div>
        
        {formData.terms_conditions && (
          <div>
            <div className="text-gray-400 mb-2">Terms & Conditions</div>
            <div className="text-white bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-sm whitespace-pre-wrap">
              {formData.terms_conditions}
            </div>
          </div>
        )}
      </div>
      
      {/* Settings */}
      <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-6 space-y-3">
        <h4 className="text-lg font-semibold text-white">Campaign Settings</h4>
        
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${formData.auto_activate ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-white text-sm">Auto-activate on start date</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${formData.auto_deactivate ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-white text-sm">Auto-end on end date</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${formData.send_email_notification ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-white text-sm">Send email notifications</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${formData.allow_multiple_participation ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-white text-sm">Allow multiple participations</span>
        </div>
        
        {formData.estimated_cost && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-white text-sm">Estimated cost: ${formData.estimated_cost.toLocaleString()}</span>
          </div>
        )}
        
        {formData.priority > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-white text-sm">Display priority: {formData.priority}</span>
          </div>
        )}
      </div>
      
      {/* Ready to Submit */}
      <div className="bg-[#059669]/10 border border-[#059669] rounded-lg p-4 text-center">
        <p className="text-[#059669] font-semibold">
          ✅ All set! Click "Create Campaign" to publish your campaign.
        </p>
      </div>
    </div>
  )
}

