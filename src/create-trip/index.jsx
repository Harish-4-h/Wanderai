import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectBudgetOptions, SelectTravelesList } from '@/constants/options';
import { generateTravelPlan } from '@/service/AIModal';
import { supabase } from '@/service/supabaseClient';
import { toast } from 'sonner';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CreateTrip.css';

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

// Loading overlay component
const LoadingOverlay = ({ isVisible, message, subMessage }) => {
  if (!isVisible) return null;
  return (
    <div className="loading-overlay">
      <div className="loading-modal">
        <div className="loading-content">
          <AiOutlineLoading3Quarters className="loading-icon" />
          <h3>{message}</h3>
          {subMessage && <p>{subMessage}</p>}
        </div>
      </div>
    </div>
  );
};

// OSM Autocomplete Component
const OSMAutocomplete = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (query) => {
    if (!query) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleSelect = (place) => {
    onChange({ label: place.display_name, lat: place.lat, lon: place.lon });
    setInputValue(place.display_name);
    setSuggestions([]);
  };

  return (
    <div style={{ position: 'relative', marginBottom: '10px' }}>
      <Input
        type="text"
        placeholder="Enter destination"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {suggestions.length > 0 && (
        <ul className="autocomplete-suggestions">
          {suggestions.slice(0, 5).map((place) => (
            <li
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="autocomplete-item"
            >
              {place.display_name}
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
    location: null,
    noOfDays: '',
    budget: '',
    traveler: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingSubMessage, setLoadingSubMessage] = useState('');
  const [mapPosition, setMapPosition] = useState([13.0827, 80.2707]);
  const [markerPosition, setMarkerPosition] = useState(null);

  const handleInputChange = (name, value) =>
    setFormData(prev => ({ ...prev, [name]: value }));

  const validateForm = () => {
    const errors = [];
    if (!formData.location?.label) errors.push("Select destination");
    if (!formData.noOfDays) errors.push("Enter trip duration");
    if (!formData.budget) errors.push("Select budget");
    if (!formData.traveler) errors.push("Select traveler type");

    const days = parseInt(formData.noOfDays);
    if (isNaN(days) || days < 1 || days > 15) errors.push("Days must be between 1 and 15");

    return errors;
  };

  const saveTrip = async (tripDataObj) => {
    try {
      const payload = { user_selection: formData, trip_data: tripDataObj };

      const { data, error } = await supabase
        .from("AITrips")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Supabase Insert Error:", error);
        toast.error(error.message || "Failed to save trip");
        return;
      }

      toast.success("🎉 Trip created successfully!");
      navigate(`/view-trip/${data.id}`);
    } catch (err) {
      console.error("Save Trip Error:", err);
      toast.error("Failed to save trip");
    }
  };

  const OnGenerateTrip = async () => {
    const errors = validateForm();
    if (errors.length) {
      errors.forEach(e => toast.error(e));
      return;
    }

    setLoading(true);
    setLoadingMessage("Creating your dream trip ✨");
    setLoadingSubMessage("AI is planning your journey...");

    try {
      const result = await generateTravelPlan(
        formData.location.label,
        Number(formData.noOfDays),
        formData.traveler,
        formData.budget
      );

      if (result?.days?.length > 0) {
        await saveTrip(result);
      } else {
        toast.error("No itinerary generated. Try again!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Trip generation failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!formData.location) return;
    const coords = [parseFloat(formData.location.lat), parseFloat(formData.location.lon)];
    setMapPosition(coords);
    setMarkerPosition(coords);
  }, [formData.location]);

  const renderOptionCards = (options, selectedValue, fieldName) =>
    options.map(item => {
      const value = item.title || item.people;
      return (
        <div
          key={value}
          className={`option-card ${selectedValue === value ? 'option-card-selected' : ''}`}
          onClick={() => handleInputChange(fieldName, value)}
        >
          <span>{item.icon}</span>
          <h3>{item.title || item.people}</h3>
          <p>{item.desc}</p>
        </div>
      );
    });

  return (
    <div className="trip-container">
      <LoadingOverlay
        isVisible={loading}
        message={loadingMessage}
        subMessage={loadingSubMessage}
      />

      <img
        src="/image.png"
        alt="Travel Banner"
        className="w-full h-auto mb-4 rounded-md shadow-md object-cover max-h-64"
      />

      <h1 className="text-2xl font-semibold mb-4">Share your travel preferences 🗺️</h1>

      <OSMAutocomplete
        value={formData.location?.label || ''}
        onChange={(loc) => handleInputChange("location", loc)}
      />

      <div style={{ height: '300px', width: '100%', marginTop: '10px' }}>
        <MapContainer center={mapPosition} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {markerPosition && (
            <Marker position={markerPosition}>
              <Popup>{formData.location?.label}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <Input
        type="number"
        placeholder="No of days"
        value={formData.noOfDays}
        onChange={(e) => handleInputChange("noOfDays", e.target.value)}
        style={{ marginTop: '10px' }}
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
