import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 👈 REQUIRED for Vite/React
});

export const generateGPTResponse = async (prompt) => {
  try {
    const response = await client.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
};
