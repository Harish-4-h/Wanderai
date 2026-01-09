import React, { useEffect, useMemo, useRef, useState } from "react";
import PlaceCardItem from "./PlaceCardItem";
import { generateGPTResponse } from "@/service/OpenAIService";

// Fallback placeholder
const PLACEHOLDER_IMAGE = "http://via.placeholder.com/160x160?text=No+Image";

// Unsplash API key (optional)
const UNSPLASH_ACCESS_KEY = "JpOzntE4LoN-YauV478xtJJBKu2NloKrBZfMuQAusf4";

async function fetchImageForPlace(placeName) {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        placeName
      )}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`
    );
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.small;
    }
    return PLACEHOLDER_IMAGE;
  } catch (err) {
    console.error("Image fetch error:", err);
    return PLACEHOLDER_IMAGE;
  }
}

function PlacesToVisit({ trip }) {
  const [gptPlacesCache, setGptPlacesCache] = useState({});
  const [loadingGPT, setLoadingGPT] = useState(false);
  const [error, setError] = useState("");

  const inFlightRef = useRef(false);
  const fetchedDestinationsRef = useRef(new Set());

  // Parse destination once (STABLE)
  const destination = useMemo(() => {
    try {
      const selection =
        typeof trip?.user_selection === "string"
          ? JSON.parse(trip.user_selection)
          : trip?.user_selection;
      return (
        selection?.destination?.label ||
        selection?.location?.label ||
        selection?.place?.label ||
        null
      );
    } catch {
      return null;
    }
  }, [trip?.user_selection]);

  const fallbackPlaces = useMemo(
    () => [
      {
        placeName: "Eiffel Tower",
        placeDetails: "Iconic landmark in Paris",
        timeToTravel: "2 hrs",
      },
      {
        placeName: "Louvre Museum",
        placeDetails: "Famous art museum",
        timeToTravel: "3 hrs",
      },
      {
        placeName: "Notre Dame Cathedral",
        placeDetails: "Historic cathedral",
        timeToTravel: "1.5 hrs",
      },
      {
        placeName: "Montmartre",
        placeDetails: "Artistic district with city views",
        timeToTravel: "2 hrs",
      },
    ],
    []
  );

  // Fetch GPT places only once per destination (HARD LOCKED)
  const fetchPlacesFromGPT = async () => {
    if (!destination) return;
    if (gptPlacesCache[destination]) return;
    if (fetchedDestinationsRef.current.has(destination)) return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setLoadingGPT(true);
    setError("");

    try {
      const prompt = `
Return ONLY a valid JSON array.
No text, no markdown, no explanation.

[
  { "placeName": "string", "placeDetails": "string", "timeToTravel": "string" }
]

Destination: ${destination}
`;

      const rawResponse = await generateGPTResponse(prompt);

      let places;
      try {
        const parsed =
          typeof rawResponse === "string"
            ? JSON.parse(rawResponse)
            : rawResponse;
        places = Array.isArray(parsed) && parsed.length > 0 ? parsed : fallbackPlaces;
      } catch {
        places = fallbackPlaces;
      }

      const placesWithImages = await Promise.all(
        places.map(async (place) => ({
          ...place,
          image: await fetchImageForPlace(place.placeName),
        }))
      );

      setGptPlacesCache((prev) => ({
        ...prev,
        [destination]: placesWithImages,
      }));

      fetchedDestinationsRef.current.add(destination);
    } catch (err) {
      console.error("GPT fetch error:", err);
      setError("Failed to fetch places from GPT. Showing fallback.");

      const fallbackWithImages = await Promise.all(
        fallbackPlaces.map(async (place) => ({
          ...place,
          image: await fetchImageForPlace(place.placeName),
        }))
      );

      setGptPlacesCache((prev) => ({
        ...prev,
        [destination]: fallbackWithImages,
      }));

      fetchedDestinationsRef.current.add(destination);
    } finally {
      inFlightRef.current = false;
      setLoadingGPT(false);
    }
  };

  useEffect(() => {
    fetchPlacesFromGPT();
  }, [destination]);

  // Stable itinerary array
  const itineraryArray = useMemo(() => {
    if (!trip?.itinerary) return [];
    if (Array.isArray(trip.itinerary.dailyPlans))
      return trip.itinerary.dailyPlans;
    if (Array.isArray(trip.itinerary)) return trip.itinerary;
    return Object.values(trip.itinerary);
  }, [trip?.itinerary]);

  // Stable display array (NO RE-RENDER LOOP)
  const displayArray = useMemo(() => {
    const places = gptPlacesCache[destination] || fallbackPlaces;

    if (itineraryArray.length > 0) {
      return itineraryArray.map((item) => ({
        ...item,
        plan: item.plan && item.plan.length > 0 ? item.plan : places,
      }));
    }

    return [{ day: "Tourist Attractions", plan: places }];
  }, [itineraryArray, gptPlacesCache, destination, fallbackPlaces]);

  return (
    <div className="mt-5">
      <h2 className="font-bold text-2xl text-cyan-500 mb-6">
        Places To Visit
      </h2>

      {loadingGPT && (
        <div className="text-center py-8 text-gray-500">
          Fetching places and images...
        </div>
      )}

      {error && (
        <div className="text-center py-4 text-red-500">{error}</div>
      )}

      <div className="space-y-8">
        {displayArray.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-xl">
            <h3 className="font-bold text-xl mb-4">
              {item.day || `Day ${index + 1}`}
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {item.plan?.map((place, i) => (
                <PlaceCardItem
                  key={i}
                  place={{
                    name: place.placeName,
                    details: place.placeDetails,
                    timeToTravel: place.timeToTravel,
                    image: place.image || PLACEHOLDER_IMAGE,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(PlacesToVisit);
