
import React, { useState, useRef, useEffect } from 'react';
import { GameState, Scene, Choice, CharacterState, StoryConfig, StoryStyle, StoryLength } from './types';
import { generateInitialScene, generateNextScene, generateSceneImage, textToSpeech, transcribeAudio } from './services/geminiService';
import { Sidebar } from './components/Sidebar';
import { StoryDisplay } from './components/StoryDisplay';
import { StartScreen } from './components/StartScreen';
import { LoadingOverlay } from './components/LoadingOverlay';
import { decode, decodeAudioData, blobToPCM } from './utils/audioUtils';

const INITIAL_CHARACTER: CharacterState = {
  health: 100,
  maxHealth: 100,
  sanity: 100,
  experience: 0,
  inventory: [],
  statusEffects: []
};

const INITIAL_STORY_CONFIG: StoryConfig = {
  style: "Standard",
  length: "Short"
};

const STORAGE_KEY = 'aetheria_game_v1';

const App: React.FC = () => {
  const [state, setState] = useState<GameState & { 
    autoDictate: boolean; 
    autoListen: boolean; 
    isSpeaking: boolean; 
    isListening: boolean;
    isSidebarOpen: boolean;
    viewingHistoryIndex: number | null;
    customAction: string;
    startTheme: string;
    selectedVoice: string;
    speechSpeed: number;
    hasApiKey: boolean;
    isVoiceLoading: boolean;
  }>({
    currentScene: null,
    history: [],
    isGenerating: false,
    error: null,
    theme: '',
    character: INITIAL_CHARACTER,
    storyConfig: INITIAL_STORY_CONFIG,
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
    hasApiKey: false,
    isVoiceLoading: false,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const checkApiKey = async () => {
      // @ts-ignore
      if (window.aistudio?.hasSelectedApiKey) {
        try {
          // @ts-ignore
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setState(p => ({ ...p, hasApiKey: hasKey }));
        } catch (e) {
          console.warn("Key check failed", e);
        }
      } else if (process.env.API_KEY && process.env.API_KEY !== 'undefined') {
        setState(p => ({ ...p, hasApiKey: true }));
      }
    };
    checkApiKey();

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
      const { isGenerating, isSpeaking, isListening, error, isSidebarOpen, viewingHistoryIndex, ...toSave } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }
  }, [state.currentScene, state.history, state.character]);

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setState(p => ({ ...p, hasApiKey: true, error: null }));
      } catch (e) {
        setState(p => ({ ...p, error: "Failed to connect reality." }));
      }
    }
  };

  const stopSpeaking = () => {
    if (sourceRef.current) {
      sourceRef.current.onended = null;
      try {
        sourceRef.current.stop();
      } catch (e) {}
      sourceRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setState(p => ({ ...p, isSpeaking: false }));
  };

  const speakText = async (text: string) => {
    stopSpeaking();
    
    const fallbackSpeak = () => {
      if (!('speechSynthesis' in window)) {
        setState(p => ({ ...p, isVoiceLoading: false, isSpeaking: false, error: "Voice unavailable. Try a different browser." }));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = state.speechSpeed;
      
      utterance.onend = () => {
        setState(p => ({ ...p, isSpeaking: false }));
        if (state.autoListen) startListening(false);
      };

      utterance.onerror = () => {
        setState(p => ({ ...p, isSpeaking: false, isVoiceLoading: false, error: "Voice playback failed. Check audio settings." }));
      };

      setState(p => ({ ...p, isVoiceLoading: false, isSpeaking: true }));
      window.speechSynthesis.speak(utterance);
    };

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();
    
    setState(p => ({ ...p, isVoiceLoading: true }));

    try {
      // If no key is present, don't even try the API, go straight to fallback
      if (!state.hasApiKey) {
        fallbackSpeak();
        return;
      }

      const base64 = await textToSpeech(text, state.selectedVoice, state.speechSpeed);
      if (base64) {
        const audioBuffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.playbackRate.value = state.speechSpeed;
        
        sourceRef.current = source;
        source.onended = () => {
          if (sourceRef.current === source) {
            setState(p => ({ ...p, isSpeaking: false }));
            if (state.autoListen) startListening(false);
          }
        };
        
        setState(p => ({ ...p, isVoiceLoading: false, isSpeaking: true }));
        source.start();
      } else {
        fallbackSpeak();
      }
    } catch (err) {
      console.warn("Gemini TTS failed, switching to fallback:", err);
      fallbackSpeak();
    }
  };

  const startListening = async (isStartScreen: boolean = false) => {
    if (state.isListening) return;

    const startLocalListening = () => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setState(p => ({ ...p, isListening: false, isGenerating: false, error: "Voice module offline." }));
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => setState(p => ({ ...p, isListening: true, error: null }));
      recognition.onend = () => setState(p => ({ ...p, isListening: false }));
      recognition.onerror = () => setState(p => ({ ...p, isListening: false, error: "Local sensor error." }));
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (isStartScreen) {
          setState(p => ({ ...p, startTheme: transcript }));
        } else {
          setState(p => ({ ...p, customAction: transcript }));
        }
      };
      
      recognition.start();
    };

    if (!state.hasApiKey) {
      startLocalListening();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          setState(p => ({ ...p, isListening: false, isGenerating: true }));
          
          try {
            const result = await transcribeAudio(base64data);
            if (isStartScreen) {
              setState(p => ({ ...p, isGenerating: false, startTheme: result }));
            } else {
              setState(p => ({ ...p, isGenerating: false, customAction: result }));
            }
          } catch (err) {
            setState(p => ({ ...p, isGenerating: false, error: "Transmission interrupted." }));
          }
        };
        reader.readAsDataURL(audioBlob);
        
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setState(p => ({ ...p, isListening: true }));
      setTimeout(() => { 
        if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop(); 
      }, 5000);
    } catch (err) { 
      console.warn("Mic access error, switching to local:", err); 
      startLocalListening();
    }
  };

  const updateCharacter = (changes: any) => {
    setState(p => {
      const char = { ...p.character };
      if (changes.health) char.health = Math.max(0, Math.min(char.maxHealth, char.health + changes.health));
      if (changes.sanity) char.sanity = Math.max(0, Math.min(100, char.sanity + changes.sanity));
      if (changes.experience) char.experience += changes.experience;
      
      // Fixed: Filter out null, "null", "none" or empty item names
      const validItemFound = changes.itemFound && 
                             changes.itemFound.toLowerCase() !== 'null' && 
                             changes.itemFound.toLowerCase() !== 'none';
                             
      if (validItemFound) {
        char.inventory = [...char.inventory, changes.itemFound];
      }
      
      if (changes.statusAdded) char.statusEffects = [...char.statusEffects, changes.statusAdded];
      return { ...p, character: char };
    });
  };

  const startGame = async (theme: string) => {
    if (!theme.trim()) return;
    stopSpeaking();
    setState(prev => ({ ...prev, isGenerating: true, error: null, theme, character: INITIAL_CHARACTER, history: [], customAction: '', startTheme: theme }));
    try {
      const scene = await generateInitialScene(theme, state.storyConfig);
      const imageUrl = await generateSceneImage(scene.imagePrompt);
      setState(p => ({ ...p, currentScene: { ...scene, imageUrl }, isGenerating: false }));
      if (scene.statChanges) updateCharacter(scene.statChanges);
      if (state.autoDictate) speakText(`${scene.title}. ${scene.description}`);
    } catch (err: any) { 
      setState(p => ({ ...p, isGenerating: false, error: "The chronicle failed to start. Try again." })); 
    }
  };

  const handleChoice = async (input: Choice | string) => {
    if (!state.currentScene) return;
    stopSpeaking();
    const previousScene = state.currentScene;
    
    let nextCharacter = { ...state.character };
    if (typeof input !== 'string' && input.usedItem) {
      const itemIndex = nextCharacter.inventory.indexOf(input.usedItem);
      if (itemIndex > -1) {
        const newInventory = [...nextCharacter.inventory];
        newInventory.splice(itemIndex, 1);
        nextCharacter.inventory = newInventory;
      }
    }

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      history: [...prev.history, previousScene],
      error: null,
      viewingHistoryIndex: null,
      customAction: '',
      character: nextCharacter
    }));

    try {
      const nextScene = await generateNextScene([...state.history, previousScene], input, nextCharacter, state.storyConfig);
      const imageUrl = await generateSceneImage(nextScene.imagePrompt);
      setState(p => ({ ...p, currentScene: { ...nextScene, imageUrl }, isGenerating: false }));
      if (nextScene.statChanges) updateCharacter(nextScene.statChanges);
      if (state.autoDictate) speakText(`${nextScene.title}. ${nextScene.description}`);
    } catch (err: any) { 
      setState(p => ({ ...p, isGenerating: false, error: "Path obstructed. Resubmit your choice." })); 
    }
  };

  const resetGame = () => {
    stopSpeaking();
    localStorage.removeItem(STORAGE_KEY);
    setState(p => ({ ...p, currentScene: null, history: [], theme: '', error: null, isSidebarOpen: false, character: INITIAL_CHARACTER, viewingHistoryIndex: null, customAction: '', startTheme: '' }));
  };

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
          storyConfig={state.storyConfig}
          setStoryConfig={(val) => setState(p => ({ ...p, storyConfig: val }))}
          onPreviewVoice={() => speakText("I await your command.")}
          isSpeaking={state.isSpeaking}
          hasApiKey={state.hasApiKey}
          onConnectKey={handleOpenKeySelector}
          error={state.error}
          isVoiceLoading={state.isVoiceLoading}
        />
      ) : (
        <>
          {state.isSidebarOpen && <div className="fixed inset-0 bg-black/85 backdrop-blur-lg z-40 md:hidden" onClick={() => setState(p => ({ ...p, isSidebarOpen: false }))} />}
          <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${state.isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <Sidebar 
              history={state.history} 
              onReset={resetGame}
              autoDictate={state.autoDictate}
              autoListen={state.autoListen}
              onToggleDictate={() => setState(p => ({ ...p, autoDictate: !p.autoDictate }))}
              onToggleListen={() => setState(p => ({ ...p, autoListen: !p.autoListen }))}
              onCloseMobile={() => setState(p => ({ ...p, isSidebarOpen: false }))}
              character={state.character}
              currentScene={state.currentScene}
              viewingIndex={state.viewingHistoryIndex}
              onSelectHistory={(idx) => setState(p => ({ ...p, viewingHistoryIndex: idx, isSidebarOpen: false }))}
            />
          </div>
          <main className="flex-1 relative overflow-y-auto w-full">
            {state.isGenerating && <LoadingOverlay />}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-white/20 bg-black sticky top-0 z-30">
              <button onClick={() => setState(p => ({ ...p, isSidebarOpen: true }))} className="p-2 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
              <h1 className="serif text-xl font-bold text-white tracking-widest uppercase">Aetheria</h1>
              <div className="w-10" />
            </div>
            { (state.viewingHistoryIndex !== null ? state.history[state.viewingHistoryIndex] : state.currentScene) && (
              <StoryDisplay 
                scene={state.viewingHistoryIndex !== null ? state.history[state.viewingHistoryIndex] : state.currentScene!} 
                onChoice={handleChoice} 
                onCustomAction={handleChoice}
                isGenerating={state.isGenerating}
                isSpeaking={state.isSpeaking}
                isListening={state.isListening}
                error={state.error}
                onMicClick={() => startListening(false)}
                onSpeakClick={() => {
                  const s = state.viewingHistoryIndex !== null ? state.history[state.viewingHistoryIndex] : state.currentScene;
                  if (s) speakText(`${s.title}. ${s.description}`);
                }}
                isHistorical={state.viewingHistoryIndex !== null}
                onReturnToActive={() => setState(p => ({ ...p, viewingHistoryIndex: null }))}
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
