
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Scene, Choice, CharacterState } from "../types";

// Always create a fresh instance to ensure the latest API key is used
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const STORY_MODEL = 'gemini-3-flash-preview';
const PRO_IMAGE_MODEL = 'gemini-3-pro-image-preview';
const FLASH_IMAGE_MODEL = 'gemini-2.5-flash-image';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

const CHARACTER_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    health: { type: Type.NUMBER, description: "Change in health (e.g. -10 or +5). Default 0." },
    sanity: { type: Type.NUMBER, description: "Change in sanity (e.g. -5). Default 0." },
    experience: { type: Type.NUMBER, description: "Experience gained. Default 0." },
    itemFound: { type: Type.STRING, description: "Name of item found, or null." },
    statusAdded: { type: Type.STRING, description: "New status effect like 'Poisoned', or null." }
  }
};

export async function generateInitialScene(theme: string): Promise<Scene> {
  const ai = getAI();
  const prompt = `Start a new interactive adventure based on: "${theme}". 
  Provide a vivid opening. Include:
  1. Title & Description.
  2. 3 Choices.
  3. Image prompt.
  4. Initial character stats if applicable.`;

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
          imagePrompt: { type: Type.STRING },
          statChanges: CHARACTER_SCHEMA
        },
        required: ["title", "description", "choices", "imagePrompt"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return { ...data, id: crypto.randomUUID() };
}

export async function generateNextScene(history: Scene[], input: Choice | string, character: CharacterState): Promise<Scene> {
  const ai = getAI();
  const actionText = typeof input === 'string' ? input : input.action;
  const contextHistory = history.slice(-5).map(s => `Scene: ${s.title}\nDesc: ${s.description}`).join('\n\n');
  const invText = character.inventory.length > 0 ? character.inventory.join(", ") : "Empty Handed";

  const prompt = `Continue story based on: "${actionText}".
  Current State: HP ${character.health}/${character.maxHealth}, Sanity ${character.sanity}, Inventory: [${invText}].
  Recent History:
  ${contextHistory}

  If the player finds an item, include it in 'itemFound'. If they get hurt, adjust stats.
  Provide next title, description, and 3-4 choices. One choice should ideally use an item from their inventory if they have any.`;

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
          imagePrompt: { type: Type.STRING },
          statChanges: CHARACTER_SCHEMA
        },
        required: ["title", "description", "choices", "imagePrompt"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return { ...data, id: crypto.randomUUID() };
}

export async function generateSceneImage(prompt: string): Promise<string> {
  const fullPrompt = `Masterpiece cinematic digital art, hyper-detailed concept art: ${prompt}`;
  const ai = getAI();
  
  // Try Pro model first
  try {
    const response = await ai.models.generateContent({
      model: PRO_IMAGE_MODEL,
      contents: { parts: [{ text: fullPrompt }] },
      config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch (err: any) {
    const isQuotaError = err.message?.includes("429") || err.message?.includes("Quota exceeded");
    
    if (isQuotaError) {
      console.warn("Pro Image model quota hit, falling back to Flash model...");
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: FLASH_IMAGE_MODEL,
          contents: { parts: [{ text: fullPrompt }] }
        });
        
        for (const part of fallbackResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
      } catch (fallbackErr) {
        console.error("Flash image fallback failed", fallbackErr);
      }
    } else {
      console.error("Image generation error:", err);
    }
  }

  // Final fallback to a placeholder if both models fail
  return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1200/675`;
}

export async function textToSpeech(text: string, voice: string = 'Charon', speed: number = 1.0): Promise<string> {
  const ai = getAI();
  const speedLabel = speed > 1.3 ? "quickly" : speed < 0.9 ? "slowly" : "normally";
  const prompt = `Say ${speedLabel} and dramatically: ${text}`;
  
  const response = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
}

export async function transcribeAudio(audioBase64: string): Promise<string> {
  const ai = getAI();
  const prompt = `Transcribe the user's speech from the audio into a short, clear sentence describing an action in a roleplaying game. Do not include extra commentary, just the transcription.`;

  const response = await ai.models.generateContent({
    model: STORY_MODEL,
    contents: {
      parts: [
        {
          inlineData: {
            data: audioBase64,
            mimeType: 'audio/pcm;rate=16000',
          },
        },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "text/plain"
    }
  });

  return response.text?.trim() || '';
}
