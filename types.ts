
export interface Choice {
  id: string;
  text: string;
  action: string;
  usedItem?: string; // The name of the item from inventory consumed by this choice
}

export interface CharacterState {
  health: number;
  maxHealth: number;
  sanity: number;
  experience: number;
  inventory: string[];
  statusEffects: string[];
}

export type StoryStyle = "Standard" | "Noir" | "Fantasy" | "Sci-Fi" | "Horror" | "Comedic" | "Dramatic";
export type StoryLength = "Short" | "Medium" | "Long";

export interface StoryConfig {
  style: StoryStyle;
  length: StoryLength;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  choices: Choice[];
  imagePrompt: string;
  imageUrl?: string;
  location?: string;
  statChanges?: Partial<CharacterState>;
  itemFound?: string;
}

export interface GameState {
  currentScene: Scene | null;
  history: Scene[];
  isGenerating: boolean;
  error: string | null;
  theme: string;
  character: CharacterState;
  storyConfig: StoryConfig;
}

export enum GameAction {
  SET_SCENE,
  ADD_TO_HISTORY,
  SET_LOADING,
  SET_ERROR,
  RESET_GAME
}
