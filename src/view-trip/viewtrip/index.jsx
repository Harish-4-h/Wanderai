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
      if (!data) {
        toast.error('Trip not found');
        return;
      }

      setTripData(data);

      // Parse itinerary
      if (data.trip_data) {
        try {
          const parsedData =
            typeof data.trip_data === 'string'
              ? JSON.parse(data.trip_data)
              : data.trip_data;
          setItinerary(parsedData.itinerary || []);
        } catch (err) {
          console.error('Error parsing itinerary:', err);
        }
      }

      // Map markers
      const allLocations = [];
      if (data.user_selection?.location?.label) {
        allLocations.push({ query: data.user_selection.location.label, type: 'main' });
      }
      if (Array.isArray(data.hotels)) {
        data.hotels.forEach((hotel) =>
          allLocations.push({ query: hotel.hotelName || hotel.name, type: 'hotel' })
        );
      }
      if (Array.isArray(data.places)) {
        data.places.forEach((place) =>
          allLocations.push({ query: place.placeName || place.name, type: 'place' })
        );
      }
      for (const loc of allLocations) {
        await geocodeLocation(loc.query, loc.type);
      }
    } catch (err) {
      console.error('Error fetching trip:', err);
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
        if (type === 'main') setMapCoords(coords);
        setMarkers((prev) => [...prev, { coords, label: query, type }]);
      } else {
        console.warn('No geocode result for:', query);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  const downloadPDF = async () => {
    const itineraryElement = document.getElementById('itinerary-section');
    if (!itineraryElement) return;

    const canvas = await html2canvas(itineraryElement);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${tripData?.user_selection?.location?.label || 'trip'}_itinerary.pdf`);
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
                <p className="text-gray-700 mt-1">{day.plan}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other sections */}
      <InfoSection trip={tripData} />
      <Hotels trip={tripData} />
      <PlacesToVisit trip={tripData} />
    </div>
  );
}

export default ViewTrip;
