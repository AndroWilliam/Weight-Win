import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
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
    
    // Get user settings from database
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings', details: error.message },
        { status: 500 }
      )
    }
    
    // If no settings found, check if user has any weight entries (existing users)
    if (!settings) {
      // Fallback: check if user has completed any weight check-ins
      const { data: weightEntries, error: weightError } = await supabase
        .from('weight_entries')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
      
      if (weightError) {
        console.error('Error checking weight entries:', weightError)
      }
      
      // If user has weight entries, they're an existing user who completed setup before
      // the user_settings table was created
      if (weightEntries && weightEntries.length > 0) {
        return NextResponse.json({
          success: true,
          settings: null, // No settings saved, but setup is complete
          setupCompleted: true, // Existing user
          isLegacyUser: true // Flag to indicate they need to save settings on next visit
        })
      }
      
      // New user who hasn't completed setup
      return NextResponse.json({
        success: true,
        settings: null,
        setupCompleted: false
      })
    }
    
    return NextResponse.json({
      success: true,
      settings: {
        weightUnit: settings.weight_unit,
        reminderTime: settings.reminder_time,
        timezone: settings.timezone,
        locationPermission: settings.location_permission,
        consentOcr: settings.consent_ocr_processing,
        consentStorage: settings.consent_data_storage,
        consentNutritionist: settings.consent_share_nutritionist,
        setupCompleted: settings.setup_completed
      },
      setupCompleted: settings.setup_completed
    })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

