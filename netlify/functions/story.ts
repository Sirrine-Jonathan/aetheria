import { Context } from "@netlify/functions";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.1-8b-instant";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { prompt, systemInstruction } = await req.json();
    const apiKey = req.headers.get("X-API-Key") || GROQ_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API Key not configured" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemInstruction + "\n\nIMPORTANT: You must respond with a valid JSON object matching the requested schema. Do not include any other text." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API Error:", errorData);
      return new Response(JSON.stringify({ error: "Failed to generate story" }), { 
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
