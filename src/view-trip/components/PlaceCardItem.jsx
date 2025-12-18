import React from 'react';
import { FaMapLocationDot } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { GetPlaceDetails } from '@/service/GlobalApi'; 

const PHOTO_REF_URL =
  'https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=1200&maxWidthPx=1200&key=' +
  import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

function PlaceCardItem({ place }) {
  const [photoUrl, setPhotoUrl] = useState();
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  useEffect(() => {
    if (place && place.placeName) {
      GetPlacePhoto();
    }
  }, [place]);

  const GetPlacePhoto = async () => {
    if (!place || !place.placeName) {
      console.warn('Place or placeName is missing:', place);
      return;
    }

    setIsLoadingPhoto(true);
    try {
      const data = {
        textQuery: place.placeName
      };

      const result = await GetPlaceDetails(data);
      const photos = result?.data?.places?.[0]?.photos;

      if (photos?.length > 0) {
        const photoName = photos[0].name;
        const PhotoUrl = PHOTO_REF_URL.replace('{NAME}', photoName);
        setPhotoUrl(PhotoUrl);
        console.log('Photo URL generated:', PhotoUrl); 
      } else {
        console.warn('No photos found for place:', place.placeName);
      }
    } catch (error) {
      console.error('Error fetching place photo:', error);
    } finally {
      setIsLoadingPhoto(false);
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
    <Link to={'https://www.google.com/maps/search/?api=1&query=' + (place.placeName || '')} target='_blank'>
      <div className="group bg-white border border-sky-100 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer overflow-hidden">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="relative overflow-hidden rounded-xl flex-shrink-0">
            {isLoadingPhoto ? (
              <div className="w-full md:w-[160px] h-[160px] bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
                <span className="text-gray-400 text-sm">Loading...</span>
              </div>
            ) : (
              <img
                src={photoUrl || "https://via.placeholder.com/160x160/e0f2fe/0891b2?text=No+Image"}
                alt="Place Image"
                className="w-full md:w-[160px] h-[160px] object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  console.error('Image failed to load:', photoUrl);
                  e.target.src = "https://via.placeholder.com/160x160/e0f2fe/0891b2?text=No+Image";
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
                   
          <div className="flex-1 space-y-3">
            <h3 className="font-bold text-lg text-gray-800 group-hover:text-sky-700 transition-colors leading-tight">
              {place.placeName || 'Place name not available'}
            </h3>
            
            <p className='text-sm text-gray-600 leading-relaxed line-clamp-3'>
              {place.placeDetails || 'No place description available'}
            </p>
            
            <div className="flex items-center justify-between pt-2">
              <div className='flex items-center gap-2 px-3 py-1 bg-sky-50 rounded-full'>
                <span className="text-sky-500">⏱️</span>
                <span className='text-sm font-medium text-sky-700'>
                  {place.timeToTravel || 'Not specified'}
                </span>
              </div>
              
              <button className="group/btn bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 active:scale-95">
                <FaMapLocationDot className="w-4 h-4 text-white group-hover/btn:bounce" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PlaceCardItem;