'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface PartnerFormProps {
  partner: any | null
  onSuccess: () => void
  onCancel: () => void
}

export function PartnerForm({ partner, onSuccess, onCancel }: PartnerFormProps) {
  const [formData, setFormData] = useState({
    name: partner?.name || '',
    logo_url: partner?.logo_url || '',
    contact_email: partner?.contact_email || '',
    contact_phone: partner?.contact_phone || '',
    location: partner?.location || '',
    website: partner?.website || '',
    notes: partner?.notes || '',
    active: partner?.active !== undefined ? partner.active : true
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<any>({})
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  const validateForm = () => {
    const newErrors: any = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Partner name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Partner name must be at least 3 characters'
    }
    
    if (formData.contact_email && !formData.contact_email.includes('@')) {
      newErrors.contact_email = 'Invalid email address'
    }
    
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Website must start with http:// or https://'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const endpoint = partner
        ? `/api/admin/partners/${partner.id}`
        : '/api/admin/partners'
      
      const method = partner ? 'PUT' : 'POST'
      
      // Clean up empty strings to null
      const payload = {
        ...formData,
        logo_url: formData.logo_url || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        location: formData.location || null,
        website: formData.website || null,
        notes: formData.notes || null
      }
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success(partner ? 'Partner updated successfully' : 'Partner created successfully')
        onSuccess()
      } else {
        if (data.details) {
          // Zod validation errors
          const zodErrors: any = {}
          data.details.forEach((err: any) => {
            zodErrors[err.path[0]] = err.message
          })
          setErrors(zodErrors)
          toast.error('Please fix the validation errors')
        } else {
          toast.error(data.message || 'An error occurred')
        }
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Partner Name */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Partner Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., BOLD Soccer Academy"
          className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] ${
            errors.name ? 'border-red-500' : 'border-[#333]'
          }`}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>
      
      {/* Logo URL */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Logo URL
        </label>
        <input
          type="url"
          name="logo_url"
          value={formData.logo_url}
          onChange={handleChange}
          placeholder="https://example.com/logo.png"
          className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] ${
            errors.logo_url ? 'border-red-500' : 'border-[#333]'
          }`}
        />
        {errors.logo_url && (
          <p className="text-red-500 text-sm mt-1">{errors.logo_url}</p>
        )}
      </div>
      
      {/* Contact Email */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Contact Email
        </label>
        <input
          type="email"
          name="contact_email"
          value={formData.contact_email}
          onChange={handleChange}
          placeholder="contact@partner.com"
          className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] ${
            errors.contact_email ? 'border-red-500' : 'border-[#333]'
          }`}
        />
        {errors.contact_email && (
          <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>
        )}
      </div>
      
      {/* Contact Phone */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Contact Phone
        </label>
        <input
          type="tel"
          name="contact_phone"
          value={formData.contact_phone}
          onChange={handleChange}
          placeholder="+20 100 123 4567"
          className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5]"
        />
      </div>
      
      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Location
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Cairo, Egypt"
          className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5]"
        />
      </div>
      
      {/* Website */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Website
        </label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://partner.com"
          className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] ${
            errors.website ? 'border-red-500' : 'border-[#333]'
          }`}
        />
        {errors.website && (
          <p className="text-red-500 text-sm mt-1">{errors.website}</p>
        )}
      </div>
      
      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Internal Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Internal notes about this partner..."
          rows={3}
          className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5] resize-none"
        />
      </div>
      
      {/* Active Status */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="active"
          id="active"
          checked={formData.active}
          onChange={handleChange}
          className="w-5 h-5 rounded border-[#333] bg-[#0a0a0a] text-[#4F46E5] focus:ring-[#4F46E5]"
        />
        <label htmlFor="active" className="text-sm font-semibold text-white">
          Active Partner
        </label>
      </div>
      
      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-[#2a2a2a] text-white font-semibold rounded-lg hover:bg-[#3a3a3a] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-[#4F46E5] text-white font-semibold rounded-lg hover:bg-[#4338CA] disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : partner ? 'Update Partner' : 'Create Partner'}
        </button>
      </div>
    </form>
  )
}

