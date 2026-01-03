
import React, { useState, useRef, useEffect } from 'react';
import { GameState, Scene, Choice, CharacterState } from './types';
import { generateInitialScene, generateNextScene, generateSceneImage, textToSpeech, transcribeAudio } from './services/geminiService';
import { Sidebar } from './components/Sidebar';
import { StoryDisplay } from './components/StoryDisplay';
import { StartScreen } from './components/StartScreen';
import { LoadingOverlay } from './components/LoadingOverlay';
import { decode, decodeAudioData, blobToPCM } from './utils/audioUtils';

// Removed conflicting manual aistudio declaration. 
// The environment already provides a global AIStudio type for window.aistudio.

const INITIAL_CHARACTER: CharacterState = {
  health: 100,
  maxHealth: 100,
  sanity: 100,
  experience: 0,
  inventory: [],
  statusEffects: []
};

const STORAGE_KEY = 'aetheria_game_v1';

const App: React.FC = () => {
  const [state, setState] = useState<GameState & { 
    autoDictate: boolean; 
    autoListen: boolean; 
    isSpeaking: boolean; 
    isListening: boolean;
    isSidebarOpen: boolean;
    viewingHistoryIndex: number | null; // null means active scene
    customAction: string;
    startTheme: string;
    selectedVoice: string;
    speechSpeed: number;
    hasApiKey: boolean;
  }>({
    currentScene: null,
    history: [],
    isGenerating: false,
    error: null,
    theme: '',
    character: INITIAL_CHARACTER,
    autoDictate: true,
    autoListen: false,
    isSpeaking: false,
    isListening: false,
    isSidebarOpen: false,
    viewingHistoryIndex: null,
    customAction: '',
    startTheme: '',
    selectedVoice: 'Charon',
    speechSpeed: 1.0,
    hasApiKey: false
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const checkKeyStatus = async () => {
      // Check for aistudio global provided by environment
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setState(p => ({ ...p, hasApiKey: hasKey }));
        } catch (e) {
          console.warn("Key check failed", e);
        }
      } else {
        // If not in aistudio environment, check if process.env has a key
        const envKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
        if (envKey && envKey !== 'undefined') {
          setState(p => ({ ...p, hasApiKey: true }));
        }
      }
    };
    checkKeyStatus();

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(p => ({ ...p, ...parsed, isGenerating: false, isSpeaking: false, isListening: false }));
      } catch (e) { 
        console.error("Failed to load save", e); 
      }
    }
  }, []);

  useEffect(() => {
    if (state.currentScene) {
      try {
        const { 
          isGenerating, isSpeaking, isListening, error, 
          isSidebarOpen, viewingHistoryIndex, ...toSave 
        } = state;

        const sanitizedHistory = toSave.history.map(scene => ({ 
          ...scene, 
          imageUrl: scene.imageUrl?.startsWith('data:') ? undefined : scene.imageUrl 
        }));
        
        const sanitizedCurrentScene = toSave.currentScene ? { 
          ...toSave.currentScene, 
          imageUrl: toSave.currentScene.imageUrl?.startsWith('data:') ? undefined : toSave.currentScene.imageUrl 
        } : null;

        const cleanData = {
          ...toSave,
          history: sanitizedHistory,
          currentScene: sanitizedCurrentScene
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
      } catch (e) {
        console.warn("Could not save to localStorage", e);
      }
    }
  }, [state.currentScene, state.history, state.character]);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setState(p => ({ ...p, hasApiKey: true }));
      } catch (e) {
        console.error("Failed to open key selector", e);
      }
    }
  };

  const toggleAutoDictate = () => setState(p => ({ ...p, autoDictate: !p.autoDictate }));
  const toggleAutoListen = () => setState(p => ({ ...p, autoListen: !p.autoListen }));
  const toggleSidebar = () => setState(p => ({ ...p, isSidebarOpen: !p.isSidebarOpen }));

  const speakText = async (text: string) => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
    const ctx = audioCtxRef.current;
    
    setState(p => ({ ...p, isSpeaking: true }));
    try {
      const base64 = await textToSpeech(text, state.selectedVoice, state.speechSpeed);
      if (base64) {
        const audioBuffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => {
          setState(p => ({ ...p, isSpeaking: false }));
          if (state.autoListen) startListening(false);
        };
        source.start();
      } else {
        setState(p => ({ ...p, isSpeaking: false }));
      }
    } catch (err) {
      setState(p => ({ ...p, isSpeaking: false }));
    }
  };

  const startListening = async (isStartScreen: boolean = false) => {
    if (state.isListening) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const pcmData = await blobToPCM(audioBlob);
        setState(p => ({ ...p, isListening: false, isGenerating: true }));
        
        try {
          const result = await transcribeAudio(pcmData);
          if (isStartScreen) {
            setState(p => ({ ...p, isGenerating: false, startTheme: result }));
          } else {
            setState(p => ({ ...p, isGenerating: false, customAction: result }));
          }
        } catch (err) {
          setState(p => ({ ...p, isGenerating: false, error: "Transcription failed." }));
        }
        
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setState(p => ({ ...p, isListening: true }));
      setTimeout(() => { if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop(); }, 4000);
    } catch (err) { 
      console.error("Mic error", err); 
    }
  };

  const updateCharacter = (changes: any) => {
    setState(p => {
      const char = { ...p.character };
      if (changes.health) char.health = Math.max(0, Math.min(char.maxHealth, char.health + changes.health));
      if (changes.sanity) char.sanity = Math.max(0, Math.min(100, char.sanity + changes.sanity));
      if (changes.experience) char.experience += changes.experience;
      if (changes.itemFound) char.inventory = [...char.inventory, changes.itemFound];
      if (changes.statusAdded) char.statusEffects = [...char.statusEffects, changes.statusAdded];
      return { ...p, character: char };
    });
  };

  const startGame = async (theme: string) => {
    if (!state.hasApiKey) {
      await handleOpenKeySelector();
      // Guideline: MUST assume the key selection was successful and proceed to the app
    }
    setState(prev => ({ ...prev, isGenerating: true, error: null, theme, character: INITIAL_CHARACTER, history: [], customAction: '', startTheme: theme }));
    try {
      const scene = await generateInitialScene(theme);
      const imageUrl = await generateSceneImage(scene.imagePrompt);
      setState(p => ({ ...p, currentScene: { ...scene, imageUrl }, isGenerating: false }));
      if (scene.statChanges) updateCharacter(scene.statChanges);
      if (state.autoDictate) speakText(`${scene.title}. ${scene.description}`);
    } catch (err: any) { 
      if (err.message?.includes("Requested entity was not found")) {
        setState(p => ({ ...p, isGenerating: false, hasApiKey: false, error: "API Key connection lost. Please reconnect." }));
        // Prompt to reconnect via openSelectKey as per guideline
        if (window.aistudio) window.aistudio.openSelectKey();
      } else {
        setState(p => ({ ...p, isGenerating: false, error: "Beginning failed." })); 
      }
    }
  };

  const handleChoice = async (input: Choice | string) => {
    if (!state.currentScene) return;
    const previousScene = state.currentScene;
    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      history: [...prev.history, previousScene],
      error: null,
      viewingHistoryIndex: null,
      customAction: ''
    }));

    try {
      const nextScene = await generateNextScene([...state.history, previousScene], input, state.character);
      const imageUrl = await generateSceneImage(nextScene.imagePrompt);
      setState(p => ({ ...p, currentScene: { ...nextScene, imageUrl }, isGenerating: false }));
      if (nextScene.statChanges) updateCharacter(nextScene.statChanges);
      if (state.autoDictate) speakText(`${nextScene.title}. ${nextScene.description}`);
    } catch (err: any) { 
      if (err.message?.includes("Requested entity was not found")) {
        setState(p => ({ ...p, isGenerating: false, hasApiKey: false, error: "API Key connection lost." }));
        // Prompt to reconnect via openSelectKey as per guideline
        if (window.aistudio) window.aistudio.openSelectKey();
      } else {
        setState(p => ({ ...p, isGenerating: false, error: "The path is blocked." })); 
      }
    }
  };

  const resetGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(p => ({ ...p, currentScene: null, history: [], theme: '', error: null, isSidebarOpen: false, character: INITIAL_CHARACTER, viewingHistoryIndex: null, customAction: '', startTheme: '' }));
  };

  const selectHistory = (index: number | null) => {
    setState(p => ({ ...p, viewingHistoryIndex: index, isSidebarOpen: false }));
  };

  const activeScene = state.viewingHistoryIndex !== null ? state.history[state.viewingHistoryIndex] : state.currentScene;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505] overflow-hidden relative">
      {!state.currentScene ? (
        <StartScreen 
          onStart={startGame} 
          isLoading={state.isGenerating} 
          isListening={state.isListening}
          onMicClick={() => startListening(true)}
          startTheme={state.startTheme}
          setStartTheme={(val) => setState(p => ({ ...p, startTheme: val }))}
          selectedVoice={state.selectedVoice}
          setSelectedVoice={(val) => setState(p => ({ ...p, selectedVoice: val }))}
          speechSpeed={state.speechSpeed}
          setSpeechSpeed={(val) => setState(p => ({ ...p, speechSpeed: val }))}
          onPreviewVoice={() => speakText("Greetings adventurer. I shall be your guide through the Chronicle.")}
          isSpeaking={state.isSpeaking}
          hasApiKey={state.hasApiKey}
          onConnectKey={handleOpenKeySelector}
          error={state.error}
        />
      ) : (
        <>
          {state.isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={toggleSidebar} />}
          <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${state.isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <Sidebar 
              history={state.history} 
              onReset={resetGame}
              autoDictate={state.autoDictate}
              autoListen={state.autoListen}
              onToggleDictate={toggleAutoDictate}
              onToggleListen={toggleAutoListen}
              onCloseMobile={() => setState(p => ({ ...p, isSidebarOpen: false }))}
              character={state.character}
              currentScene={state.currentScene}
              viewingIndex={state.viewingHistoryIndex}
              onSelectHistory={selectHistory}
            />
          </div>
          <main className="flex-1 relative overflow-y-auto w-full">
            {state.isGenerating && <LoadingOverlay />}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a] sticky top-0 z-30">
              <button onClick={toggleSidebar} className="p-2 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
              <h1 className="serif text-xl font-bold text-purple-400">Aetheria</h1>
              <div className="w-10" />
            </div>
            {activeScene && (
              <StoryDisplay 
                scene={activeScene} 
                onChoice={handleChoice} 
                onCustomAction={handleChoice}
                isGenerating={state.isGenerating}
                isSpeaking={state.isSpeaking}
                isListening={state.isListening}
                error={state.error}
                onMicClick={() => startListening(false)}
                onSpeakClick={() => speakText(`${activeScene.title}. ${activeScene.description}`)}
                isHistorical={state.viewingHistoryIndex !== null}
                onReturnToActive={() => selectHistory(null)}
                customAction={state.customAction}
                onCustomActionChange={(val) => setState(p => ({ ...p, customAction: val }))}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default App;
