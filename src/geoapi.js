const GEO_API_KEY = import.meta.env.VITE_GEO_API_KEY;

export async function searchLocation(query) {
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
    query
  )}&limit=5&apiKey=${GEO_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Geo API request failed");
  }

  return res.json();
}
