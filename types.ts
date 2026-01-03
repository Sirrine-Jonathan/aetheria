
export interface Choice {
  id: string;
  text: string;
  action: string;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  choices: Choice[];
  imagePrompt: string;
  imageUrl?: string;
  location?: string;
}

export interface GameState {
  currentScene: Scene | null;
  history: Scene[];
  isGenerating: boolean;
  error: string | null;
  theme: string;
}

export enum GameAction {
  SET_SCENE,
  ADD_TO_HISTORY,
  SET_LOADING,
  SET_ERROR,
  RESET_GAME
}
