
import React, { useState, useRef, useEffect } from 'react';
import { GameState, Scene, Choice } from './types';
import { generateInitialScene, generateNextScene, generateSceneImage, textToSpeech, processVoiceInput } from './services/geminiService';
import { Sidebar } from './components/Sidebar';
import { StoryDisplay } from './components/StoryDisplay';
import { StartScreen } from './components/StartScreen';
import { LoadingOverlay } from './components/LoadingOverlay';
import { decode, decodeAudioData, blobToPCM } from './utils/audioUtils';

const App: React.FC = () => {
  const [state, setState] = useState<GameState & { autoDictate: boolean; autoListen: boolean; isSpeaking: boolean; isListening: boolean }>({
    currentScene: null,
    history: [],
    isGenerating: false,
    error: null,
    theme: '',
    autoDictate: true,
    autoListen: true,
    isSpeaking: false,
    isListening: false
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const toggleAutoDictate = () => setState(p => ({ ...p, autoDictate: !p.autoDictate }));
  const toggleAutoListen = () => setState(p => ({ ...p, autoListen: !p.autoListen }));

  const speakText = async (text: string) => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
    const ctx = audioCtxRef.current;
    
    setState(p => ({ ...p, isSpeaking: true }));
    try {
      const base64 = await textToSpeech(text);
      if (base64) {
        const audioBuffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => {
          setState(p => ({ ...p, isSpeaking: false }));
          if (state.autoListen) startListening();
        };
        source.start();
      } else {
        setState(p => ({ ...p, isSpeaking: false }));
      }
    } catch (err) {
      console.error("Speech error:", err);
      setState(p => ({ ...p, isSpeaking: false }));
    }
  };

  const startListening = async () => {
    if (state.isListening || !state.currentScene) return;
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
        
        const matchedId = await processVoiceInput(pcmData, state.currentScene!.choices);
        const choice = state.currentScene!.choices.find(c => c.id === matchedId);
        
        if (choice) {
          handleChoice(choice);
        } else {
          setState(p => ({ ...p, isGenerating: false, error: "I didn't quite catch that. Could you repeat?" }));
        }
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setState(p => ({ ...p, isListening: true }));
      
      // Stop listening after 4 seconds of silence or timeout
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') mediaRecorder.stop();
      }, 4000);

    } catch (err) {
      console.error("Mic access failed", err);
    }
  };

  const startGame = async (theme: string) => {
    setState(prev => ({ ...prev, isGenerating: true, error: null, theme }));
    try {
      const scene = await generateInitialScene(theme);
      const imageUrl = await generateSceneImage(scene.imagePrompt);
      const sceneWithImage = { ...scene, imageUrl };
      
      setState(prev => ({ ...prev, currentScene: sceneWithImage, isGenerating: false }));
      if (state.autoDictate) speakText(`${scene.title}. ${scene.description}`);
    } catch (err) {
      setState(prev => ({ ...prev, isGenerating: false, error: "Failed to weave the beginning." }));
    }
  };

  const handleChoice = async (choice: Choice) => {
    if (!state.currentScene) return;
    const previousScene = state.currentScene;
    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      history: [...prev.history, previousScene],
      error: null 
    }));

    try {
      const nextScene = await generateNextScene([...state.history, previousScene], choice);
      const imageUrl = await generateSceneImage(nextScene.imagePrompt);
      const sceneWithImage = { ...nextScene, imageUrl };

      setState(prev => ({ ...prev, currentScene: sceneWithImage, isGenerating: false }));
      if (state.autoDictate) speakText(`${nextScene.title}. ${nextScene.description}`);
    } catch (err) {
      setState(prev => ({ ...prev, isGenerating: false, error: "The story path was blocked." }));
    }
  };

  const resetGame = () => {
    setState(p => ({ ...p, currentScene: null, history: [], theme: '', error: null }));
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#0a0a0a] overflow-hidden">
      {!state.currentScene ? (
        <StartScreen onStart={startGame} isLoading={state.isGenerating} />
      ) : (
        <>
          <Sidebar 
            history={state.history} 
            onReset={resetGame}
            autoDictate={state.autoDictate}
            autoListen={state.autoListen}
            onToggleDictate={toggleAutoDictate}
            onToggleListen={toggleAutoListen}
          />
          <main className="flex-1 relative overflow-y-auto">
            {state.isGenerating && <LoadingOverlay />}
            <StoryDisplay 
              scene={state.currentScene} 
              onChoice={handleChoice} 
              isGenerating={state.isGenerating}
              isSpeaking={state.isSpeaking}
              isListening={state.isListening}
              error={state.error}
              onMicClick={startListening}
              onSpeakClick={() => speakText(`${state.currentScene?.title}. ${state.currentScene?.description}`)}
            />
          </main>
        </>
      )}
    </div>
  );
};

export default App;
