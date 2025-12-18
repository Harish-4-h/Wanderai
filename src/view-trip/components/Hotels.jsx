import { Target } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import HotelCardItem from './HotelCardItem';


function Hotels({ trip }) {
  return (
    <div className="py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-xl">🏨</span>
        </div>
        <h2 className="font-bold text-2xl text-cyan-500">
          Hotels Recommendation
        </h2>
      </div>
      
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {trip?.tripData?.hotels?.map((hotel, index) => (
          <HotelCardItem key={hotel.id || index} hotel={hotel} />
        ))}
      </div>
    </div>
  );
}

export default Hotels;