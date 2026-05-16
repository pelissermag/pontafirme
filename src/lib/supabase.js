import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Get public URL for a file in Supabase Storage
 * @param {string} bucket - 'fotos', 'videos', or 'jogadores'
 * @param {string} filename - file name stored in DB
 * @returns {string|null}
 */
export function storageUrl(bucket, filename) {
  if (!filename) return null
  // If filename is already a full URL, return it
  if (filename.startsWith('http')) return filename
  
  return `${import.meta.env.VITE_SUPABASE_STORAGE_URL}/${bucket}/${filename}`
}
