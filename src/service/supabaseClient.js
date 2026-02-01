import { createClient } from '@supabase/supabase-js'

<<<<<<< HEAD
// Load environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase client for free/anonymous usage (no auth required)
=======
// Read env variables (Vite only exposes VITE_ prefixed ones)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase env variables are missing')
}

>>>>>>> 01710c8 (Initial commit – WanderAI project setup)
export const supabase = createClient(supabaseUrl, supabaseKey)
