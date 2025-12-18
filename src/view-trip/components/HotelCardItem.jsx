import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GetPlaceDetails } from '@/service/GlobalApi'; 

const PHOTO_REF_URL =
  'https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=1200&maxWidthPx=1200&key=' +
  import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

function HotelCardItem({ hotel }) {
  const [photoUrl, setPhotoUrl] = useState();

  useEffect(() => {
    if (hotel) GetPlacePhoto();
  }, [hotel]);

  const GetPlacePhoto = async () => {
    try {
      const data = { textQuery: hotel?.hotelName };
      const result = await GetPlaceDetails(data);
      const photos = result?.data?.places?.[0]?.photos;

      if (photos?.length > 0) {
        const photoName = photos[0].name;
        const url = PHOTO_REF_URL.replace('{NAME}', photoName);
        setPhotoUrl(url);
      } else {
        console.warn('No photos found for hotel:', hotel?.hotelName);
      }
    } catch (error) {
      console.error('Error fetching hotel photo:', error);
    }
  };

  return (
    <Link
      to={`https://www.google.com/maps/search/?api=1&query=${hotel?.hotelAddress}`}
      target="_blank"
      className="group h-full"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border border-sky-100 h-full flex flex-col">
        <div className="relative overflow-hidden">
          <img
            src={photoUrl || '/fallback-hotel.jpg'}
            alt="Hotel Image"
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="font-bold text-lg text-gray-800 group-hover:text-sky-700 transition-colors mb-3 h-14 overflow-hidden">
              {hotel?.hotelName}
            </h3>
            <div className="flex items-start gap-2 mb-4">
              <span className="text-sky-500 mt-1 flex-shrink-0">📍</span>
              <p className="text-sm text-gray-600 leading-relaxed h-10 overflow-hidden">
                {hotel?.hotelAddress}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <span className="text-emerald-500">💰</span>
              <span className="text-sm font-semibold text-emerald-600">
                {hotel?.price}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm font-semibold text-gray-700">
                {hotel?.rating}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default HotelCardItem;
