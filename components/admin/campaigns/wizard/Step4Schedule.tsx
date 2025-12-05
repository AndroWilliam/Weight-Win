export function Step4Schedule({ formData, updateFormData, errors, clearErrors }: any) {
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    let newValue: any
    if (type === 'checkbox') {
      newValue = checked
    } else if (type === 'number') {
      newValue = value ? parseFloat(value) : null
    } else {
      newValue = value
    }
    updateFormData({ [name]: newValue })
    clearErrors(name)
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Schedule & Settings</h3>
        <p className="text-gray-400">Set campaign dates and additional options</p>
      </div>
      
      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white focus:outline-none focus:border-[#4F46E5] ${
              errors.start_date ? 'border-red-500' : 'border-[#333]'
            }`}
          />
          {errors.start_date && (
            <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white focus:outline-none focus:border-[#4F46E5] ${
              errors.end_date ? 'border-red-500' : 'border-[#333]'
            }`}
          />
          {errors.end_date && (
            <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
          )}
        </div>
      </div>
      
      {/* Auto Activation */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="auto_activate"
            id="auto_activate"
            checked={formData.auto_activate}
            onChange={handleChange}
            className="w-5 h-5 mt-0.5 rounded border-[#333] bg-[#0a0a0a] text-[#4F46E5] focus:ring-[#4F46E5] accent-[#4F46E5]"
          />
          <div className="flex-1">
            <label htmlFor="auto_activate" className="text-sm font-semibold text-white cursor-pointer">
              🚀 Auto-Activate Campaign
            </label>
            <p className="text-gray-400 text-sm mt-1">
              Campaign will automatically activate on start date
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="auto_deactivate"
            id="auto_deactivate"
            checked={formData.auto_deactivate}
            onChange={handleChange}
            className="w-5 h-5 mt-0.5 rounded border-[#333] bg-[#0a0a0a] text-[#4F46E5] focus:ring-[#4F46E5] accent-[#4F46E5]"
          />
          <div className="flex-1">
            <label htmlFor="auto_deactivate" className="text-sm font-semibold text-white cursor-pointer">
              ⏰ Auto-End Campaign
            </label>
            <p className="text-gray-400 text-sm mt-1">
              Campaign will automatically end on end date
            </p>
          </div>
        </div>
      </div>
      
      {/* Priority */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Display Priority
        </label>
        <input
          type="number"
          name="priority"
          value={formData.priority}
          onChange={(e) => {
            updateFormData({ priority: parseInt(e.target.value) || 0 })
          }}
          placeholder="0"
          className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5]"
        />
        <p className="text-gray-400 text-sm mt-1">
          Higher numbers show first (0 = default)
        </p>
      </div>
      
      {/* Estimated Cost */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Estimated Cost (Optional)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input
            type="number"
            name="estimated_cost"
            value={formData.estimated_cost || ''}
            onChange={handleChange}
            placeholder="5000"
            step="0.01"
            className="w-full pl-8 pr-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
        <p className="text-gray-400 text-sm mt-1">
          Total campaign cost for ROI calculations
        </p>
      </div>
      
      {/* Email Notifications */}
      <div>
        <div className="flex items-start gap-3 mb-4">
          <input
            type="checkbox"
            name="send_email_notification"
            id="send_email_notification"
            checked={formData.send_email_notification}
            onChange={handleChange}
            className="w-5 h-5 mt-0.5 rounded border-[#333] bg-[#0a0a0a] text-[#4F46E5] focus:ring-[#4F46E5] accent-[#4F46E5]"
          />
          <div className="flex-1">
            <label htmlFor="send_email_notification" className="text-sm font-semibold text-white cursor-pointer">
              ✉️ Send Email Notifications
            </label>
            <p className="text-gray-400 text-sm mt-1">
              Notify users via email about campaign updates
            </p>
          </div>
        </div>
        
        {formData.send_email_notification && (
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Email Template (Optional)
            </label>
            <textarea
              name="email_template"
              value={formData.email_template}
              onChange={handleChange}
              placeholder="Custom email template..."
              rows={4}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] resize-none"
            />
          </div>
        )}
      </div>
    </div>
  )
}

