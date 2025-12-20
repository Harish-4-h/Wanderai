import React, { useEffect, useState } from "react";
import axios from "axios";

function InfoSection({ trip }) {
  const [photoUrl, setPhotoUrl] = useState();
  const [placeData, setPlaceData] = useState(null);

  // Example fallback photo
  const FALLBACK_PHOTO = "https://source.unsplash.com/1200x600/?travel";

  useEffect(() => {
    if (trip) getPlacePhoto();
  }, [trip]);

  const getPlacePhoto = async () => {
    try {
      // Use Geoapify autocomplete to get place info
      const response = await axios.get(
        "https://api.geoapify.com/v1/geocode/autocomplete",
        {
          params: {
            text: trip?.userSelection?.location?.label,
            apiKey: import.meta.env.VITE_GEOAPIFY_AUTOCOMPLETE_KEY,
            limit: 1,
          },
        }
      );

      const place = response.data.features[0];
      setPlaceData(place);

      // Use a photo if available, else fallback
      // Geoapify doesn't provide photos directly, so we'll use a generic Unsplash search
      const photoQuery = trip?.userSelection?.location?.label || "travel";
      setPhotoUrl(
        `https://source.unsplash.com/1200x600/?${encodeURIComponent(photoQuery)}`
      );
    } catch (error) {
      console.error("Geoapify API Error:", error);
      setPhotoUrl(FALLBACK_PHOTO);
    }
  };

  return (
    <div className="my-8">
      <div className="relative overflow-hidden rounded-2xl shadow-xl">
        <img
          src={photoUrl || FALLBACK_PHOTO}
          alt={trip?.userSelection?.location?.label || "Trip Image"}
          loading="lazy"
          decoding="async"
          className="h-[400px] w-full object-cover rounded-2xl shadow-xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>

        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex justify-between items-end">
            <div className="space-y-4">
              <h1 className="font-bold text-4xl md:text-5xl drop-shadow-lg">
                {trip?.userSelection?.location?.label}
              </h1>

              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <span className="text-sm md:text-base font-medium flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    {trip?.userSelection?.noOfDays} Days
                  </span>
                </div>

                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <span className="text-sm md:text-base font-medium flex items-center gap-2">
                    <span className="text-lg">💵</span>
                    {trip?.userSelection?.budget} Budget
                  </span>
                </div>

                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <span className="text-sm md:text-base font-medium flex items-center gap-2">
                    <span className="text-lg">👥</span>
                    {trip?.userSelection?.traveler}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoSection;
