import { supabase } from './supabaseClient'

// Sign up with email/password
export const signUpWithEmail = async (email, password, name) => {
  const { data, error } = await supabase.auth.signUp(
    { email, password },
    { data: { full_name: name } }
  )
  if (error) throw error
  return data.user
}

// Sign in with email/password
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

// Sign out
export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Google OAuth
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
  if (error) throw error
  return data
}
