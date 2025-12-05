export function Step2Requirements({ formData, updateFormData, errors, clearErrors }: any) {
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    updateFormData({ [name]: newValue })
    clearErrors(name)
  }
  
  const dayOptions = [7, 14, 21, 30]
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Challenge Requirements</h3>
        <p className="text-gray-400">Define what users need to do to complete the challenge</p>
      </div>
      
      {/* Required Days */}
      <div>
        <label className="block text-sm font-semibold text-white mb-3">
          Challenge Duration <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-3">
          {dayOptions.map(days => (
            <button
              key={days}
              type="button"
              onClick={() => {
                updateFormData({ required_days: days })
                clearErrors('required_days')
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.required_days === days
                  ? 'border-[#4F46E5] bg-[#4F46E5]/10'
                  : 'border-[#333] hover:border-[#4F46E5]/50'
              }`}
            >
              <div className="text-2xl font-bold text-white mb-1">{days}</div>
              <div className="text-gray-400 text-xs">days</div>
            </button>
          ))}
        </div>
        <div className="mt-3">
          <input
            type="number"
            name="required_days"
            value={formData.required_days}
            onChange={handleChange}
            placeholder="Custom days (1-90)"
            min="1"
            max="90"
            className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] ${
              errors.required_days ? 'border-red-500' : 'border-[#333]'
            }`}
          />
          {errors.required_days && (
            <p className="text-red-500 text-sm mt-1">{errors.required_days}</p>
          )}
        </div>
      </div>
      
      {/* Phone Collection */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="require_phone"
            id="require_phone"
            checked={formData.require_phone}
            onChange={handleChange}
            className="w-5 h-5 mt-0.5 rounded border-[#333] bg-[#0a0a0a] text-[#4F46E5] focus:ring-[#4F46E5] accent-[#4F46E5]"
          />
          <div className="flex-1">
            <label htmlFor="require_phone" className="text-sm font-semibold text-white cursor-pointer">
              📞 Require Phone Number
            </label>
            <p className="text-gray-400 text-sm mt-1">
              Users must provide their phone number upon completion
            </p>
          </div>
        </div>
        
        {formData.require_phone && (
          <div className="flex items-start gap-3 ml-8">
            <input
              type="checkbox"
              name="reuse_phone"
              id="reuse_phone"
              checked={formData.reuse_phone}
              onChange={handleChange}
              className="w-5 h-5 mt-0.5 rounded border-[#333] bg-[#0a0a0a] text-[#4F46E5] focus:ring-[#4F46E5] accent-[#4F46E5]"
            />
            <div className="flex-1">
              <label htmlFor="reuse_phone" className="text-sm font-semibold text-white cursor-pointer">
                Reuse Existing Phone Number
              </label>
              <p className="text-gray-400 text-sm mt-1">
                If user already provided phone, don't ask again
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Multiple Participation */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          name="allow_multiple_participation"
          id="allow_multiple_participation"
          checked={formData.allow_multiple_participation}
          onChange={handleChange}
          className="w-5 h-5 mt-0.5 rounded border-[#333] bg-[#0a0a0a] text-[#4F46E5] focus:ring-[#4F46E5] accent-[#4F46E5]"
        />
        <div className="flex-1">
          <label htmlFor="allow_multiple_participation" className="text-sm font-semibold text-white cursor-pointer">
            🔁 Allow Multiple Participations
          </label>
          <p className="text-gray-400 text-sm mt-1">
            Users can join this campaign multiple times
          </p>
        </div>
      </div>
      
      {/* Capacity */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Participant Capacity (Optional)
        </label>
        <input
          type="number"
          name="capacity"
          value={formData.capacity || ''}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value) : null
            updateFormData({ capacity: val })
            clearErrors('capacity')
          }}
          placeholder="Leave empty for unlimited"
          min="1"
          className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] ${
            errors.capacity ? 'border-red-500' : 'border-[#333]'
          }`}
        />
        {errors.capacity && (
          <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
        )}
        <p className="text-gray-400 text-sm mt-1">
          Maximum number of users who can join (leave empty for unlimited)
        </p>
      </div>
    </div>
  )
}

