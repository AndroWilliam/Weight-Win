'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApplySchema, ApplyInput } from '@/lib/schema'
import { UploadCard } from '@/components/UploadCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

export default function ApplyNutritionistPage() {
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [applicationId, setApplicationId] = useState<string>()
  const { toast } = useToast()
  const [debug, setDebug] = useState(false)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      setDebug(params.get('debug') === '1')
    } catch {}
  }, [])

  const methods = useForm<ApplyInput>({
    resolver: zodResolver(ApplySchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: '',
      familyName: '',
      email: '',
      idNumber: '',
      idType: 'national_id',
      consent: false,
    }
  })

  const { register, control, handleSubmit, formState: { errors, isSubmitting, isValid, isSubmitted }, watch, setValue } = methods
  const showError = (field: keyof ApplyInput) => {
    // Only show after a submit attempt
    return !!errors[field] && isSubmitted
  }
  const idType = watch('idType') ?? 'national_id'

  const onSubmit = async (data: ApplyInput) => {
    try {
      if (debug) {
        console.log('[Apply Debug] submit payload', data)
        console.log('[Apply Debug] getValues at submit', methods.getValues())
      }
      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        if (response.status === 409) {
          toast({
            variant: 'destructive',
            title: 'Application already exists',
            description: 'Please use a different email or mobile number.',
          })
          return
        }
        throw new Error(err?.message || 'Failed to submit application')
      }

      const result = await response.json()
      setApplicationId(result.applicationId)
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Submission error:', error)
      if (debug) {
        console.log('[Apply Debug] form errors', methods.formState.errors)
      }
      // Handle error - you might want to show a toast or error message
    }
  }

  const onInvalid = (errs: any) => {
    if (debug) {
      console.log('[Apply Debug] invalid submit errors', errs)
      console.log('[Apply Debug] getValues at invalid', methods.getValues())
    }
    // Show a single helper toast
    toast({
      variant: 'destructive',
      title: 'Please review the highlighted fields',
      description: 'Some required fields are missing or invalid.',
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Apply as a Nutritionist</h1>
              <p className="text-slate-600">Join our network of certified nutritionists</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      className={showError('firstName') ? 'border-red-500' : ''}
                    />
                    {showError('firstName') && (
                      <p className="text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyName">Family Name</Label>
                    <Input
                      id="familyName"
                      {...register('familyName')}
                      className={showError('familyName') ? 'border-red-500' : ''}
                    />
                    {showError('familyName') && (
                      <p className="text-sm text-red-600">{errors.familyName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <span className="px-3 py-2 rounded-l-md bg-slate-100 border border-r-0 border-slate-300 text-slate-700">
                          +20
                        </span>
                        <Input
                          className={`flex-1 rounded-l-none ${showError('phone') ? 'border-red-500' : ''}`}
                          value={(field.value || '').replace(/^\+20/, '')}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(/\D/g, '').slice(0, 10)
                            field.onChange(`+20${cleanValue}`)
                          }}
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="10XXXXXXXX"
                        />
                      </div>
                    )}
                  />
                  {showError('phone') && (
                    <p className="text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={showError('email') ? 'border-red-500' : ''}
                  />
                  {showError('email') && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Identification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Identification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>ID Type</Label>
                  <Controller
                    control={control}
                    name="idType"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="national_id" id="national_id" />
                          <Label htmlFor="national_id">National ID</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="passport" id="passport" />
                          <Label htmlFor="passport">Passport</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber">
                    {idType === 'national_id' ? 'National ID Number' : 'Passport Number'}
                  </Label>
                  <Input
                    id="idNumber"
                    {...register('idNumber')}
                    inputMode="numeric"
                    className={showError('idNumber') ? 'border-red-500' : ''}
                    placeholder={idType === 'national_id' ? '14 digits' : '9 characters'}
                  />
                  {showError('idNumber') && (
                    <p className="text-sm text-red-600">{errors.idNumber.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <UploadCard
                      formFieldName="cvPath"
                      title="Upload your CV (PDF or Photo)"
                      accept="application/pdf,image/jpeg,image/png"
                      prefix="cv"
                    />
                    {showError('cvPath') && (
                      <p className="text-sm text-red-600">{errors.cvPath.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <UploadCard
                      formFieldName="idPath"
                      title={idType === 'national_id' ? 'National ID Photo' : 'Passport Photo'}
                      accept="application/pdf,image/jpeg,image/png"
                      prefix="id"
                    />
                    {showError('idPath') && (
                      <p className="text-sm text-red-600">{errors.idPath.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consent */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Controller
                    control={control}
                    name="consent"
                    render={({ field }) => (
                      <Checkbox
                        id="consent"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className={showError('consent') ? 'border-red-500' : ''}
                      />
                    )}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="consent" className="text-sm leading-relaxed">
                      I consent to WeightWin using OCR to extract relevant information from my documents for verification.{' '}
                      <a href="#" className="text-blue-600 hover:underline">Privacy</a> and{' '}
                      <a href="#" className="text-blue-600 hover:underline">Terms</a>.
                    </Label>
                    {showError('consent') && (
                      <p className="text-sm text-red-600">{errors.consent.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit details'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>

      {/* Success Modal */}
      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl">Application Submitted Successfully!</AlertDialogTitle>
                <AlertDialogDescription className="text-base mt-2">
                  Thank you for your interest in joining WeightWin. We'll review your application and get back to you within 3-5 business days.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="mt-6">
            <p className="text-sm text-slate-600 mb-4">
              Application ID: <span className="font-mono text-slate-900">{applicationId}</span>
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setShowSuccessModal(false)} asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}