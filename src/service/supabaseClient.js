import { createClient } from '@supabase/supabase-js'
// Read env variables (Vite only exposes VITE_ prefixed ones)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Key is missing. Check your .env file.')
}

// Supabase client for free/anonymous usage (no auth required)
export const supabase = createClient(supabaseUrl, supabaseKey)
