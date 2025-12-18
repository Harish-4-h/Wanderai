import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from './service/supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';
import { Button } from './components/ui/button.jsx';


// Custom Components
import Hero from './components/custom/Hero';
import SVGAnimation from './components/custom/SVGAnimation';

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Home() {
  const [trips, setTrips] = useState([]);
  const [locationsCache, setLocationsCache] = useState({});

  useEffect(() => {
    fetchRecentTrips();
  }, []);

  const fetchRecentTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('AITrips')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTrips(data || []);

      data.forEach((trip) => {
        const locName = trip.user_selection.location?.label;
        if (locName && !locationsCache[locName]) geocodeLocation(locName);
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load recent trips');
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
        setLocationsCache((prev) => ({
          ...prev,
          [query]: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
        }));
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  return (
    <div className="app-container p-6">
      <Hero />
      <SVGAnimation />

      <h2 className="text-2xl font-bold mt-10 mb-4">Recent Trips 🌎</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trips.map((trip) => {
          const coords = locationsCache[trip.user_selection.location?.label];
          return (
            <div
              key={trip.id}
              className="border rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="font-semibold">
                {trip.user_selection.location?.label || 'Unknown'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {trip.user_selection.noOfDays} days • {trip.user_selection.budget}
              </p>
              <p className="text-sm text-gray-500">{trip.user_selection.traveler}</p>

              {coords && (
                <div
                  style={{
                    height: '120px',
                    width: '100%',
                    marginTop: '10px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <MapContainer
                    center={coords}
                    zoom={10}
                    style={{ height: '100%', width: '100%' }}
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
                      <Popup>{trip.user_selection.location.label}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}

              <Link to={`/view-trip/${trip.id}`}>
                <Button className="mt-2 w-full">View Trip</Button>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <Link to="/create-trip">
          <Button>✨ Create New Trip</Button>
        </Link>
      </div>
    </div>
  );
  
}
