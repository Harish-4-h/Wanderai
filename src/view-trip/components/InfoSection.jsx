import React, { useEffect, useState } from "react";
import axios from "axios";

function InfoSection({ trip }) {
  const [photoUrl, setPhotoUrl] = useState("");

  const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

  useEffect(() => {
    if (trip) fetchDestinationImage();
  }, [trip]);

  const fetchDestinationImage = async () => {
    try {
      const locationLabel = trip?.user_selection?.location?.label?.trim();
      if (!locationLabel) return;

      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          locationLabel
        )}&per_page=1&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      const json = await res.json();
      const firstImage = json?.results?.[0];

      setPhotoUrl(
        firstImage?.urls?.regular ||
          "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
      );
    } catch (err) {
      console.error("Unsplash fetch error:", err);
      setPhotoUrl(
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
      );
    }
  };

  return (
    <div className="my-8">
      <div className="relative overflow-hidden rounded-2xl shadow-xl">
        <img src="/Images/Bottomimg.jpg"
          alt={trip?.user_selection?.location?.label || "Trip Image"}
          loading="lazy"
          decoding="async"
          className="h-[400px] w-full object-cover rounded-2xl shadow-xl"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>

        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex justify-between items-end">
            <div className="space-y-4">
              <h1 className="font-bold text-4xl md:text-5xl drop-shadow-lg">
                {trip?.user_selection?.location?.label}
              </h1>

              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <span className="text-sm md:text-base font-medium flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    {trip?.user_selection?.noOfDays} Days
                  </span>
                </div>

                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <span className="text-sm md:text-base font-medium flex items-center gap-2">
                    <span className="text-lg">💵</span>
                    {trip?.user_selection?.budget} Budget
                  </span>
                </div>

                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <span className="text-sm md:text-base font-medium flex items-center gap-2">
                    <span className="text-lg">👥</span>
                    {trip?.user_selection?.traveler}
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
