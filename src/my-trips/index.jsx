import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/service/supabaseClient";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationsCache, setLocationsCache] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from("AITrips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrips(data || []);

      const newLocations = {};

      // Batch geocode locations
      await Promise.all(
        data.map(async (trip) => {
          const locName = trip.user_selection?.location?.label || trip.destination;
          const lat = trip.user_selection?.location?.lat;
          const lon = trip.user_selection?.location?.lon;

          if (lat && lon) {
            newLocations[locName] = [lat, lon];
          } else if (locName && !locationsCache[locName]) {
            const coords = await geocodeLocation(locName);
            if (coords) newLocations[locName] = coords;
          }
        })
      );

      setLocationsCache((prev) => ({ ...prev, ...newLocations }));
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const geocodeLocation = async (query) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    }
    return null;
  };

  if (loading) {
    return <p className="text-center mt-10">Loading trips...</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">All Trips ✈️</h1>

      {trips.length === 0 ? (
        <div className="text-center mt-20">
          <h2 className="text-xl font-semibold mb-2">Create your first trip</h2>
          <p className="text-gray-500 mb-4">
            Looks like no trips are available yet.
          </p>
          <Button onClick={() => navigate("/create-trip")}>Create Trip</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const locName =
              trip.user_selection?.location?.label || trip.destination || "Unknown Destination";
            const coords = locationsCache[locName];

            return (
              <div
                key={trip.id}
                className="border rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/view-trip/${trip.id}`)}
              >
                <h3 className="text-lg font-semibold">{locName}</h3>

                <p className="text-sm text-gray-500 mt-1">
                  {trip.user_selection?.noOfDays || "-"} days •{" "}
                  {trip.user_selection?.budget || "-"}
                </p>

                <p className="text-sm text-gray-500">
                  {trip.user_selection?.traveler || "-"}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Created on{" "}
                  {trip.created_at
                    ? new Date(trip.created_at).toLocaleDateString()
                    : "Unknown"}
                </p>

                {coords && (
                  <div
                    style={{
                      height: "150px",
                      width: "100%",
                      marginTop: "10px",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <MapContainer
                      center={coords}
                      zoom={12}
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={false}
                      dragging={false}
                      doubleClickZoom={false}
                      zoomControl={false}
                      attributionControl={false}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      <Marker position={coords}>
                        <Popup>{locName}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyTrips;
