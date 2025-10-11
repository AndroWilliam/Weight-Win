'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApplySchema, ApplyInput } from '@/lib/schema'
import dynamic from 'next/dynamic'

const UploadCard = dynamic(() => import('@/components/UploadCard').then(mod => ({ default: mod.UploadCard })), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse bg-slate-200 rounded-xl" />
})
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
        const text = await response.text().catch(() => '')
        let errJson: any = null
        try { errJson = JSON.parse(text) } catch {}
        if (response.status === 409) {
          toast({
            variant: 'destructive',
            title: 'Application already exists',
            description: 'Please use a different email or mobile number.',
          })
          return
        }
        toast({
          variant: 'destructive',
          title: 'Submission failed',
          description: errJson?.message || text || 'Please try again.',
        })
        throw new Error(errJson?.message || text || 'Failed to submit application')
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Apply as a Nutritionist</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Join our network of certified nutritionists</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-6 sm:space-y-8">
            {/* Personal Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm sm:text-base text-foreground">First Name</Label>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="firstName"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                          className={`border-border focus:border-primary focus:ring-primary ${showError('firstName') ? 'border-red-500' : ''}`}
                        />
                      )}
                    />
                    {showError('firstName') && (
                      <p className="text-xs sm:text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyName" className="text-sm sm:text-base text-foreground">Family Name</Label>
                    <Controller
                      name="familyName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="familyName"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                          className={`border-border focus:border-primary focus:ring-primary ${showError('familyName') ? 'border-red-500' : ''}`}
                        />
                      )}
                    />
                    {showError('familyName') && (
                      <p className="text-xs sm:text-sm text-red-600">{errors.familyName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm sm:text-base text-foreground">Mobile Number</Label>
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <span className="px-3 py-2 rounded-l-md bg-muted border border-r-0 border-border text-muted-foreground text-sm sm:text-base">
                          +20
                        </span>
                        <Input
                          className={`flex-1 rounded-l-none border-border focus:border-primary focus:ring-primary ${showError('phone') ? 'border-red-500' : ''}`}
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
                    <p className="text-xs sm:text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base text-foreground">Email Address</Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="email"
                        type="email"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        className={`border-border focus:border-primary focus:ring-primary ${showError('email') ? 'border-red-500' : ''}`}
                      />
                    )}
                  />
                  {showError('email') && (
                    <p className="text-xs sm:text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Identification */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">Identification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm sm:text-base text-foreground">ID Type</Label>
                  <Controller
                    control={control}
                    name="idType"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="national_id" id="national_id" />
                          <Label htmlFor="national_id" className="text-sm sm:text-base text-foreground">National ID</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="passport" id="passport" />
                          <Label htmlFor="passport" className="text-sm sm:text-base text-foreground">Passport</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber" className="text-sm sm:text-base text-foreground">
                    {idType === 'national_id' ? 'National ID Number' : 'Passport Number'}
                  </Label>
                  <Controller
                    name="idNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="idNumber"
                        inputMode="numeric"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        className={`border-border focus:border-primary focus:ring-primary ${showError('idNumber') ? 'border-red-500' : ''}`}
                        placeholder={idType === 'national_id' ? '14 digits' : '9 characters'}
                      />
                    )}
                  />
                  {showError('idNumber') && (
                    <p className="text-xs sm:text-sm text-red-600">{errors.idNumber.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <UploadCard
                      formFieldName="cvPath"
                      title="Upload your CV (PDF or Photo)"
                      accept="application/pdf,image/jpeg,image/png"
                      prefix="cv"
                    />
                    {showError('cvPath') && (
                      <p className="text-xs sm:text-sm text-red-600">{errors.cvPath.message}</p>
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
                      <p className="text-xs sm:text-sm text-red-600">{errors.idPath.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consent */}
            <Card className="border-border">
              <CardContent className="pt-4 sm:pt-6">
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
                    <Label htmlFor="consent" className="text-xs sm:text-sm leading-relaxed text-foreground">
                      I consent to WeightWin using OCR to extract relevant information from my documents for verification.{' '}
                      <a href="#" className="text-primary hover:underline">Privacy</a> and{' '}
                      <a href="#" className="text-primary hover:underline">Terms</a>.
                    </Label>
                    {showError('consent') && (
                      <p className="text-xs sm:text-sm text-red-600">{errors.consent.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/">Cancel</Link>
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
              >
                Submit details
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>

      {/* Success Modal */}
      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent className="border-border">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg sm:text-xl text-foreground">Application Submitted Successfully!</AlertDialogTitle>
                <AlertDialogDescription className="text-sm sm:text-base mt-2 text-muted-foreground">
                  Thank you for your interest in joining WeightWin. We'll review your application and get back to you within 3-5 business days.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Application ID: <span className="font-mono text-foreground">{applicationId}</span>
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setShowSuccessModal(false)} asChild className="bg-primary hover:bg-primary/90 text-white">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}