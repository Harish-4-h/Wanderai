import React, { useEffect, useState } from "react";
import { FaMapLocationDot } from "react-icons/fa6";

const GEO_API_KEY = import.meta.env.VITE_GEO_API_KEY;
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

function PlaceCardItem({ place, isTouristAttraction = false }) {
  const [photoUrl, setPhotoUrl] = useState();
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  useEffect(() => {
    if (place?.name) fetchPlacePhoto();
  }, [place]);

  const fetchPlacePhoto = async () => {
    setIsLoadingPhoto(true);
    try {
      const geoRes = await fetch(
        `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=text:${encodeURIComponent(
          place.name
        )}&limit=1&apiKey=${GEO_API_KEY}`
      );
      const geoData = await geoRes.json();
      const geoPhoto = geoData?.features?.[0]?.properties?.photo?.href;

      if (geoPhoto) {
        setPhotoUrl(geoPhoto);
      } else {
        const unsplashRes = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            place.name
          )}&per_page=1&orientation=landscape`,
          { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
        );
        const unsplashData = await unsplashRes.json();
        setPhotoUrl(
          unsplashData?.results?.[0]?.urls?.regular ||
            "https://via.placeholder.com/160x160?text=No+Image"
        );
      }
    } catch {
      setPhotoUrl("https://via.placeholder.com/160x160?text=No+Image");
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  if (!place) return null;

  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        place.name
      )}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-lg hover:scale-105 transition-all">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="overflow-hidden rounded-xl flex-shrink-0">
            {isLoadingPhoto ? (
              <div className="w-[160px] h-[160px] bg-gray-200 animate-pulse rounded-xl" />
            ) : (
              <img
                src={photoUrl}
                alt={place.name}
                className="w-[160px] h-[160px] object-cover"
              />
            )}
          </div>

          <div className="flex-1 space-y-3">
            <h3 className="font-bold text-lg text-black">
              {place.name}
            </h3>

            {/* 🔥 HARD FIX: force black + full opacity */}
            <p
              className="text-sm leading-relaxed line-clamp-3"
              style={{
                color: "#000000",
                opacity: 1
              }}
            >
              {place.details || "No place description available"}
            </p>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-sky-50 rounded-full">
                <span>⏱️</span>
                <span className="text-sm font-medium text-sky-700">
                  {place.timeToTravel || "Not specified"}
                </span>
              </div>

              <button className="bg-gradient-to-r from-sky-500 to-cyan-500 p-2 rounded-full">
                <FaMapLocationDot className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

export default PlaceCardItem;
