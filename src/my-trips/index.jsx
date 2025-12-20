import React, { useEffect, useState } from "react";
import { supabase } from "@/service/supabaseClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState({}); // store fetched Unsplash image urls

  // Use Vite environment variable
  const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("AITrips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch Trips Error:", error);
        toast.error("Failed to fetch trips");
      } else {
        setTrips(data ?? []);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Fetch Unsplash image URLs
  useEffect(() => {
    const fetchImages = async () => {
      const newImages = {};

      await Promise.all(
        trips.map(async (trip) => {
          const userSelection = trip?.user_selection
            ? typeof trip.user_selection === "string"
              ? JSON.parse(trip.user_selection)
              : trip.user_selection
            : {};

          const locationLabel = userSelection?.location?.label?.trim();

          if (locationLabel) {
            try {
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

              newImages[trip.id] = firstImage
                ? firstImage.urls.regular
                : null;
            } catch (err) {
              console.error("Unsplash fetch error:", err);
              newImages[trip.id] = null;
            }
          } else {
            newImages[trip.id] = null;
          }
        })
      );

      setImages(newImages);
    };

    if (trips.length > 0) fetchImages();
  }, [trips]);

  const deleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;

    try {
      const { error } = await supabase.from("AITrips").delete().eq("id", tripId);

      if (error) {
        console.error("Delete Trip Error:", error);
        toast.error("Failed to delete trip");
      } else {
        toast.success("Trip deleted successfully!");
        setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    }
  };

  const renderTripCard = (trip) => {
    const userSelection = trip?.user_selection
      ? typeof trip.user_selection === "string"
        ? JSON.parse(trip.user_selection)
        : trip.user_selection
      : {};

    const locationLabel =
      userSelection?.location?.label?.trim() || "Unknown Destination";
    const noOfDays = userSelection?.noOfDays ?? "—";
    const budget = userSelection?.budget ? `₹${userSelection.budget}` : "—";
    const traveler = userSelection?.traveler ?? "—";
    const createdAt = trip?.created_at
      ? new Date(trip.created_at).toLocaleDateString()
      : "Unknown Date";

    const photoUrl = images[trip.id];

    return (
      <div
        key={trip.id}
        className="rounded-xl shadow-md overflow-hidden border border-gray-200"
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={locationLabel}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
            No image available
          </div>
        )}

        <div className="p-4">
          <h3 className="font-semibold text-lg">{locationLabel}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
            <span>📅 {noOfDays} Days</span> • <span>💵 {budget}</span> •{" "}
            <span>👥 {traveler}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Created on {createdAt}</p>
          <Button
            onClick={() => deleteTrip(trip.id)}
            className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white"
          >
            Delete
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="my-trips-container max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">All Trips ✈️</h1>

      {loading && <p>Loading trips...</p>}
      {!loading && trips.length === 0 && <p>No trips found.</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trips.map(renderTripCard)}
      </div>
    </div>
  );
}
