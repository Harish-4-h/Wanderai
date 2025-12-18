
import { FiSend } from "react-icons/fi";
import { GetPlaceDetails } from '@/service/GlobalApi';
import React, { useEffect, useState } from 'react'


const PHOTO_REF_URL='https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=2500&maxWidthPx=2500&key='+import.meta.env.VITE_GOOGLE_PLACE_API_KEY;
function InfoSection({trip}) {

  const[photoUrl, setPhotoUrl] = useState();
   useEffect(()=>{
   trip&&GetPlacePhoto();
   },[trip])
  const GetPlacePhoto=async()=>{
    const data={

      textQuery:trip?.userSelection?.location?.label
    }

    const result =await GetPlaceDetails(data).then(resp=>{
      console.log(resp.data.places[0].photos[3].name);
      const PhotoUrl=PHOTO_REF_URL.replace('{NAME}', resp.data.places[0].photos[3].name);
      setPhotoUrl(PhotoUrl);
    }

    )
  }
  return (
    <div className='my-8'>
      <div className="relative overflow-hidden rounded-2xl shadow-xl">
        <img 
          src={photoUrl}
           alt="Trip Image" 
           loading="lazy"
           decoding="async"
           className='h-[400px] w-full object-cover rounded-2xl shadow-xl'
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className='flex justify-between items-end'>
            <div className="space-y-4">
              <h1 className='font-bold text-4xl md:text-5xl drop-shadow-lg'>
                {trip?.userSelection?.location?.label}
              </h1>
              
              <div className='flex flex-wrap gap-3'>
                <div className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30'>
                  <span className='text-sm md:text-base font-medium flex items-center gap-2'>
                    <span className="text-lg">📅</span>
                    {trip?.userSelection?.noOfDays} Days
                  </span>
                </div>
                
                <div className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30'>
                  <span className='text-sm md:text-base font-medium flex items-center gap-2'>
                    <span className="text-lg">💵</span>
                    {trip?.userSelection?.budget} Budget
                  </span>
                </div>
                
                <div className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30'>
                  <span className='text-sm md:text-base font-medium flex items-center gap-2'>
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
  )
}

export default InfoSection