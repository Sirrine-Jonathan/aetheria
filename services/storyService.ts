import { Scene, Choice, CharacterState, StoryConfig } from "../types";

let localApiKey: string | null = null;

export const setApiKey = (key: string) => {
  localApiKey = key;
};

const getSystemInstruction = (config: StoryConfig) => {
  let styleInstruction = "Your storytelling is direct, punchy, and grounded. Avoid flowery metaphors.";
  if (config.style === "Noir") styleInstruction = "Your storytelling is cynical, atmospheric, and shadowy. Use metaphors of decay and corruption.";
  if (config.style === "Fantasy") styleInstruction = "Your storytelling is epic, magical, and old-world. Use archaic terms and grand descriptions.";
  if (config.style === "Sci-Fi") styleInstruction = "Your storytelling is technical, sterile, and futuristic. Focus on technology and cosmic scale.";
  if (config.style === "Horror") styleInstruction = "Your storytelling is unsettling, visceral, and suspenseful. Focus on fear and sensory details of dread.";
  if (config.style === "Comedic") styleInstruction = "Your storytelling is humorous, absurd, and lighthearted. Highlight the irony and ridiculousness of situations.";
  if (config.style === "Dramatic") styleInstruction = "Your storytelling is emotional, intense, and character-driven. Focus on internal conflict and high stakes.";

  let lengthInstruction = "Limit each scene description to exactly 2-3 impact-focused sentences.";
  if (config.length === "Short") lengthInstruction = "Keep descriptions extremely brief. 1-2 punchy sentences maximum.";
  if (config.length === "Medium") lengthInstruction = "Provide a balanced description. 3-4 sentences.";
  if (config.length === "Long") lengthInstruction = "Provide a rich, detailed description. 5-7 sentences allowing for deep immersion.";

  return `You are a professional RPG game master. 
${styleInstruction}
${lengthInstruction}

CRITICAL NARRATIVE RULES:
1. NEVER loop the story. Every scene must present a NEW location, a NEW event, or a SIGNIFICANT change in state.
2. The choices you provide must be distinct, actionable, and lead to different outcomes.
3. If the player repeats an action or fails, describe the escalating consequences rather than repeating the same scene description.

CRITICAL VISUAL RULE:
Your 'imagePrompt' must be a LITERAL, detailed description of the scene's current visual state. 
Focus on: Physical objects present, specific lighting conditions, the player's immediate surroundings, and the mood. 
Do not use abstract concepts. If the player used an item (e.g. a torch), the image prompt MUST include that item.

JSON SCHEMA:
Return a JSON object with:
{
  "title": "string",
  "description": "string",
  "choices": [
    { "id": "string", "text": "string", "action": "string", "usedItem": "string | null" }
  ],
  "imagePrompt": "string",
  "statChanges": {
    "health": number (change, e.g. -10),
    "sanity": number (change),
    "experience": number,
    "itemFound": "string | null",
    "statusAdded": "string | null"
  }
}
Always provide exactly 3 choices.`;
};

async function callStoryFunction(prompt: string, systemInstruction: string): Promise<any> {
  const response = await fetch("/.netlify/functions/story", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...(localApiKey && { "X-API-Key": localApiKey })
    },
    body: JSON.stringify({ prompt, systemInstruction })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to generate story");
  }

  return await response.json();
}

export async function generateInitialScene(theme: string, config: StoryConfig): Promise<Scene> {
  const prompt = `Start a ${config.style.toLowerCase()} chronicle based on the theme: "${theme}". 
  Provide the first scene. Ensure the imagePrompt is a hyper-literal description of the setting.`;

  return await callStoryFunction(prompt, getSystemInstruction(config));
}

export async function generateNextScene(history: Scene[], input: Choice | string, character: CharacterState, config: StoryConfig): Promise<Scene> {
  const actionText = typeof input === 'string' ? input : input.action;
  const contextHistory = history.slice(-4).map((s, i) => `Turn ${i + 1}:\nLocation/Event: ${s.title}\nDesc: ${s.description}`).join('\n\n');
  const invText = character.inventory.length > 0 ? character.inventory.join(", ") : "None";

  const prompt = `CRITICAL DIRECTIVE: You must ADVANCE the story. Do NOT repeat the current location or event. The player is moving forward. Provide a COMPLETELY NEW scene, consequence, or environment resulting from their action.

  Player Action: "${actionText}"
  Inventory: [${invText}]
  
  Recent History (DO NOT REPEAT THESE):
  ${contextHistory}

  Generate the resulting NEW scene. Focus on the immediate, tangible consequences of the player's action. What do they see NOW? What is the NEW threat or discovery?`;

  return await callStoryFunction(prompt, getSystemInstruction(config));
}

export async function generateSceneImage(prompt: string): Promise<string> {
  // Use a reliable placeholder for images in the free tier
  return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1200/675`;
}

export async function textToSpeech(text: string, voice: string = 'Charon', speed: number = 1.0): Promise<string> {
  // Returning empty string to force fallback to browser's native SpeechSynthesis
  // This is free and works offline.
  return '';
}

export async function transcribeAudio(audioBase64: string): Promise<string> {
  // Fallback to empty string to trigger browser's native SpeechRecognition
  return "";
}
