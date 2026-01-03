
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

const STORY_SYSTEM_INSTRUCTION = `You are a professional RPG game master. 
Your storytelling is direct, punchy, and grounded. 
Avoid flowery metaphors, purple prose, or whimsical commentary. 
Focus on cold facts, immediate environment, and visceral sensations. 
Limit each scene description to exactly 2-3 impact-focused sentences. 

CRITICAL VISUAL RULE:
Your 'imagePrompt' must be a LITERAL, detailed description of the scene's current visual state. 
Focus on: Physical objects present, specific lighting conditions, the player's immediate surroundings, and the mood. 
Do not use abstract concepts. If the player used an item (e.g. a torch), the image prompt MUST include that item.`;

export async function generateInitialScene(theme: string): Promise<Scene> {
  const ai = getAI();
  const prompt = `Start a gritty chronicle based on the theme: "${theme}". 
  Provide the first scene. Ensure the imagePrompt is a hyper-literal description of the setting.`;

  const response = await ai.models.generateContent({
    model: STORY_MODEL,
    contents: prompt,
    config: {
      systemInstruction: STORY_SYSTEM_INSTRUCTION,
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
                action: { type: Type.STRING },
                usedItem: { type: Type.STRING }
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
  const contextHistory = history.slice(-3).map(s => `Scene: ${s.title}\nDesc: ${s.description}`).join('\n\n');
  const invText = character.inventory.length > 0 ? character.inventory.join(", ") : "None";

  const prompt = `Current Player Action: "${actionText}".
  Inventory: [${invText}].
  Recent Events:
  ${contextHistory}

  Generate the resulting scene. 
  If an item was used, describe its physical effect. 
  The 'imagePrompt' must explicitly reflect the consequences of "${actionText}".`;

  const response = await ai.models.generateContent({
    model: STORY_MODEL,
    contents: prompt,
    config: {
      systemInstruction: STORY_SYSTEM_INSTRUCTION,
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
                action: { type: Type.STRING },
                usedItem: { type: Type.STRING }
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
  const fullPrompt = `Grounded cinematic photography, wide-angle lens, sharp focus, literal representation: ${prompt}`;
  const ai = getAI();
  
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
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: FLASH_IMAGE_MODEL,
          contents: { parts: [{ text: fullPrompt }] }
        });
        for (const part of fallbackResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
      } catch (fallbackErr) {}
    }
  }
  return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1200/675`;
}

export async function textToSpeech(text: string, voice: string = 'Charon', speed: number = 1.0): Promise<string> {
  const ai = getAI();
  // Simplified prompt for the TTS model to avoid meta-commentary
  const response = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: [{ parts: [{ text: text }] }],
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
  const response = await ai.models.generateContent({
    model: STORY_MODEL,
    contents: {
      parts: [
        { inlineData: { data: audioBase64, mimeType: 'audio/pcm;rate=16000' } },
        { text: "Transcribe the spoken RPG action clearly. Concise text only." }
      ]
    }
  });
  return response.text?.trim() || '';
}
