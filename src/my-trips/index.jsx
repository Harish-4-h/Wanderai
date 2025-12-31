import React, { useEffect, useState } from "react";
import { supabase } from "@/service/supabaseClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import "./mytrips.css"; // make sure to import the CSS

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState({});

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
                { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
              );
              const json = await res.json();
              const firstImage = json?.results?.[0];
              newImages[trip.id] = firstImage ? firstImage.urls.regular : null;
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

  const renderTripCard = (trip, index) => {
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
        className="trip-card fade-in"
        style={{ transition: "opacity 3s ease-out, transform 3s ease-out", transitionDelay: `${index * 0.2}s` }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={locationLabel} />
        ) : (
          <div className="no-image">No image available</div>
        )}

        <div className="trip-info">
          <h3>{locationLabel}</h3>
          <p className="flex items-center gap-2 mt-1">
            <span>📅 {noOfDays} Days</span> • <span>💵 {budget}</span> •{" "}
            <span>👥 {traveler}</span>
          </p>
          <p className="created-date mt-1">Created on {createdAt}</p>

          <div className="mt-3 flex gap-2">
            <Button
              onClick={() => deleteTrip(trip.id)}
              className="flex-1 bg-red-500 hover:bg-gray-600 text-white"
            >
              Delete Trip
            </Button>
            <Link to={`/view-trip/${trip.id}`} className="flex-1">
              <Button className="w-full bg-blue-500 hover:bg-green-600 text-white">
                View Trip Details!
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // Fade-in on scroll logic
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in");

    const handleScroll = () => {
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50) {
          el.classList.add("show");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [trips]);

  return (
    <div className="my-trips-container">
      <h1>All Trips ✈️🏁</h1>
      {loading && <p>Loading trips...</p>}
      {!loading && trips.length === 0 && <p>No trips found.</p>}

      <div className="trips-grid">{trips.map((trip, index) => renderTripCard(trip, index))}</div>
    </div>
  );
}
