import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const settingsSchema = z.object({
  weightUnit: z.enum(['kg', 'lb']).default('kg'),
  reminderTime: z.string().default('08:00'),
  timezone: z.string().default('UTC'),
  locationPermission: z.enum(['granted', 'denied', 'not_asked']).default('not_asked'),
  consentOcr: z.boolean().default(false),
  consentStorage: z.boolean().default(false),
  consentNutritionist: z.boolean().default(false)
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse and validate request body
    const body = await req.json()
    const parsed = settingsSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid settings data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    const settings = parsed.data
    
    // Save settings to database
    const { data, error } = await supabase.rpc('upsert_user_settings', {
      p_user_id: user.id,
      p_weight_unit: settings.weightUnit,
      p_reminder_time: settings.reminderTime,
      p_timezone: settings.timezone,
      p_location_permission: settings.locationPermission,
      p_consent_ocr: settings.consentOcr,
      p_consent_storage: settings.consentStorage,
      p_consent_nutritionist: settings.consentNutritionist
    })
    
    if (error) {
      console.error('Error saving settings:', error)
      return NextResponse.json(
        { error: 'Failed to save settings', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      settings: data
    })
  } catch (error) {
    console.error('Settings save error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

