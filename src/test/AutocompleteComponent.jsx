// src/test/AutocompleteComponent.jsx
import React, { useState } from 'react';

// Mock Google Places Autocomplete للاختبار
const GooglePlacesAutocomplete = ({ selectProps }) => (
  <input 
    type="text"
    placeholder={selectProps.placeholder}
    className={selectProps.className}
    value={selectProps.value?.label || ''}
    onChange={(e) => {
      const mockPlace = { label: e.target.value };
      selectProps.onChange(mockPlace);
    }}
    data-testid="places-autocomplete"
  />
);

function AutocompleteComponent() {
  const [place, setPlace] = useState();
  const [selectedLocation, setSelectedLocation] = useState('');

  const handlePlaceChange = (value) => {
    setPlace(value);
    setSelectedLocation(value?.label || '');
  };

  return (
    <div>
      <h2>Select Destination</h2>
      <GooglePlacesAutocomplete
        selectProps={{
          value: place,
          onChange: handlePlaceChange,
          placeholder: "Where would you like to go?",
          className: "places-autocomplete"
        }}
      />
      
      {selectedLocation && (
        <div data-testid="selected-location">
          Selected: {selectedLocation}
        </div>
      )}
    </div>
  );
}

export default AutocompleteComponent;