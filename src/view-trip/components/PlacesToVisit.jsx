import React from "react";
import PlaceCardItem from "./PlaceCardItem";

function PlacesToVisit({ trip }) {

  if (!trip?.itinerary) {
    return (
      <div className="mt-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">📍</span>
          </div>
          <h2 className="font-bold text-2xl text-cyan-500">Places To Visit</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">No itinerary data available</p>
        </div>
      </div>
    );
  }

  let itineraryArray = [];

  if (Array.isArray(trip.itinerary.dailyPlans)) {
    itineraryArray = trip.itinerary.dailyPlans;
  } 
  else if (Array.isArray(trip.itinerary)) {
    itineraryArray = trip.itinerary;
  } 
  else {
    itineraryArray = Object.values(trip.itinerary);
  }

  if (itineraryArray.length === 0) {
    return (
      <div className="mt-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">📍</span>
          </div>
          <h2 className="font-bold text-2xl text-cyan-500">Places To Visit</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">No daily plans available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-xl">📍</span>
        </div>
        <h2 className="font-bold text-2xl text-cyan-500">Places To Visit</h2>
      </div>

      <div className="space-y-8">
        {itineraryArray.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="mb-6">
              <h2 className="font-bold text-2xl text-cyan-500 mb-2">
                {item.day || `Day ${index + 1}`}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.isArray(item.plan) ? (
                item.plan.map((place, placeIndex) => (
                  <div
                    key={placeIndex}
                    className="bg-gray-50 rounded-lg p-4 min-h-[280px] flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <h3 className="font-semibold text-sm text-red-600 uppercase tracking-wide">
                        {place.time || `Activity ${placeIndex + 1}`}
                      </h3>
                    </div>

                    <PlaceCardItem place={place} />
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-gray-50 rounded-lg p-8 flex items-center justify-center">
                  <p className="text-gray-500">No places data available</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlacesToVisit;
