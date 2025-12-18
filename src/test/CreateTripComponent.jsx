// src/test/CreateTripComponent.jsx
import React, { useState } from 'react';

const CreateTrip = () => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [budget, setBudget] = useState('');
  const [companions, setCompanions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateTrip = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div>
      <h2>Share your travel preferences</h2>
      
      <input 
        type="text" 
        placeholder="Where would you like to go?"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      
      <input 
        type="number" 
        placeholder="Enter number of days"
        value={days}
        onChange={(e) => setDays(e.target.value)}
      />
      
      <div>
        <h3>Budget Preference</h3>
        <div 
          className={budget === 'budget' ? 'option-card-selected' : 'option-card'}
          onClick={() => setBudget('budget')}
        >
          Budget-Friendly
        </div>
        <div 
          className={budget === 'moderate' ? 'option-card-selected' : 'option-card'}
          onClick={() => setBudget('moderate')}
        >
          Moderate
        </div>
        <div 
          className={budget === 'luxury' ? 'option-card-selected' : 'option-card'}
          onClick={() => setBudget('luxury')}
        >
          Luxury
        </div>
      </div>
      
      <div>
        <h3>Travel Companions</h3>
        <div 
          className={companions === 'solo' ? 'option-card-selected' : 'option-card'}
          onClick={() => setCompanions('solo')}
        >
          Solo Traveler
        </div>
        <div 
          className={companions === 'couple' ? 'option-card-selected' : 'option-card'}
          onClick={() => setCompanions('couple')}
        >
          Couple
        </div>
        <div 
          className={companions === 'family' ? 'option-card-selected' : 'option-card'}
          onClick={() => setCompanions('family')}
        >
          Family
        </div>
        <div 
          className={companions === 'friends' ? 'option-card-selected' : 'option-card'}
          onClick={() => setCompanions('friends')}
        >
          Friends
        </div>
      </div>
      
      {loading ? (
        <div>Creating Your Dream Trip</div>
      ) : (
        <button onClick={handleGenerateTrip}>
          Generate My Trip
        </button>
      )}
    </div>
  );
};

export default CreateTrip;