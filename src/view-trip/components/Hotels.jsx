import React, { useState, useEffect } from 'react';
import { FaMapLocationDot } from 'react-icons/fa6';

function PlaceCardItem({ place }) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

  useEffect(() => {
    if (place?.placeName) fetchPlaceImage();
  }, [place]);

  const fetchPlaceImage = async () => {
    setIsLoading(true);
    try {
      const query = place?.placeName || 'travel';
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          query
        )}&per_page=1&orientation=landscape`,
        {
          headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        }
      );
      const data = await res.json();
      const firstImage = data?.results?.[0];
      setPhotoUrl(
        firstImage?.urls?.regular ||
          'https://via.placeholder.com/160x160/e0f2fe/0891b2?text=No+Image'
      );
    } catch (err) {
      console.error('Error fetching place image:', err);
      setPhotoUrl('https://via.placeholder.com/160x160/e0f2fe/0891b2?text=No+Image');
    } finally {
      setIsLoading(false);
    }
  };

  if (!place) {
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-2xl p-5 shadow-lg">
        <div className="text-center text-gray-500">
          <p>No place data available</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        place.placeName || ''
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer overflow-hidden">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="relative overflow-hidden rounded-xl flex-shrink-0">
            {isLoading ? (
              <div className="w-full md:w-[160px] h-[160px] bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
                <span className="text-gray-400 text-sm">Loading...</span>
              </div>
            ) : (
              <img
                src={photoUrl}
                alt={place.placeName || 'Place'}
                className="w-full md:w-[160px] h-[160px] object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) =>
                  (e.target.src =
                    'https://via.placeholder.com/160x160/e0f2fe/0891b2?text=No+Image')
                }
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          <div className="flex-1 space-y-3">
            <h3 className="font-bold text-lg text-gray-800 group-hover:text-sky-700 transition-colors leading-tight">
              {place.placeName || 'Place name not available'}
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {place.placeDetails || 'No place description available'}
            </p>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-sky-50 rounded-full">
                <span className="text-sky-500">⏱️</span>
                <span className="text-sm font-medium text-sky-700">
                  {place.timeToTravel || 'Not specified'}
                </span>
              </div>
              <button className="bg-gradient-to-r from-sky-500 to-cyan-500 p-2 rounded-full shadow-md hover:shadow-lg">
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
