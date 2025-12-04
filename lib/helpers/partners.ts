import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Generate a URL-friendly slug from a partner name
 * Example: "BOLD Soccer Academy" -> "bold-soccer-academy"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Ensure a slug is unique by appending a counter if needed
 * Example: If "test-gym" exists, returns "test-gym-1"
 * 
 * @param supabase - Supabase client instance
 * @param baseSlug - The base slug to check
 * @param excludeId - Optional ID to exclude (for updates)
 * @param tableName - Table to check for uniqueness ('partners' or 'campaigns')
 * @returns A unique slug
 */
export async function ensureUniqueSlug(
  supabase: SupabaseClient,
  baseSlug: string,
  excludeId?: string,
  tableName: string = 'partners'
): Promise<string> {
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    let query = supabase
      .from(tableName)
      .select('id')
      .eq('slug', slug)
    
    if (excludeId) {
      query = query.neq('id', excludeId)
    }
    
    const { data } = await query.single()
    
    if (!data) break // Slug is unique
    
    slug = `${baseSlug}-${counter}`
    counter++
  }
  
  return slug
}

