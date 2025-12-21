import React, { useState, useRef } from "react";
import { generateGPTResponse } from "./OpenAIService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  try {
    const prompt = informativeMode
      ? `
You are an expert local travel guide and historian.

Create a ${days}-day travel itinerary for ${destination} for a ${traveler} traveler with a ${budget} budget.

Each place must teach something meaningful about the destination.

Rules:
- Use simple, engaging language
- Avoid generic phrases like "beautiful", "must visit", or "popular spot"
- Do NOT invent unknown facts
- Output ONLY valid JSON (no markdown, no explanations)

JSON SCHEMA:

{
  "destination": "${destination}",
  "overview": {
    "summary": "Short cultural and historical overview of the destination",
    "historical_context": "High-level historical background (2–3 sentences)"
  },
  "days": [
    {
      "day": 1,
      "theme": "Theme of the day",
      "places": [
        {
          "name": "Place name",
          "time": "Suggested visit time",
          "about": "Short historical or cultural background",
          "historical_facts": ["Fact1", "Fact2"],
          "why_it_matters": "Importance of this place today"
        }
      ]
    }
  ]
}
`
      : `
Create a simple ${days}-day travel itinerary for ${destination} for a ${traveler} traveler with a ${budget} budget.

Rules:
- Keep it concise
- Output ONLY valid JSON

JSON SCHEMA:

{
  "destination": "${destination}",
  "days": [
    {
      "day": 1,
      "places": [
        {
          "name": "Place name",
          "time": "Suggested visit time"
        }
      ]
    }
  ]
}
`;

    const rawResponse = await generateGPTResponse(prompt);
    const jsonMatch = rawResponse.match(/{[\s\S]*}/);
    const cleaned = jsonMatch ? jsonMatch[0] : rawResponse;

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      const relaxed = cleaned.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
      parsed = JSON.parse(relaxed);
    }

    return parsed;
  } catch (error) {
    console.error("generateTravelPlan error:", error);
    return { destination, overview: null, days: [] };
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
    setLoading(true);
    setError(null);

    try {
      const plan = await generateTravelPlan(destination, days, traveler, budget, informativeMode);
      if (!plan || !plan.days || plan.days.length === 0) {
        setError("No itinerary generated. Try again.");
        setItinerary(null);
      } else {
        setItinerary(plan);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate itinerary.");
      setItinerary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!itineraryRef.current) return;
    const element = itineraryRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
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

      <div className="informative-toggle">
        <label>
          <input
            type="checkbox"
            checked={informativeMode}
            onChange={() => setInformativeMode(!informativeMode)}
          />
          Informative Mode (History & Facts)
        </label>
      </div>

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Itinerary"}
      </button>

      {itinerary && (
        <button onClick={handleDownloadPDF} className="download-btn">
          Download PDF
        </button>
      )}

      {error && <p className="error">{error}</p>}

      {itinerary && (
        <div className="itinerary-container" ref={itineraryRef}>
          {informativeMode && itinerary.overview && (
            <div className="overview">
              <h3>Overview</h3>
              <p>{itinerary.overview.summary}</p>
              <p>{itinerary.overview.historical_context}</p>
            </div>
          )}

          {itinerary.days.map((day) => (
            <div key={day.day} className="day-card">
              <h3>Day {day.day}{day.theme ? `: ${day.theme}` : ""}</h3>
              {day.places.map((place, idx) => (
                <div key={idx} className="place-card">
                  <h4>{place.name}</h4>
                  <p><strong>Time:</strong> {place.time}</p>
                  {informativeMode && place.about && <p><strong>About:</strong> {place.about}</p>}
                  {informativeMode && place.historical_facts && (
                    <ul>
                      {place.historical_facts.map((fact, i) => (
                        <li key={i}>{fact}</li>
                      ))}
                    </ul>
                  )}
                  {informativeMode && place.why_it_matters && <p><strong>Why it matters:</strong> {place.why_it_matters}</p>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
