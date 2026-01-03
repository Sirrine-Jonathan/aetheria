
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Scene, Choice } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const STORY_MODEL = 'gemini-3-flash-preview';
const IMAGE_MODEL = 'gemini-2.5-flash-image';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

export async function generateInitialScene(theme: string): Promise<Scene> {
  const prompt = `Start a new interactive adventure story based on the theme: "${theme}". 
  Create a compelling opening scene. 
  Include:
  1. A title for the scene.
  2. A vivid description (2-4 sentences).
  3. 3 unique choices for the player.
  4. A detailed image generation prompt that describes the visual atmosphere of this specific scene without using character names or plot text.`;

  const response = await ai.models.generateContent({
    model: STORY_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          choices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                action: { type: Type.STRING }
              },
              required: ["id", "text", "action"]
            }
          },
          imagePrompt: { type: Type.STRING }
        },
        required: ["title", "description", "choices", "imagePrompt"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return { ...data, id: crypto.randomUUID() };
}

export async function generateNextScene(history: Scene[], choice: Choice): Promise<Scene> {
  const context = history.map(s => `Scene: ${s.title}\nDescription: ${s.description}\nPlayer chose: ${choice.text}`).join('\n\n');
  
  const prompt = `Continue the story based on the player's last choice: "${choice.action}".
  Current Context:
  ${context}

  Generate the next step in the journey. Ensure continuity and stakes.
  Include:
  1. A title for the new scene.
  2. A vivid description of what happens next (2-4 sentences).
  3. 3-4 new choices for the player.
  4. A detailed visual prompt for an image generator (no text/UI elements).`;

  const response = await ai.models.generateContent({
    model: STORY_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          choices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                action: { type: Type.STRING }
              },
              required: ["id", "text", "action"]
            }
          },
          imagePrompt: { type: Type.STRING }
        },
        required: ["title", "description", "choices", "imagePrompt"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return { ...data, id: crypto.randomUUID() };
}

export async function generateSceneImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [{ text: `Cinematic digital art, high fantasy style, detailed lighting: ${prompt}` }]
      },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1200/675`;
  } catch (err) {
    return `https://picsum.photos/seed/error/1200/675`;
  }
}

export async function textToSpeech(text: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: [{ parts: [{ text: `Narrate this dramatically: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
}

export async function processVoiceInput(audioBase64: string, choices: Choice[]): Promise<string | null> {
  const choiceTextList = choices.map(c => `"${c.text}" (ID: ${c.id})`).join(', ');
  const prompt = `The user spoke an audio command. Based on what they said, which of these story choices did they pick?
  Choices: ${choiceTextList}
  If none match, return "null". Only return the choice ID.`;

  const response = await ai.models.generateContent({
    model: STORY_MODEL,
    contents: [
      { inlineData: { data: audioBase64, mimeType: 'audio/pcm;rate=16000' } },
      { text: prompt }
    ],
    config: {
      responseMimeType: "text/plain"
    }
  });

  const result = response.text?.trim() || 'null';
  return choices.find(c => c.id === result)?.id || null;
}
