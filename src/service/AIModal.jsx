import React, { useState, useRef } from "react";
import { generateGPTResponse } from "./OpenAIService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * In-memory cache + lock
 */
const travelPlanCache = {};
let inFlight = false;

/**
 * Named export: generateTravelPlan
 */
export const generateTravelPlan = async (
  destination,
  days,
  traveler,
  budget,
  informativeMode = true
) => {
  if (!destination) return null;

  const cacheKey = `${destination}_${days}_${traveler}_${budget}_${informativeMode}`;
  if (travelPlanCache[cacheKey]) {
    return travelPlanCache[cacheKey];
  }

  if (inFlight) return null;
  inFlight = true;

  try {
    const prompt = informativeMode
      ? `
You are an expert local travel guide and itinerary planner.
Create a ${days}-day travel plan for ${destination} for a ${traveler} traveler with a ${budget} budget.
Output ONLY valid JSON.
`
      : `
Create a ${days}-day simple travel itinerary for ${destination}.
Output ONLY valid JSON.
`;

    const parsed = await generateGPTResponse(prompt);

    travelPlanCache[cacheKey] = parsed;
    return parsed;
  } catch (error) {
    console.error("generateTravelPlan error:", error);
    return { destination, overview: null, days: [] };
  } finally {
    inFlight = false;
  }
};

/**
 * AIModal Component
 */
export default function AIModal({ destination, days, traveler, budget, onClose }) {
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState(null);
  const [informativeMode, setInformativeMode] = useState(true);
  const itineraryRef = useRef();

  const handleGenerate = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    const plan = await generateTravelPlan(
      destination,
      days,
      traveler,
      budget,
      informativeMode
    );

    if (!plan || !plan.days || plan.days.length === 0) {
      setError("No itinerary generated. Try again.");
      setItinerary(null);
    } else {
      setItinerary(plan);
    }

    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    if (!itineraryRef.current) return;
    const canvas = await html2canvas(itineraryRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${destination}-itinerary.pdf`);
  };

  return (
    <div className="modal">
      <button onClick={onClose} className="close-btn">X</button>
      <h2>AI Travel Plan</h2>

      <label>
        <input
          type="checkbox"
          checked={informativeMode}
          onChange={() => setInformativeMode(!informativeMode)}
        />
        Informative Mode
      </label>

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Itinerary"}
      </button>

      {itinerary && (
        <button onClick={handleDownloadPDF}>Download PDF</button>
      )}

      {error && <p className="error">{error}</p>}

      {itinerary && (
        <div ref={itineraryRef}>
          {itinerary.days?.map((day) => (
            <div key={day.day}>
              <h3>Day {day.day}</h3>
              {day.places?.map((p, i) => (
                <p key={i}>{p.name}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
