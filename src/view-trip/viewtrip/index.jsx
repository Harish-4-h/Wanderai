import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/service/supabaseClient';
import InfoSection from '../components/InfoSection';
import Hotels from '../components/Hotels';
import PlacesToVisit from '../components/PlacesToVisit';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_GEOCODE_KEY;
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

function ViewTrip() {
  const { tripId } = useParams();

  const [tripData, setTripData] = useState(null);
  const [mapCoords, setMapCoords] = useState([13.0827, 80.2707]);
  const [markers, setMarkers] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [destination, setDestination] = useState('My Trip');
  const [heroImages, setHeroImages] = useState([]);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const geocodedCache = useRef(new Map());
  const tripFetchedRef = useRef(false);

  const memoizedTrip = useMemo(() => ({ ...tripData, itinerary }), [tripData, itinerary]);

  // -------------------- FETCH TRIP DATA --------------------
  const getTripData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('AITrips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (error) throw error;
      if (!data) return toast.error('Trip not found');

      setTripData(data);
      setMarkers([]);
      geocodedCache.current.clear();

      const rawSelection =
        typeof data.user_selection === 'string'
          ? JSON.parse(data.user_selection)
          : data.user_selection;

      const destName =
        rawSelection?.destination?.label ||
        rawSelection?.location?.label ||
        rawSelection?.location?.name ||
        rawSelection?.place?.label ||
        data.places?.[0]?.placeName ||
        'My Trip';

      setDestination(destName);

      // -------------------- PARSE ITINERARY --------------------
      let parsedItinerary = [];
      if (data.trip_data) {
        const parsed =
          typeof data.trip_data === 'string' ? JSON.parse(data.trip_data) : data.trip_data;

        if (Array.isArray(parsed)) {
          parsedItinerary = parsed.map((day) => ({
            day: day.day,
            plan: (day.activities || []).map((act) => {
              if (typeof act === 'string') {
                return { placeName: act, placeDetails: act, timeToTravel: 'N/A' };
              } else if (act && typeof act === 'object') {
                const details =
                  act.description ||
                  act.activity ||
                  JSON.stringify(act) +
                    [
                      day.route ? `Route: ${day.route}` : '',
                      day.accommodation ? `Accommodation: ${day.accommodation}` : '',
                      day.distance_km ? `Distance: ${day.distance_km} km` : '',
                    ]
                      .filter(Boolean)
                      .join(' | ');
                return {
                  placeName: act.activity ? String(act.activity) : JSON.stringify(act),
                  placeDetails: details,
                  timeToTravel: act.time ? String(act.time) : 'N/A',
                };
              }
              return { placeName: String(act), placeDetails: String(act), timeToTravel: 'N/A' };
            }),
          }));
        }
      }
      setItinerary(parsedItinerary);

      // -------------------- GEOCODE LOCATIONS --------------------
      const allLocations = [];
      if (destName) allLocations.push({ query: destName, type: 'main' });
      data.hotels?.forEach((h) => allLocations.push({ query: h.hotelName || h.name || '', type: 'hotel' }));
      data.places?.forEach((p) => allLocations.push({ query: p.placeName || p.name || '', type: 'place' }));

      for (const loc of allLocations) {
        await geocodeLocation(loc.query, loc.type);
      }
    } catch {
      toast.error('Failed to load trip');
    }
  }, [tripId]);

  const geocodeLocation = async (query, type) => {
    if (!query) return;
    if (geocodedCache.current.has(query)) {
      const cachedCoords = geocodedCache.current.get(query);
      if (type === 'main') setMapCoords(cachedCoords);
      setMarkers((p) => [...p, { coords: cachedCoords, label: query, type }]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_KEY}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const coords = data.features?.[0]?.properties
        ? [data.features[0].properties.lat, data.features[0].properties.lon]
        : [0, 0];
      geocodedCache.current.set(query, coords);
      if (type === 'main') setMapCoords(coords);
      setMarkers((p) => [...p, { coords, label: query, type }]);
    } catch {
      const fallback = [0, 0];
      geocodedCache.current.set(query, fallback);
      if (type === 'main') setMapCoords(fallback);
      setMarkers((p) => [...p, { coords: fallback, label: query, type }]);
    }
  };

  // -------------------- SAFE UNSPLASH HERO IMAGES --------------------
  useEffect(() => {
    if (!destination) return;
    let isActive = true;

    const fetchImages = async () => {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination)}&per_page=5&orientation=landscape`,
          { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
        );

        const text = await res.text(); // parse text safely
        let urls = [];

        try {
          const json = JSON.parse(text);
          urls = json.results?.map((img) => img.urls.regular) || [];
        } catch {
          // JSON parse failed (likely Rate Limit), fallback
          urls = [];
        }

        if (!isActive) return;
        setHeroImages(urls.length ? urls : ['/fallback-image.jpg']);
      } catch {
        if (isActive) setHeroImages(['/fallback-image.jpg']);
      }
    };

    fetchImages();
    return () => { isActive = false; };
  }, [destination]);

  useEffect(() => {
    if (!heroImages.length) return;
    const interval = setInterval(() => setCurrentImageIdx((prev) => (prev + 1) % heroImages.length), 5000);
    return () => clearInterval(interval);
  }, [heroImages]);

  // -------------------- FETCH TRIP ON LOAD --------------------
  useEffect(() => { if (tripId && !tripFetchedRef.current) { tripFetchedRef.current = true; getTripData(); } }, [tripId]);

  // -------------------- TOUCH HANDLERS --------------------
  const handleTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchMove = (e) => (touchEndX.current = e.touches[0].clientX);
  const handleTouchEnd = () => {
    const delta = touchStartX.current - touchEndX.current;
    if (delta > 50) setCurrentImageIdx((prev) => (prev + 1) % heroImages.length);
    else if (delta < -50) setCurrentImageIdx((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  // -------------------- CLEAN PDF DOWNLOAD USING jsPDF + autoTable --------------------
  const downloadPDF = () => {
    if (!itinerary.length) return;
    const pdf = new jsPDF('p', 'pt', 'a4');

    pdf.setFontSize(18);
    pdf.text(`✈️ ${destination}`, 40, 40);
    pdf.setFontSize(12);
    pdf.text('Wander AI – Smart Travel Itinerary', 40, 60);

    let startY = 80;

    itinerary.forEach((day) => {
      pdf.setFontSize(14);
      pdf.setTextColor(30, 144, 255);
      pdf.text(`Day ${day.day}`, 40, startY);
      const rows = day.plan.map((p) => [p.placeName, p.placeDetails, p.timeToTravel]);

      autoTable(pdf, {
        startY: startY + 10,
        head: [['Place', 'Details', 'Time']],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [30, 144, 255], textColor: 255 },
        margin: { left: 40, right: 40 },
      });

      startY = pdf.lastAutoTable.finalY + 20;
    });

    const safeName = destination.trim().replace(/[\/\\:*?"<>|]/g, '') || 'My Trip';
    pdf.save(`${safeName} Trip.pdf`);
  };

  if (!tripData) return <p className="text-center mt-10">Loading trip details...</p>;

  return (
    <div className="p-10 md:px-20 lg:px-44 xl:px-56">
      {/* HERO IMAGES */}
      {destination && heroImages.length > 0 && (
        <div className="mb-6 relative" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <img src={heroImages[currentImageIdx]} alt={destination} className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg transition-all duration-700" />
          <button onClick={() => setCurrentImageIdx((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white px-3 py-1 rounded-full hover:bg-opacity-60">‹</button>
          <button onClick={() => setCurrentImageIdx((prev) => (prev + 1) % heroImages.length)}
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white px-3 py-1 rounded-full hover:bg-opacity-60">›</button>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroImages.map((_, idx) => (
              <span key={idx} onClick={() => setCurrentImageIdx(idx)} className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${idx === currentImageIdx ? 'bg-white' : 'bg-gray-400'}`} />
            ))}
          </div>
        </div>
      )}

      {/* MAP */}
      {markers.length > 0 && (
        <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
          <MapContainer center={mapCoords} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            {markers.map((m, idx) => (
              <Marker key={idx} position={m.coords}>
                <Popup>{m.label} {m.type === 'hotel' ? '🏨' : m.type === 'place' ? '📍' : '📌'}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* PDF BUTTON */}
      {itinerary.length > 0 && (
        <div className="mb-6">
          <button onClick={downloadPDF} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Download Itinerary PDF</button>
        </div>
      )}

      {/* ITINERARY */}
      {itinerary.length > 0 && (
        <div id="itinerary-section" className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Itinerary 🗓️</h2>
          <div className="space-y-4">
            {itinerary.map((day) => (
              <div key={day.day} className="p-4 border rounded-lg shadow-sm bg-white">
                <h3 className="font-semibold text-lg">Day {day.day}</h3>
                {day.plan.length > 0 ? day.plan.map((place, idx) => (
                  <div key={idx} className="mt-2">
                    <strong>{place.placeName}</strong>
                    <p className="text-gray-700">{place.placeDetails}</p>
                    <p className="text-gray-500 text-sm">Time: {place.timeToTravel}</p>
                  </div>
                )) : <p className="text-gray-500 mt-2">No places available for this day.</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPONENTS */}
      <InfoSection trip={tripData} />
      <Hotels trip={tripData} />
      <PlacesToVisit trip={memoizedTrip} />
    </div>
  );
}

export default React.memo(ViewTrip);
