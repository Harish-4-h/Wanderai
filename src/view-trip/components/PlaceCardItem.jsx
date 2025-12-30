import React, { useEffect, useState } from "react";
import { FaMapLocationDot } from "react-icons/fa6";

const GEO_API_KEY = import.meta.env.VITE_GEO_API_KEY;
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

function PlaceCardItem({ place }) {
  const [photoUrl, setPhotoUrl] = useState();
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  useEffect(() => {
    if (place?.name) fetchPlacePhoto();
  }, [place]);

  const fetchPlacePhoto = async () => {
    setIsLoadingPhoto(true);

    try {
      // 1️⃣ Try Geoapify
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
        // 2️⃣ Fallback to Unsplash
        const unsplashRes = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            place.name
          )}&per_page=1&orientation=landscape`,
          {
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
          }
        );
        const unsplashData = await unsplashRes.json();
        const unsplashPhoto = unsplashData?.results?.[0]?.urls?.regular;

        setPhotoUrl(
          unsplashPhoto ||
            "https://via.placeholder.com/160x160/e0f2fe/0891b2?text=No+Image"
        );
      }
    } catch {
      setPhotoUrl("https://via.placeholder.com/160x160/e0f2fe/0891b2?text=No+Image");
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
      <div className="group bg-white border border-sky-100 rounded-2xl p-5 shadow-lg transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl cursor-pointer overflow-hidden">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="relative overflow-hidden rounded-xl flex-shrink-0">
            {isLoadingPhoto ? (
              <div className="w-full md:w-[160px] h-[160px] bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
                <span className="text-gray-400 text-sm">Loading...</span>
              </div>
            ) : (
              <img
                src={photoUrl}
                alt={place.name}
                className="w-full md:w-[160px] h-[160px] object-cover transform transition-transform duration-500 group-hover:scale-110"
                onError={(e) =>
                  (e.target.src =
                    "https://via.placeholder.com/160x160/e0f2fe/0891b2?text=No+Image")
                }
              />
            )}
          </div>

          <div className="flex-1 space-y-3">
            <h3 className="font-bold text-lg text-gray-800 transform transition-colors duration-300 group-hover:text-sky-700 leading-tight">
              {place.name}
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {place.details || "No place description available"}
            </p>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-sky-50 rounded-full">
                <span className="text-sky-500">⏱️</span>
                <span className="text-sm font-medium text-sky-700">
                  {place.timeToTravel || "Not specified"}
                </span>
              </div>

              <button className="group/btn bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 p-2 rounded-full shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-110 active:scale-95">
                <FaMapLocationDot className="w-4 h-4 text-white group-hover/btn:animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

export default PlaceCardItem;
