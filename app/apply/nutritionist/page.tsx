"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const EGY_MOBILE = /^\+20(10|11|12|15)\d{8}$/

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  familyName: z.string().min(1, "Required"),
  phone: z.string().regex(EGY_MOBILE, "Egyptian mobile only"),
  email: z.string().email(),
  idType: z.enum(["national_id", "passport"]),
  idNumber: z
    .string()
    .min(1)
    .superRefine((val, ctx) => {
      const t = (ctx as any).parent?.idType
      if (t === "national_id" && !/^\d{14}$/.test(val)) {
        ctx.addIssue({ code: "custom", message: "14 digits required" })
      }
      if (t === "passport" && !/^[A-Za-z0-9]{9}$/.test(val)) {
        ctx.addIssue({ code: "custom", message: "9 alphanumeric chars required" })
      }
    }),
  cvFile: z.instanceof(File),
  idFile: z.instanceof(File),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent required" }) }),
})

type FormValues = z.infer<typeof schema>

export default function ApplyAsNutritionistPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [submitting, setSubmitting] = useState(false)
  const [ocrState, setOcrState] = useState<{cv?: string; id?: string}>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      idType: "national_id",
      consent: false,
    },
  })

  const idType = watch("idType")

  // Dropzones
  const onDropCv = (accepted: File[]) => {
    if (accepted?.[0]) setValue("cvFile", accepted[0], { shouldValidate: true })
  }
  const onDropId = (accepted: File[]) => {
    if (accepted?.[0]) setValue("idFile", accepted[0], { shouldValidate: true })
  }

  const { getRootProps: getCvRoot, getInputProps: getCvInput, isDragActive: cvActive } = useDropzone({
    onDrop: onDropCv,
    multiple: false,
    accept: { "application/pdf": [".pdf"], "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxSize: 10 * 1024 * 1024,
  })
  const { getRootProps: getIdRoot, getInputProps: getIdInput, isDragActive: idActive } = useDropzone({
    onDrop: onDropId,
    multiple: false,
    accept: { "application/pdf": [".pdf"], "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxSize: 10 * 1024 * 1024,
  })

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true)
      // Normalize
      const email = values.email.toLowerCase()
      const userRes = await supabase.auth.getUser()
      const user = userRes.data.user
      if (!user) throw new Error("Not authenticated")

      // 1) Create application row
      const { data: appRow, error: appErr } = await supabase
        .from("nutritionist_applications")
        .insert({
          applicant_user_id: user.id,
          first_name: values.firstName,
          family_name: values.familyName,
          phone_e164: values.phone,
          email,
          id_type: values.idType,
          id_number: values.idNumber,
          status: "new",
        })
        .select("id")
        .single()
      if (appErr) throw appErr

      const applicationId = appRow.id as number

      // 2) Upload files
      const ts = Date.now()
      const cvExt = values.cvFile.name.split(".").pop() || "pdf"
      const idExt = values.idFile.name.split(".").pop() || "jpg"
      const cvPath = `${user.id}/cv-${ts}.${cvExt}`
      const idPath = `${user.id}/id-${ts}.${idExt}`

      const upCv = await supabase.storage.from("applicant-docs").upload(cvPath, values.cvFile, { upsert: true })
      if (upCv.error) throw upCv.error
      const upId = await supabase.storage.from("applicant-docs").upload(idPath, values.idFile, { upsert: true })
      if (upId.error) throw upId.error

      // 3) Insert document rows
      const { data: docs, error: docErr } = await supabase
        .from("application_documents")
        .insert([
          { application_id: applicationId, kind: "cv", file_path: cvPath },
          { application_id: applicationId, kind: "id", file_path: idPath },
        ])
        .select("id, kind")
      if (docErr) throw docErr

      const cvDoc = docs.find(d => d.kind === "cv")
      const idDoc = docs.find(d => d.kind === "id")

      // 4) Trigger OCR
      setOcrState(s => ({ ...s, cv: "Scanning CV..." }))
      await fetch("/api/ocr/cv", { method: "POST", body: JSON.stringify({ documentId: cvDoc?.id }) })
      setOcrState(s => ({ ...s, cv: "OCR complete" }))

      setOcrState(s => ({ ...s, id: "Scanning ID..." }))
      await fetch("/api/ocr/id", { method: "POST", body: JSON.stringify({ documentId: idDoc?.id, idNumber: values.idNumber }) })
      setOcrState(s => ({ ...s, id: "OCR complete" }))

      // 5) Log event
      await supabase.from("application_events").insert({ application_id: applicationId, event_type: "submitted" })

      setShowSuccess(true)
    } catch (e) {
      console.error(e)
      alert("Failed to submit application. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const idTitle = (
    <AnimatePresence mode="wait">
      <motion.span key={idType} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        {idType === "national_id" ? "National ID Photo" : "Passport Photo"}
      </motion.span>
    </AnimatePresence>
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 border-b border-neutral-300">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Apply as a Nutritionist</h1>
          <p className="text-neutral-600">Tell us a few details so we can verify your profile. We'll review and get back to you soon.</p>
        </div>
      </header>

      <main className="px-6 py-8">
        <form className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <div>
              <Label>First Name</Label>
              <Input placeholder="Enter your first name" {...register("firstName")} />
              {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label>Family Name</Label>
              <Input placeholder="Enter your family name" {...register("familyName")} />
              {errors.familyName && <p className="text-sm text-red-600">{errors.familyName.message}</p>}
            </div>
            <div>
              <Label>Mobile Number</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-neutral-300 bg-neutral-50 text-neutral-600">+20</span>
                <Input placeholder="1X XXX XXXX" className="rounded-l-none" inputMode="numeric" maxLength={10}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
                    const full = `+20${digits}`
                    setValue("phone", full, { shouldValidate: true })
                    e.target.value = digits
                  }} />
              </div>
              {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>
            <div>
              <Label>Email Address</Label>
              <Input type="email" placeholder="Enter your email address" {...register("email")} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Identification</h2>
            <div>
              <Label>ID Type</Label>
              <RadioGroup defaultValue="national_id" onValueChange={(v) => setValue("idType", v as any, { shouldValidate: true })} className="mt-2">
                <div className="flex items-center gap-3">
                  <RadioGroupItem id="nat" value="national_id" />
                  <Label htmlFor="nat">National ID</Label>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <RadioGroupItem id="pass" value="passport" />
                  <Label htmlFor="pass">Passport</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>ID Number</Label>
              <Input placeholder="Enter your ID number" {...register("idNumber")} inputMode={idType === "national_id" ? "numeric" : "text"} maxLength={idType === "national_id" ? 14 : 9} />
              {errors.idNumber && <p className="text-sm text-red-600">{errors.idNumber.message}</p>}
            </div>
          </section>

          <section className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Documents</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-dashed border-2">
                <CardContent className="p-6">
                  <div {...getCvRoot()} className={`rounded-lg p-6 text-center cursor-pointer ${cvActive ? "bg-primary-50 border-primary-300" : "bg-neutral-50 border-neutral-300"}`}>
                    <input {...getCvInput()} />
                    <p className="font-medium">Drag and drop or click to upload</p>
                    <p className="text-sm text-neutral-600">PDF, JPG, or PNG — max 10MB</p>
                  </div>
                  {errors.cvFile && <p className="text-sm text-red-600 mt-2">CV required</p>}
                  {ocrState.cv && <p className="text-sm text-neutral-700 mt-3">{ocrState.cv}</p>}
                </CardContent>
              </Card>
              <Card className="border-dashed border-2">
                <CardContent className="p-6">
                  <div {...getIdRoot()} className={`rounded-lg p-6 text-center cursor-pointer ${idActive ? "bg-primary-50 border-primary-300" : "bg-neutral-50 border-neutral-300"}`}>
                    <input {...getIdInput()} />
                    <p className="font-medium">{idTitle}</p>
                    <p className="text-sm text-neutral-600">JPG or PNG — front side, clear photo</p>
                  </div>
                  {errors.idFile && <p className="text-sm text-red-600 mt-2">{idType === "national_id" ? "ID photo required" : "Passport photo required"}</p>}
                  {ocrState.id && <p className="text-sm text-neutral-700 mt-3">{ocrState.id}</p>}
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="md:col-span-2 space-y-3">
            <div className="flex items-start gap-3">
              <input id="consent" type="checkbox" {...register("consent")} className="mt-1" />
              <Label htmlFor="consent" className="font-normal">
                I consent to WeightWin using OCR to extract relevant information from my documents for verification. <a className="underline" href="#">Privacy</a> and <a className="underline" href="#">Terms</a>.
              </Label>
            </div>
            {errors.consent && <p className="text-sm text-red-600">{errors.consent.message}</p>}
          </section>

          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/")}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit details"}</Button>
          </div>
        </form>
      </main>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl text-center">
            <div className="mx-auto mb-4 w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">✓</div>
            <h3 className="text-lg font-semibold mb-2">Application submitted</h3>
            <p className="text-neutral-700 mb-6">Thank you for applying to WeightWin. Our Admin will review your application and contact you soon 😊</p>
            <Button onClick={() => { setShowSuccess(false); router.push("/") }}>Close</Button>
          </div>
        </div>
      )}
    </div>
  )
}


