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

function ViewTrip() {
  const { tripId } = useParams();
  const [tripData, setTripData] = useState(null);
  const [mapCoords, setMapCoords] = useState([13.0827, 80.2707]);
  const [markers, setMarkers] = useState([]);
  const [itinerary, setItinerary] = useState([]);

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
      if (!data) return toast.error('Trip not found');

      setTripData(data);

      let parsedItinerary = [];
      if (data.trip_data) {
        const parsed =
          typeof data.trip_data === 'string'
            ? JSON.parse(data.trip_data)
            : data.trip_data;

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
      const mainLabel = data.user_selection?.location?.label;
      if (mainLabel) allLocations.push({ query: mainLabel, type: 'main' });

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

    const canvas = await html2canvas(el, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const margin = 20;
    const usableWidth = pdfWidth - margin * 2;
    const usableHeight = pdfHeight - margin * 2;

    const imgWidth = usableWidth;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    const drawBorder = () => {
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(1);
      pdf.rect(margin, margin, usableWidth, usableHeight);
    };

    drawBorder();
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    heightLeft -= usableHeight;

    while (heightLeft > 0) {
      pdf.addPage();
      drawBorder();
      position = heightLeft - imgHeight;
      pdf.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
      heightLeft -= usableHeight;
    }

    const locationLabel = tripData?.user_selection?.location?.label || 'My Trip';
    pdf.save(`${locationLabel}_itinerary.pdf`);
  };

  if (!tripData) return <p className="text-center mt-10">Loading trip details...</p>;

  return (
    <div className="p-10 md:px-20 lg:px-44 xl:px-56">
      {/* Top Destination Image */}
      {tripData?.user_selection?.location?.label?.trim() && (
        <div className="mb-6">
          <img
            src={`https://source.unsplash.com/1200x600/?${tripData.user_selection.location.label}`}
            alt={tripData.user_selection.location.label}
            className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = '/fallback-image.jpg';
            }}
          />
        </div>
      )}

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

      {/* Download PDF button */}
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

      {/* Day-wise Itinerary */}
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

      {/* Other sections */}
      <InfoSection trip={tripData} />
      <Hotels trip={tripData} />
      <PlacesToVisit trip={tripData} />

      {/* Hidden PDF layout */}
      <div
        id="pdf-layout"
        className="p-8"
        style={{ display: 'none', width: '800px' }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold">
            ✈️ {tripData?.user_selection?.location?.label || 'My Trip'}
          </h1>
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

        <p className="text-center text-xs text-gray-400 mt-6">Generated by Wander AI</p>
      </div>
    </div>
  );
}

export default ViewTrip;
