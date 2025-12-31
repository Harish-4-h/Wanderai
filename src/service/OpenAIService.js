import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateGPTResponse = async (prompt) => {
  try {
    const response = await client.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Return ONLY a valid JSON array. No text, no markdown, no explanations. The response MUST start with [ and end with ]."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    let raw = response.choices[0].message.content.trim();

    // Extract only the JSON array part to prevent parsing errors
    const jsonStart = raw.indexOf("[");
    const jsonEnd = raw.lastIndexOf("]") + 1;
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Invalid JSON response from GPT");
    }

    const jsonString = raw.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonString);

    // Ensure it's always an array
    if (!Array.isArray(parsed)) {
      throw new Error("GPT response is not an array");
    }

    return parsed;
  } catch (error) {
    console.error("OpenAI API error or invalid response:", error);
    throw error;
  }
};
