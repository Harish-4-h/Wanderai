import React, { useEffect, useMemo, useState } from "react";
import PlaceCardItem from "./PlaceCardItem";
import { generateGPTResponse } from "@/service/OpenAIService";

function PlacesToVisit({ trip }) {
  console.log("PLACES COMPONENT RENDERED");

  const [gptPlacesCache, setGptPlacesCache] = useState({});
  const [loadingGPT, setLoadingGPT] = useState(false);
  const [error, setError] = useState("");

  const fallbackPlaces = [
    { placeName: "Eiffel Tower", placeDetails: "Iconic landmark in Paris", timeToTravel: "2 hrs" },
    { placeName: "Louvre Museum", placeDetails: "Famous art museum", timeToTravel: "3 hrs" },
    { placeName: "Notre Dame Cathedral", placeDetails: "Historic cathedral", timeToTravel: "1.5 hrs" },
    { placeName: "Montmartre", placeDetails: "Artistic district with city views", timeToTravel: "2 hrs" }
  ];

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
  }, [trip]);

  console.log("DESTINATION >>>", destination);

  const fetchPlacesFromGPT = async () => {
    if (!destination) return;

    // Return cached result if available
    if (gptPlacesCache[destination]) return;

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

      const response = await generateGPTResponse(prompt);
      const parsed = JSON.parse(response);

      setGptPlacesCache((prev) => ({
        ...prev,
        [destination]: Array.isArray(parsed) ? parsed : fallbackPlaces,
      }));
    } catch (err) {
      console.error("GPT fetch error:", err);
      setError("Failed to fetch places from GPT. Showing fallback.");
      setGptPlacesCache((prev) => ({
        ...prev,
        [destination]: fallbackPlaces,
      }));
    } finally {
      setLoadingGPT(false);
    }
  };

  useEffect(() => {
    fetchPlacesFromGPT();
  }, [destination]);

  const itineraryArray = trip?.itinerary
    ? Array.isArray(trip.itinerary.dailyPlans)
      ? trip.itinerary.dailyPlans
      : Array.isArray(trip.itinerary)
      ? trip.itinerary
      : Object.values(trip.itinerary)
    : [];

  const displayArray =
    itineraryArray.length > 0
      ? itineraryArray.map((item) => ({
          ...item,
          plan: item.plan || gptPlacesCache[destination] || (loadingGPT ? [] : fallbackPlaces),
        }))
      : [
          {
            day: "Tourist Attractions",
            plan: gptPlacesCache[destination] || (loadingGPT ? [] : fallbackPlaces),
          },
        ];

  return (
    <div className="mt-5">
      <h2 className="font-bold text-2xl text-cyan-500 mb-6">Places To Visit</h2>

      {loadingGPT && (
        <div className="text-center py-8 text-gray-500">
          Fetching places from GPT...
        </div>
      )}

      {error && <div className="text-center py-4 text-red-500">{error}</div>}

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
                    timeToTravel: place.timeToTravel
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

export default PlacesToVisit;
