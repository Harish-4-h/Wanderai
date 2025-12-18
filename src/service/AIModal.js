import { generateGPTResponse } from "./OpenAIService";

/**
 * Generates a travel plan using GPT and ensures valid JSON output.
 * @param {string} destination
 * @param {number} days
 * @param {string} traveler
 * @param {string} budget
 */
export const generateTravelPlan = async (destination, days, traveler, budget) => {
  try {
    const prompt = `
Generate a ${days}-day travel itinerary for ${destination} for a ${traveler} traveler with a ${budget} budget. Respond ONLY in JSON format:

{
  "destination": "${destination}",
  "days": ${days},
  "itinerary": [
    { "day": 1, "plan": "..." },
    { "day": 2, "plan": "..." }
  ]
}

Do NOT include explanations or markdown. Only return valid JSON.
    `;

    const rawResponse = await generateGPTResponse(prompt);

    // Remove any ```json ``` wrappers
    const cleaned = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();

    // ✅ Ensure valid JSON
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ Invalid GPT JSON:", rawResponse);
      // Return fallback empty itinerary
      parsed = {
        destination,
        days,
        itinerary: []
      };
    }

    return parsed;
  } catch (error) {
    console.error("❌ generateTravelPlan error:", error);
    return {
      destination,
      days,
      itinerary: []
    };
  }
};
