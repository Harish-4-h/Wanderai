// src/service/GeoapifyService.js

import axios from "axios";

// Geoapify Geocoding endpoint (CORS-safe)
const GEOAPIFY_BASE_URL = "https://api.geoapify.com/v1/geocode/search";

// Centralized API key read (prevents undefined retries)
const GEOAPIFY_API_KEY = import.meta.env.VITE_GEO_API_KEY;

export const getLocationData = async (locationLabel) => {
  if (!locationLabel || !GEOAPIFY_API_KEY) {
    console.warn("Geoapify skipped: missing location or API key");
    return null;
  }

  try {
    const response = await axios.get(GEOAPIFY_BASE_URL, {
      params: {
        text: locationLabel,
        apiKey: GEOAPIFY_API_KEY,
        format: "json",
        limit: 1,
      },
      headers: {
        "Accept": "application/json",
      },
    });

    const data = response?.data;

    if (
      data &&
      data.features &&
      Array.isArray(data.features) &&
      data.features.length > 0
    ) {
      const feature = data.features[0];
      const props = feature.properties || {};

      return {
        name: props.name || locationLabel,
        city: props.city || "",
        country: props.country || "",
        lat: props.lat || null,
        lon: props.lon || null,
        formatted: props.formatted || locationLabel,
      };
    }

    return null;
  } catch (error) {
    console.error(
      "Geoapify geocode error:",
      error?.response?.data || error.message
    );
    return null;
  }
};
