import { z } from 'zod'

export const EGY_MOBILE = /^\+20(10|11|12|15)\d{8}$/

export const ApplySchema = z.object({
  firstName: z.string().min(1, 'Required'),
  familyName: z.string().min(1, 'Required'),
  phone: z.string().regex(EGY_MOBILE, 'Egyptian number only'),
  email: z.string().email('Invalid email'),
  idType: z.enum(['national_id', 'passport']),
  idNumber: z.string().superRefine((val, ctx) => {
    const t = (ctx as any).parent?.idType ?? (ctx as any).data?.idType // RHF Adapter
    if (t === 'national_id' && !/^\d{14}$/.test(val)) {
      ctx.addIssue({ code: 'custom', message: '14 digits required' })
    }
    if (t === 'passport' && !/^[A-Za-z0-9]{9}$/.test(val)) {
      ctx.addIssue({ code: 'custom', message: '9 characters required' })
    }
  }),
  cvPath: z.string().min(1, 'Required'),
  idPath: z.string().min(1, 'Required'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
})

export type ApplyInput = z.infer<typeof ApplySchema>
