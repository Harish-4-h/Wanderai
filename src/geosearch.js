import { useState } from "react";
import { searchLocation } from "../services/geoApi";

function LocationSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const data = await searchLocation(query);
      setResults(data.features);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search place"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      <ul>
        {results.map((place) => (
          <li key={place.properties.place_id}>
            {place.properties.formatted}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LocationSearch;
