import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_AUTOCOMPLETE_KEY;
const GEOAPIFY_AUTOCOMPLETE_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';

export default function GeoapifyAutocomplete({ value, onChange, placeholder }) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const fetchSuggestions = async (text) => {
    if (!text) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(GEOAPIFY_AUTOCOMPLETE_URL, {
        params: {
          text,
          apiKey: GEOAPIFY_API_KEY,
          limit: 5,
        },
      });
      setSuggestions(response.data.features || []);
    } catch (err) {
      console.error('Geoapify autocomplete error:', err);
      toast.error('Failed to fetch location suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelect = (feature) => {
    const location = {
      label: feature.properties.formatted,
      lat: feature.properties.lat,
      lon: feature.properties.lon,
      city: feature.properties.city || '',
      country: feature.properties.country || '',
    };
    onChange(location);
    setInputValue(location.label);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        placeholder={placeholder || 'Search location'}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {loading && (
        <div className="absolute top-full left-0 bg-white p-2 text-gray-500">
          Loading...
        </div>
      )}
      {suggestions.length > 0 && (
        <ul className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-xl mt-1 z-50 max-h-60 overflow-auto shadow-lg">
          {suggestions.map((feature) => (
            <li
              key={feature.properties.place_id || feature.properties.formatted}
              className="p-2 cursor-pointer hover:bg-cyan-50"
              onClick={() => handleSelect(feature)}
            >
              {feature.properties.formatted}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
