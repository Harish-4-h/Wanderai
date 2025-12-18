import { supabase } from './supabaseClient'

// Save a new trip
export const saveTrip = async (userId, userEmail, tripDataObj, formData) => {
  const { data, error } = await supabase
    .from('AITrips')
    .insert([{
      user_id: userId,
      user_email: userEmail,
      user_selection: formData,
      trip_data: tripDataObj,
      created_at: new Date().toISOString()
    }])
  if (error) throw error
  return data
}

// Fetch trips for a user
export const fetchTrips = async (userId) => {
  const { data, error } = await supabase
    .from('AITrips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Fetch single trip by id
export const fetchTripById = async (id) => {
  const { data, error } = await supabase
    .from('AITrips')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}
