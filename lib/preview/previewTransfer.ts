import { createClient } from '@/lib/supabase/client'
import { PreviewData } from './previewData'

/**
 * Transfer preview data to Supabase after user signs up
 */
export async function transferPreviewDataToSupabase(
  previewData: PreviewData,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // 1. Save weight entry with photo
    if (previewData.weight && previewData.photoBase64) {
      // First, upload photo to Supabase Storage
      const photoBlob = await fetch(previewData.photoBase64).then(r => r.blob())
      const fileName = `${userId}/${Date.now()}-preview.jpg`
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('weight-photos')
        .upload(fileName, photoBlob)

      if (uploadError) {
        console.error('Failed to upload photo:', uploadError)
        return { success: false, error: 'Failed to upload photo' }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('weight-photos')
        .getPublicUrl(fileName)

      // Insert weight entry
      const { error: entryError } = await supabase
        .from('weight_tracking')
        .insert({
          user_id: userId,
          weight_kg: previewData.weight,
          photo_url: publicUrl,
          tracked_at: previewData.photoTimestamp,
          is_verified: true
        })

      if (entryError) {
        console.error('Failed to insert weight entry:', entryError)
        return { success: false, error: 'Failed to save weight entry' }
      }
    }

    // 2. Update user settings with First Step badge
    if (previewData.firstStepBadgeEarned) {
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          badges_earned: ['first_step'],
          updated_at: new Date().toISOString()
        })

      if (settingsError) {
        console.error('Failed to save badge:', settingsError)
        // Don't fail the whole transfer if badge fails
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Transfer error:', error)
    return { success: false, error: error.message }
  }
}


