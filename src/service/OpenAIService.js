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

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
};
