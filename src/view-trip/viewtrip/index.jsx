import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/service/supabaseClient';
import InfoSection from '../components/InfoSection';
import Hotels from '../components/Hotels';
import PlacesToVisit from '../components/PlacesToVisit';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ViewTrip() {
  const { tripId } = useParams();
  const [tripData, setTripData] = useState(null);
  const [mapCoords, setMapCoords] = useState([13.0827, 80.2707]); // default Chennai
  const [markers, setMarkers] = useState([]); // all markers: main + hotels + places

  useEffect(() => {
    if (tripId) getTripData();
  }, [tripId]);

  const getTripData = async () => {
    try {
      const { data, error } = await supabase
        .from('AITrips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (error) throw error;

      if (data) {
        setTripData(data);

        // start with main location
        if (data.user_selection.location?.label) {
          geocodeLocation(data.user_selection.location.label, 'main');
        }

        // geocode hotels and places
        if (data.hotels?.length > 0) {
          data.hotels.forEach((hotel) => geocodeLocation(hotel.name, 'hotel'));
        }

        if (data.places?.length > 0) {
          data.places.forEach((place) => geocodeLocation(place.name, 'place'));
        }
      } else {
        toast.error('Trip not found');
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
      toast.error('Failed to load trip');
    }
  };

  const geocodeLocation = async (query, type) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];

        // first main location sets the map center
        if (type === 'main') setMapCoords(coords);

        setMarkers((prev) => [
          ...prev,
          { coords, label: query, type },
        ]);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  if (!tripData) return <p className="text-center mt-10">Loading trip details...</p>;

  return (
    <div className="p-10 md:px-20 lg:px-44 xl:px-56">
      {/* Map */}
      {markers.length > 0 && (
        <div
          style={{
            height: '400px',
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '20px',
          }}
        >
          <MapContainer center={mapCoords} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {markers.map((m, idx) => (
              <Marker key={idx} position={m.coords}>
                <Popup>
                  {m.label} {m.type === 'hotel' ? '🏨' : m.type === 'place' ? '📍' : '📌'}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      <InfoSection trip={tripData} />
      <Hotels trip={tripData} />
      <PlacesToVisit trip={tripData} />
    </div>
  );
}

export default ViewTrip;
