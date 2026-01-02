import React, { useEffect, useState, useRef } from 'react';
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
import html2canvas from 'html2canvas';

// Fix Leaflet marker icon
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

  useEffect(() => {
    if (tripId) getTripData();
  }, [tripId]);

  // Fetch multiple images from Unsplash
  useEffect(() => {
    const fetchImages = async () => {
      if (!destination) return;
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            destination
          )}&per_page=5&orientation=landscape`,
          { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
        );
        const json = await res.json();
        const urls = json.results.map((img) => img.urls.regular);
        setHeroImages(urls.length ? urls : ['/fallback-image.jpg']);
      } catch {
        setHeroImages(['/fallback-image.jpg']);
      }
    };
    fetchImages();
  }, [destination]);

  // Auto-slide every 5s
  useEffect(() => {
    if (!heroImages.length) return;
    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages]);

  // Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const delta = touchStartX.current - touchEndX.current;
    if (delta > 50) {
      setCurrentImageIdx((prev) => (prev + 1) % heroImages.length);
    } else if (delta < -50) {
      setCurrentImageIdx((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    }
  };

  const getTripData = async () => {
    try {
      const { data, error } = await supabase
        .from('AITrips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (error) throw error;
      if (!data) return toast.error('Trip not found');

      setTripData(data);

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

      let parsedItinerary = [];
      if (data.trip_data) {
        const parsed =
          typeof data.trip_data === 'string' ? JSON.parse(data.trip_data) : data.trip_data;

        if (Array.isArray(parsed.days)) {
          parsedItinerary = parsed.days.map((day) => ({
            day: day.day,
            plan:
              day.places?.map((p) => ({
                placeName: p.name || p.placeName || 'Unnamed Place',
                placeDetails: p.about || 'No details available',
                timeToTravel: p.time || 'N/A',
              })) || [],
          }));
        }
      }
      setItinerary(parsedItinerary);

      const allLocations = [];
      if (destName) allLocations.push({ query: destName, type: 'main' });

      data.hotels?.forEach((h) =>
        allLocations.push({ query: h.hotelName || h.name || '', type: 'hotel' })
      );
      data.places?.forEach((p) =>
        allLocations.push({ query: p.placeName || p.name || '', type: 'place' })
      );

      for (const loc of allLocations) await geocodeLocationGeoapify(loc.query, loc.type);
    } catch {
      toast.error('Failed to load trip');
    }
  };

  const geocodeLocationGeoapify = async (query, type) => {
    if (!query) return;
    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        query
      )}&apiKey=${GEOAPIFY_KEY}`
    );
    const data = await res.json();
    if (data.features?.length) {
      const coords = [
        data.features[0].properties.lat,
        data.features[0].properties.lon,
      ];
      if (type === 'main') setMapCoords(coords);
      setMarkers((p) => [...p, { coords, label: query, type }]);
    }
  };

  const downloadPDF = async () => {
    const el = document.getElementById('pdf-layout');
    if (!el) return;

    // Force all text to black for PDF
    const allElements = el.querySelectorAll('*');
    const originalColors = [];
    allElements.forEach((el, idx) => {
      originalColors[idx] = el.style.color;
      el.style.color = 'black';
    });

    el.style.position = 'absolute';
    el.style.left = '-9999px';
    el.style.display = 'block';

    const canvas = await html2canvas(el, { scale: 2 });

    // Restore original colors
    allElements.forEach((el, idx) => {
      el.style.color = originalColors[idx];
    });

    el.style.display = 'none';
    el.style.position = '';
    el.style.left = '';

    const imgData = canvas.toDataURL('');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const usableWidth = pdfWidth - margin * 2;
    const usableHeight = pdfHeight - margin * 2;

    const imgWidth = usableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    heightLeft -= usableHeight;

    while (heightLeft > 0) {
      pdf.addPage();
      position = imgHeight - heightLeft;
      pdf.addImage(imgData, 'PNG', margin, -position + margin, imgWidth, imgHeight);
      heightLeft -= usableHeight;
    }

    const safeName = destination.trim().replace(/[\/\\:*?"<>|]/g, '') || 'My Trip';
    pdf.save(`${safeName} Trip.pdf`);
  };

  if (!tripData) return <p className="text-center mt-10">Loading trip details...</p>;

  return (
    <div className="p-10 md:px-20 lg:px-44 xl:px-56">
      {destination && heroImages.length > 0 && (
        <div
          className="mb-6 relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={heroImages[currentImageIdx]}
            alt={destination}
            className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg transition-all duration-700"
          />

          {/* Prev/Next Buttons */}
          <button
            onClick={() =>
              setCurrentImageIdx((prev) => (prev - 1 + heroImages.length) % heroImages.length)
            }
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white px-3 py-1 rounded-full hover:bg-opacity-60"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrentImageIdx((prev) => (prev + 1) % heroImages.length)}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white px-3 py-1 rounded-full hover:bg-opacity-60"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroImages.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setCurrentImageIdx(idx)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
                  idx === currentImageIdx ? 'bg-white' : 'bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      )}

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

      {itinerary.length > 0 && (
        <div className="mb-6">
          <button
            onClick={downloadPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Download Itinerary PDF
          </button>
        </div>
      )}

      {itinerary.length > 0 && (
        <div id="itinerary-section" className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Itinerary 🗓️</h2>
          <div className="space-y-4">
            {itinerary.map((day) => (
              <div key={day.day} className="p-4 border rounded-lg shadow-sm bg-white">
                <h3 className="font-semibold text-lg">Day {day.day}</h3>
                {day.plan.length > 0 ? (
                  day.plan.map((place, idx) => (
                    <div key={idx} className="mt-2">
                      <strong>{place.placeName}</strong>
                      <p className="text-gray-700">{place.placeDetails}</p>
                      <p className="text-gray-500 text-sm">Time: {place.timeToTravel}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 mt-2">No places available for this day.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <InfoSection trip={tripData} />
      <Hotels trip={tripData} />
      <PlacesToVisit trip={tripData} />

      <div id="pdf-layout" className="p-8" style={{ display: 'none', width: '800px' }}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold">✈️ {destination}</h1>
          <p className="opacity-90">Wander AI – Smart Travel Itinerary</p>
        </div>
        {itinerary.map((day) => (
          <div key={day.day} className="mb-4 bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold text-blue-600 mb-2">Day {day.day}</h2>
            {day.plan.map((p, i) => (
              <div key={i} className="mb-2">
                <p className="font-medium">📍 {p.placeName}</p>
                <p className="text-gray-600 text-sm">{p.placeDetails}</p>
                <p className="text-xs text-gray-500">⏱ {p.timeToTravel}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewTrip;
