import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectBudgetOptions, SelectTravelesList } from '@/constants/options';
import { generateTravelPlan } from '@/service/AIModal';
import { supabase } from '@/service/supabaseClient';
import { toast } from 'sonner';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CreateTrip.css';

/* Leaflet marker fix */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* Loading overlay */
const LoadingOverlay = ({ isVisible, message, subMessage }) =>
  isVisible ? (
    <div className="loading-overlay">
      <div className="loading-modal">
        <AiOutlineLoading3Quarters className="loading-icon" />
        <h3>{message}</h3>
        {subMessage && <p>{subMessage}</p>}
      </div>
    </div>
  ) : null;

/* OSM Autocomplete */
const OSMAutocomplete = ({ placeholder, value, onChange }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!inputValue) return setSuggestions([]);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}`
      );
      setSuggestions(await res.json());
    }, 300);
    return () => clearTimeout(t);
  }, [inputValue]);

  return (
    <div style={{ position: 'relative', marginBottom: '10px' }}>
      <Input
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {suggestions.length > 0 && (
        <ul className="autocomplete-suggestions">
          {suggestions.slice(0, 5).map(p => (
            <li key={p.place_id} onClick={() => {
              onChange({ label: p.display_name, lat: p.lat, lon: p.lon });
              setInputValue(p.display_name);
              setSuggestions([]);
            }}>
              {p.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function CreateTrip() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    startLocation: null,
    location: null,
    noOfDays: '',
    budget: '',
    traveler: '',
    transportMode: 'car'
  });

  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([13.0827, 80.2707]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const update = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  /* Live location */
  const useLiveLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => update("startLocation", {
        label: "Current Location",
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      }),
      () => toast.error("Location permission denied")
    );
  };

  /* Routes + distance */
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!formData.startLocation || !formData.location) return;

      if (formData.transportMode === 'flight') {
        const d = haversine(
          formData.startLocation.lat,
          formData.startLocation.lon,
          formData.location.lat,
          formData.location.lon
        );
        setRoutes([]);
        setDistance(d.toFixed(0));
        setDuration((d / 700).toFixed(1));
        return;
      }

      const url = `https://router.project-osrm.org/route/v1/driving/${formData.startLocation.lon},${formData.startLocation.lat};${formData.location.lon},${formData.location.lat}?alternatives=true&overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.routes?.length) {
        setRoutes(data.routes);
        setSelectedRoute(0);
        setDistance((data.routes[0].distance / 1000).toFixed(1));
        setDuration((data.routes[0].duration / 3600).toFixed(1));
      }
    };

    fetchRoutes();
  }, [formData.startLocation, formData.location, formData.transportMode]);

  useEffect(() => {
    const loc = formData.location || formData.startLocation;
    if (loc) setMapCenter([+loc.lat, +loc.lon]);
  }, [formData.startLocation, formData.location]);

  const OnGenerateTrip = async () => {
    if (!formData.location || !formData.startLocation)
      return toast.error("Select start & destination");

    setLoading(true);
    try {
      const result = await generateTravelPlan(
        `From ${formData.startLocation.label} to ${formData.location.label} by ${formData.transportMode}`,
        Number(formData.noOfDays),
        formData.traveler,
        formData.budget
      );

      const { data } = await supabase.from("AITrips").insert({
        user_selection: { ...formData, distance, duration },
        trip_data: result
      }).select().single();

      navigate(`/view-trip/${data.id}`);
    } catch {
      toast.error("Trip generation failed");
    } finally {
      setLoading(false);
    }
  };

  const renderOptionCards = (options, selectedValue, fieldName) =>
    options.map(item => {
      const value = item.title || item.people;
      return (
        <div
          key={value}
          className={`option-card ${selectedValue === value ? 'option-card-selected' : ''}`}
          onClick={() => update(fieldName, value)}
        >
          <span>{item.icon}</span>
          <h3>{item.title || item.people}</h3>
          <p>{item.desc}</p>
        </div>
      );
    });

  return (
    <div className="trip-container">
      <LoadingOverlay isVisible={loading} message="Creating your dream trip ✨" />
<img src="/image.png"
        alt="Travel Banner"
        className="w-full h-auto mb-4 rounded-md shadow-md object-cover max-h-64"
      />

      <h1 className="text-2xl font-semibold mb-4">Share your travel preferences 🗺️</h1>
      <OSMAutocomplete
        placeholder="Starting location"
        value={formData.startLocation?.label}
        onChange={v => update("startLocation", v)}
      />

      <Button variant="outline" onClick={useLiveLocation}>📍 Use Live Location</Button>

      <OSMAutocomplete
        placeholder="Destination"
        value={formData.location?.label}
        onChange={v => update("location", v)}
      />

      <div className="transport-switch">
        {['car', 'train', 'flight'].map(m => (
          <Button
            key={m}
            variant={formData.transportMode === m ? 'default' : 'outline'}
            onClick={() => update("transportMode", m)}
          >
            {m.toUpperCase()}
          </Button>
        ))}
      </div>

      {distance && <p className="text-sm">🛣️ {distance} km • ⏱️ {duration} hrs</p>}

      {routes.length > 1 && (
        <div className="route-options">
          {routes.map((_, i) => (
            <Button
              key={i}
              variant={selectedRoute === i ? 'default' : 'outline'}
              onClick={() => {
                setSelectedRoute(i);
                setDistance((routes[i].distance / 1000).toFixed(1));
                setDuration((routes[i].duration / 3600).toFixed(1));
              }}
            >
              Route {i + 1}
            </Button>
          ))}
        </div>
      )}

      <div style={{ height: 300 }}>
        <MapContainer center={mapCenter} zoom={6} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {routes[selectedRoute] && (
            <Polyline positions={routes[selectedRoute].geometry.coordinates.map(c => [c[1], c[0]])} />
          )}
          {formData.startLocation && <Marker position={[+formData.startLocation.lat, +formData.startLocation.lon]} />}
          {formData.location && <Marker position={[+formData.location.lat, +formData.location.lon]} />}
        </MapContainer>
      </div>

      <Input
        type="number"
        placeholder="No of days"
        value={formData.noOfDays}
        onChange={(e) => update("noOfDays", e.target.value)}
      />

      <div className="options-wrapper">
        {renderOptionCards(SelectBudgetOptions, formData.budget, "budget")}
      </div>

      <div className="options-wrapper">
        {renderOptionCards(SelectTravelesList, formData.traveler, "traveler")}
      </div>

      <Button onClick={OnGenerateTrip} className="generate-trip-btn mt-4">
        ✨ Generate My Trip
      </Button>
    </div>
  );
}

/* Flight distance */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
