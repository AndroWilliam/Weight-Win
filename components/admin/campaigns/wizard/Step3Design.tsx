import { BannerPreview } from '@/components/admin/campaigns/BannerPreview'

export function Step3Design({ formData, updateFormData, errors, clearErrors }: any) {
  const handleChange = (e: any) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })
    clearErrors(name)
  }
  
  const colorPresets = [
    { name: 'Orange/Red', primary: '#F59E0B', secondary: '#EF4444' },
    { name: 'Green/Teal', primary: '#10B981', secondary: '#06B6D4' },
    { name: 'Blue/Indigo', primary: '#3B82F6', secondary: '#6366F1' },
    { name: 'Purple/Pink', primary: '#8B5CF6', secondary: '#EC4899' },
    { name: 'Red/Orange', primary: '#EF4444', secondary: '#F59E0B' }
  ]
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Banner Design</h3>
        <p className="text-gray-400">Customize how your campaign banner looks</p>
      </div>
      
      {/* Banner Heading */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Banner Heading <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="banner_heading"
          value={formData.banner_heading}
          onChange={handleChange}
          placeholder="e.g., 🔥 LIMITED TIME OFFER!"
          maxLength={200}
          className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] ${
            errors.banner_heading ? 'border-red-500' : 'border-[#333]'
          }`}
        />
        {errors.banner_heading && (
          <p className="text-red-500 text-sm mt-1">{errors.banner_heading}</p>
        )}
      </div>
      
      {/* Banner Body */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Banner Body <span className="text-red-500">*</span>
        </label>
        <textarea
          name="banner_body"
          value={formData.banner_body}
          onChange={handleChange}
          placeholder="e.g., Complete 7 days of tracking and unlock 30% savings!"
          rows={3}
          className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] resize-none ${
            errors.banner_body ? 'border-red-500' : 'border-[#333]'
          }`}
        />
        {errors.banner_body && (
          <p className="text-red-500 text-sm mt-1">{errors.banner_body}</p>
        )}
      </div>
      
      {/* CTA Text */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Call-to-Action Text <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="cta_text"
          value={formData.cta_text}
          onChange={handleChange}
          placeholder="e.g., Start Challenge →"
          maxLength={100}
          className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] ${
            errors.cta_text ? 'border-red-500' : 'border-[#333]'
          }`}
        />
        {errors.cta_text && (
          <p className="text-red-500 text-sm mt-1">{errors.cta_text}</p>
        )}
      </div>
      
      {/* Color Presets */}
      <div>
        <label className="block text-sm font-semibold text-white mb-3">
          Color Scheme
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {colorPresets.map(preset => (
            <button
              key={preset.name}
              type="button"
              onClick={() => updateFormData({ 
                primary_color: preset.primary, 
                secondary_color: preset.secondary 
              })}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.primary_color === preset.primary && formData.secondary_color === preset.secondary
                  ? 'border-[#4F46E5]'
                  : 'border-[#333] hover:border-[#4F46E5]/50'
              }`}
            >
              <div className="flex gap-2 mb-2">
                <div 
                  className="flex-1 h-8 rounded"
                  style={{ backgroundColor: preset.primary }}
                />
                <div 
                  className="flex-1 h-8 rounded"
                  style={{ backgroundColor: preset.secondary }}
                />
              </div>
              <div className="text-white text-xs">{preset.name}</div>
            </button>
          ))}
        </div>
        
        {/* Custom Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                name="primary_color"
                value={formData.primary_color}
                onChange={handleChange}
                className="w-16 h-12 rounded border border-[#333] cursor-pointer"
              />
              <input
                type="text"
                name="primary_color"
                value={formData.primary_color}
                onChange={handleChange}
                placeholder="#F59E0B"
                className={`flex-1 px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] ${
                  errors.primary_color ? 'border-red-500' : 'border-[#333]'
                }`}
              />
            </div>
            {errors.primary_color && (
              <p className="text-red-500 text-sm mt-1">{errors.primary_color}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Secondary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                name="secondary_color"
                value={formData.secondary_color}
                onChange={handleChange}
                className="w-16 h-12 rounded border border-[#333] cursor-pointer"
              />
              <input
                type="text"
                name="secondary_color"
                value={formData.secondary_color}
                onChange={handleChange}
                placeholder="#EF4444"
                className={`flex-1 px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] ${
                  errors.secondary_color ? 'border-red-500' : 'border-[#333]'
                }`}
              />
            </div>
            {errors.secondary_color && (
              <p className="text-red-500 text-sm mt-1">{errors.secondary_color}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Banner Logo URL */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Banner Logo URL (Optional)
        </label>
        <input
          type="url"
          name="banner_logo_url"
          value={formData.banner_logo_url}
          onChange={handleChange}
          placeholder="https://example.com/logo.png"
          className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5]"
        />
      </div>
      
      {/* Banner Background URL */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Banner Background URL (Optional)
        </label>
        <input
          type="url"
          name="banner_bg_url"
          value={formData.banner_bg_url}
          onChange={handleChange}
          placeholder="https://example.com/background.jpg"
          className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5]"
        />
      </div>
      
      {/* Live Preview */}
      <div>
        <label className="block text-sm font-semibold text-white mb-3">
          Live Preview
        </label>
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
    </div>
  )
}

