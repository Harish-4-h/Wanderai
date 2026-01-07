import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// 1️⃣ Replace with your Supabase credentials
const SUPABASE_URL = 'https://ghmskbfdgzhfgwrvpldz.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdobXNrYmZkZ3poZmd3cnZwbGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODkyMzIsImV4cCI6MjA4MTM2NTIzMn0.s-2r8i2G1G4eAaEFQVbj4-iV35eLLnLG0Ov4RvA5d8U'; // service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 2️⃣ Function to geocode location using Nominatim
async function geocodeLocation(label) {
  if (!label) return [0, 0];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        label
      )}`,
      { headers: { 'User-Agent': 'WanderAI-App' } } // required by Nominatim
    );
    const data = await res.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (err) {
    console.error('Geocoding failed for', label, err);
  }
  return [0, 0]; // fallback
}

// 3️⃣ Main function to update all trips
async function updateTrips() {
  const { data: trips, error } = await supabase.from('AITrips').select('*');
  if (error) {
    console.error('Failed to fetch trips:', error);
    return;
  }

  for (const trip of trips) {
    // Skip if already has coordinates
    if (trip.latitude && trip.longitude) continue;

    const locationLabel = trip.user_selection?.location?.label;
    if (!locationLabel) continue;

    console.log(`Geocoding trip ${trip.id}: ${locationLabel}`);
    const [lat, lon] = await geocodeLocation(locationLabel);

    const { error: updateError } = await supabase
      .from('AITrips')
      .update({ latitude: lat, longitude: lon })
      .eq('id', trip.id);

    if (updateError) {
      console.error(`Failed to update trip ${trip.id}:`, updateError);
    } else {
      console.log(`Trip ${trip.id} updated: ${lat}, ${lon}`);
    }
  }

  console.log('✅ All trips updated.');
}

// Run the update
updateTrips();
