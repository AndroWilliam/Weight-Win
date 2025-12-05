'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function Step1BasicInfo({ formData, updateFormData, errors, clearErrors }: any) {
  const { data: partnersData } = useSWR('/api/admin/partners?active=true', fetcher)
  const partners = partnersData?.data || []
  
  const handleChange = (e: any) => {
    const { name, value, type } = e.target
    updateFormData({ [name]: type === 'number' ? parseInt(value) || 0 : value })
    clearErrors(name)
  }
  
  const rewardTypes = [
    { value: 'discount', label: 'Discount', icon: '🏷️' },
    { value: 'free_item', label: 'Free Item', icon: '🎁' },
    { value: 'voucher', label: 'Voucher', icon: '🎟️' },
    { value: 'gift_card', label: 'Gift Card', icon: '💳' }
  ]
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Basic Information</h3>
        <p className="text-gray-400">Set up the core details of your campaign</p>
      </div>
      
      {/* Partner Selection */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Partner <span className="text-red-500">*</span>
        </label>
        <select
          name="partner_id"
          value={formData.partner_id}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white focus:outline-none focus:border-[#4F46E5] ${
            errors.partner_id ? 'border-red-500' : 'border-[#333]'
          }`}
        >
          <option value="">Select a partner</option>
          {partners.map((partner: any) => (
            <option key={partner.id} value={partner.id}>
              {partner.name}
            </option>
          ))}
        </select>
        {errors.partner_id && (
          <p className="text-red-500 text-sm mt-1">{errors.partner_id}</p>
        )}
      </div>
      
      {/* Campaign Name */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Campaign Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Summer Fitness Challenge"
          className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] ${
            errors.name ? 'border-red-500' : 'border-[#333]'
          }`}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>
      
      {/* Reward Type */}
      <div>
        <label className="block text-sm font-semibold text-white mb-3">
          Reward Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {rewardTypes.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => updateFormData({ reward_type: type.value })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.reward_type === type.value
                  ? 'border-[#4F46E5] bg-[#4F46E5]/10'
                  : 'border-[#333] hover:border-[#4F46E5]/50'
              }`}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="text-white text-sm font-semibold">{type.label}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Discount Percentage */}
      {formData.reward_type === 'discount' && (
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Discount Percentage <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              name="discount_percentage"
              value={formData.discount_percentage}
              onChange={handleChange}
              min="0"
              max="100"
              className="flex-1 accent-[#4F46E5]"
            />
            <div className="px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white font-bold w-20 text-center">
              {formData.discount_percentage}%
            </div>
          </div>
          {errors.discount_percentage && (
            <p className="text-red-500 text-sm mt-1">{errors.discount_percentage}</p>
          )}
        </div>
      )}
      
      {/* Reward Description */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Reward Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="reward_description"
          value={formData.reward_description}
          onChange={handleChange}
          placeholder="e.g., Get 30% off your next gym membership!"
          rows={3}
          className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] resize-none ${
            errors.reward_description ? 'border-red-500' : 'border-[#333]'
          }`}
        />
        {errors.reward_description && (
          <p className="text-red-500 text-sm mt-1">{errors.reward_description}</p>
        )}
      </div>
      
      {/* Terms & Conditions */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Terms & Conditions
        </label>
        <textarea
          name="terms_conditions"
          value={formData.terms_conditions}
          onChange={handleChange}
          placeholder="e.g., Valid for new members only..."
          rows={4}
          className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] resize-none"
        />
      </div>
    </div>
  )
}

