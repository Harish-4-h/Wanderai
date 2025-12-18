// src/service/GeopifyService.js

import axios from 'axios';

// Make sure you have your Geoapify API key in your .env file
// VITE_GEOAPIFY_API_KEY=YOUR_API_KEY

const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1/geocode/search';

export const getLocationData = async (locationLabel) => {
  if (!locationLabel) return null;

  try {
    const response = await axios.get(GEOAPIFY_BASE_URL, {
      params: {
        text: locationLabel,
        apiKey: import.meta.env.VITE_GEOAPIFY_API_KEY,
        format: 'json',
      },
    });

    const data = response.data;

    if (data && data.features && data.features.length > 0) {
      // Return the first matched feature
      const feature = data.features[0];
      return {
        name: feature.properties.name,
        city: feature.properties.city,
        country: feature.properties.country,
        lat: feature.properties.lat,
        lon: feature.properties.lon,
        formatted: feature.properties.formatted,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching Geoapify data:', error);
    return null;
  }
};
