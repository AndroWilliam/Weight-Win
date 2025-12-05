'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { WizardStepper } from './WizardStepper'
import { Step1BasicInfo } from './Step1BasicInfo'
import { Step2Requirements } from './Step2Requirements'
import { Step3Design } from './Step3Design'
import { Step4Schedule } from './Step4Schedule'
import { Step5Preview } from './Step5Preview'

interface CampaignWizardProps {
  mode: 'create' | 'edit'
  campaign?: any
}

export function CampaignWizard({ mode, campaign }: CampaignWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    partner_id: campaign?.partner_id || '',
    name: campaign?.name || '',
    reward_type: campaign?.reward_type || 'discount',
    discount_percentage: campaign?.discount_percentage || 0,
    reward_description: campaign?.reward_description || '',
    terms_conditions: campaign?.terms_conditions || '',
    
    // Step 2: Requirements
    required_days: campaign?.required_days || 7,
    require_phone: campaign?.require_phone !== undefined ? campaign.require_phone : true,
    reuse_phone: campaign?.reuse_phone !== undefined ? campaign.reuse_phone : true,
    allow_multiple_participation: campaign?.allow_multiple_participation || false,
    capacity: campaign?.capacity || null,
    
    // Step 3: Design
    banner_heading: campaign?.banner_heading || '',
    banner_body: campaign?.banner_body || '',
    cta_text: campaign?.cta_text || 'Start Challenge',
    banner_logo_url: campaign?.banner_logo_url || '',
    banner_bg_url: campaign?.banner_bg_url || '',
    primary_color: campaign?.primary_color || '#F59E0B',
    secondary_color: campaign?.secondary_color || '#EF4444',
    
    // Step 4: Schedule
    start_date: campaign?.start_date ? campaign.start_date.split('T')[0] : '',
    end_date: campaign?.end_date ? campaign.end_date.split('T')[0] : '',
    auto_activate: campaign?.auto_activate !== undefined ? campaign.auto_activate : true,
    auto_deactivate: campaign?.auto_deactivate !== undefined ? campaign.auto_deactivate : true,
    priority: campaign?.priority || 0,
    estimated_cost: campaign?.estimated_cost || null,
    send_email_notification: campaign?.send_email_notification !== undefined ? campaign.send_email_notification : true,
    email_template: campaign?.email_template || ''
  })
  
  const [errors, setErrors] = useState<any>({})
  
  // Auto-save to localStorage
  useEffect(() => {
    if (mode === 'create') {
      const saved = localStorage.getItem('campaign_draft')
      if (saved) {
        try {
          const draft = JSON.parse(saved)
          setFormData(draft.data)
          setCurrentStep(draft.step)
          toast.info('Draft restored from previous session')
        } catch (e) {
          console.error('Failed to load draft:', e)
        }
      }
    }
  }, [mode])
  
  useEffect(() => {
    if (mode === 'create') {
      localStorage.setItem('campaign_draft', JSON.stringify({
        data: formData,
        step: currentStep
      }))
    }
  }, [formData, currentStep, mode])
  
  const updateFormData = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }
  
  const clearErrors = (field?: string) => {
    if (field) {
      setErrors((prev: any) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    } else {
      setErrors({})
    }
  }
  
  // Validation per step
  const validateStep = (step: number): boolean => {
    const newErrors: any = {}
    
    if (step === 1) {
      if (!formData.partner_id) newErrors.partner_id = 'Partner is required'
      if (!formData.name.trim()) newErrors.name = 'Campaign name is required'
      else if (formData.name.length < 3) newErrors.name = 'Name must be at least 3 characters'
      if (formData.discount_percentage < 0 || formData.discount_percentage > 100) {
        newErrors.discount_percentage = 'Discount must be between 0-100%'
      }
      if (!formData.reward_description.trim()) {
        newErrors.reward_description = 'Reward description is required'
      }
    }
    
    if (step === 2) {
      if (formData.required_days < 1 || formData.required_days > 90) {
        newErrors.required_days = 'Required days must be between 1-90'
      }
      if (formData.capacity && formData.capacity < 1) {
        newErrors.capacity = 'Capacity must be at least 1'
      }
    }
    
    if (step === 3) {
      if (!formData.banner_heading.trim()) {
        newErrors.banner_heading = 'Banner heading is required'
      }
      if (!formData.banner_body.trim()) {
        newErrors.banner_body = 'Banner body is required'
      }
      if (!formData.cta_text.trim()) {
        newErrors.cta_text = 'CTA text is required'
      }
      if (!/^#[0-9A-F]{6}$/i.test(formData.primary_color)) {
        newErrors.primary_color = 'Invalid hex color'
      }
      if (!/^#[0-9A-F]{6}$/i.test(formData.secondary_color)) {
        newErrors.secondary_color = 'Invalid hex color'
      }
    }
    
    if (step === 4) {
      if (!formData.start_date) newErrors.start_date = 'Start date is required'
      if (!formData.end_date) newErrors.end_date = 'End date is required'
      if (formData.start_date && formData.end_date) {
        if (new Date(formData.end_date) <= new Date(formData.start_date)) {
          newErrors.end_date = 'End date must be after start date'
        }
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      toast.error('Please fix the errors before continuing')
    }
  }
  
  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const handleSubmit = async () => {
    // Validate all steps
    for (let i = 1; i <= 4; i++) {
      if (!validateStep(i)) {
        toast.error(`Please fix errors in Step ${i}`)
        setCurrentStep(i)
        return
      }
    }
    
    setIsSubmitting(true)
    
    try {
      const endpoint = mode === 'create' 
        ? '/api/admin/campaigns'
        : `/api/admin/campaigns/${campaign.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'
      
      // Format dates to ISO
      const payload = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        capacity: formData.capacity || null,
        estimated_cost: formData.estimated_cost || null,
        banner_logo_url: formData.banner_logo_url || null,
        banner_bg_url: formData.banner_bg_url || null,
        terms_conditions: formData.terms_conditions || null,
        email_template: formData.email_template || null
      }
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success(mode === 'create' ? 'Campaign created successfully!' : 'Campaign updated successfully!')
        
        // Clear draft
        if (mode === 'create') {
          localStorage.removeItem('campaign_draft')
        }
        
        // Navigate to campaigns list
        router.push('/admin/campaigns')
      } else {
        if (data.details) {
          // Zod validation errors
          const zodErrors: any = {}
          data.details.forEach((err: any) => {
            zodErrors[err.path[0]] = err.message
          })
          setErrors(zodErrors)
          toast.error('Please fix the validation errors')
          // Go to first step with error
          setCurrentStep(1)
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
  
  const handleClearDraft = () => {
    localStorage.removeItem('campaign_draft')
    setFormData({
      partner_id: '',
      name: '',
      reward_type: 'discount',
      discount_percentage: 0,
      reward_description: '',
      terms_conditions: '',
      required_days: 7,
      require_phone: true,
      reuse_phone: true,
      allow_multiple_participation: false,
      capacity: null,
      banner_heading: '',
      banner_body: '',
      cta_text: 'Start Challenge',
      banner_logo_url: '',
      banner_bg_url: '',
      primary_color: '#F59E0B',
      secondary_color: '#EF4444',
      start_date: '',
      end_date: '',
      auto_activate: true,
      auto_deactivate: true,
      priority: 0,
      estimated_cost: null,
      send_email_notification: true,
      email_template: ''
    })
    setCurrentStep(1)
    setErrors({})
    toast.success('Draft cleared')
  }
  
  const steps = [
    { number: 1, title: 'Basic Info', component: Step1BasicInfo },
    { number: 2, title: 'Requirements', component: Step2Requirements },
    { number: 3, title: 'Design', component: Step3Design },
    { number: 4, title: 'Schedule', component: Step4Schedule },
    { number: 5, title: 'Preview', component: Step5Preview }
  ]
  
  const CurrentStepComponent = steps[currentStep - 1].component
  
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
      {/* Stepper */}
      <WizardStepper currentStep={currentStep} totalSteps={5} steps={steps} />
      
      {/* Step Content */}
      <div className="mt-8">
        <CurrentStepComponent
          formData={formData}
          updateFormData={updateFormData}
          errors={errors}
          clearErrors={clearErrors}
        />
      </div>
      
      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-[#333]">
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-[#2a2a2a] text-white font-semibold rounded-lg hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          {mode === 'create' && (
            <button
              onClick={handleClearDraft}
              className="px-4 py-3 text-gray-400 hover:text-white font-semibold rounded-lg hover:bg-[#2a2a2a] transition-colors"
            >
              Clear Draft
            </button>
          )}
        </div>
        
        <div className="text-gray-400 text-sm">
          Step {currentStep} of 5
        </div>
        
        {currentStep < 5 ? (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-[#4F46E5] text-white font-semibold rounded-lg hover:bg-[#4338CA]"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#059669] text-white font-semibold rounded-lg hover:bg-[#047857] disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? '✓ Create Campaign' : '✓ Update Campaign'}
          </button>
        )}
      </div>
    </div>
  )
}

