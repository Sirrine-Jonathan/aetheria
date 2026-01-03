
import React from 'react';
import { Scene, Choice } from '../types';

interface StoryDisplayProps {
  scene: Scene;
  onChoice: (choice: Choice) => void;
  onCustomAction: (action: string) => void;
  isGenerating: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  error: string | null;
  onMicClick: () => void;
  onSpeakClick: () => void;
  isHistorical?: boolean;
  onReturnToActive?: () => void;
  customAction: string;
  onCustomActionChange: (val: string) => void;
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ 
  scene, onChoice, onCustomAction, isGenerating, isSpeaking, isListening, error, onMicClick, onSpeakClick, isHistorical, onReturnToActive, customAction, onCustomActionChange
}) => {
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAction.trim() && !isGenerating && !isHistorical) {
      onCustomAction(customAction);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#050505]">
      
      {/* Hero Visual Section */}
      <div className="relative w-full h-[50vh] md:h-[60vh] flex-shrink-0 overflow-hidden bg-black">
        <img 
          src={scene.imageUrl} 
          alt={scene.title}
          className={`w-full h-full object-cover transition-transform duration-[30s] ease-linear hover:scale-105 ${isGenerating || isSpeaking ? 'opacity-30 blur-sm' : 'opacity-100'}`}
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-black/40" />

        {isHistorical && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30">
            <div className="px-8 py-3 bg-white text-black text-[11px] uppercase font-black tracking-[0.2em] rounded-full shadow-2xl">
              Historical Record
            </div>
          </div>
        )}

        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40">
            <div className="text-white text-center px-6 scale-in">
              <div className="w-24 h-24 border-8 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-8" />
              <span className="text-4xl font-black tracking-widest uppercase">Listening</span>
            </div>
          </div>
        )}
      </div>

      {/* Narrative Panel */}
      <div className="flex-1 w-full -mt-20 md:-mt-32 relative z-10 px-4 sm:px-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="bg-black border border-white/20 rounded-[3rem] p-10 md:p-16 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-white/10" />
            
            <header className="space-y-6 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex-1">
                <h1 className={`serif text-5xl md:text-8xl font-bold leading-tight transition-all duration-500 ${isSpeaking ? 'text-purple-400' : 'text-white'}`}>
                  {scene.title}
                </h1>
                <div className="h-1 w-32 bg-white mt-8" />
              </div>
              
              {isHistorical && (
                <button 
                  onClick={onReturnToActive}
                  className="mt-6 md:mt-0 bg-white text-black px-8 py-4 rounded-3xl text-xs font-black uppercase tracking-widest transition-all hover:bg-gray-200 active:scale-95"
                >
                  Return to Present
                </button>
              )}
            </header>

            <article className="max-w-none">
              <p className="text-2xl md:text-4xl text-white leading-snug font-medium tracking-tight">
                {scene.description}
              </p>
            </article>

            {error && (
              <div className="mt-12 p-8 bg-red-600 text-white rounded-3xl text-lg font-black uppercase text-center tracking-widest animate-pulse">
                {error}
              </div>
            )}
          </div>

          {!isHistorical ? (
            <div className="space-y-12 animate-fadeIn">
              
              <div className="flex flex-col md:flex-row gap-8">
                <form onSubmit={handleCustomSubmit} className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Declare your action..."
                    value={customAction}
                    onChange={(e) => onCustomActionChange(e.target.value)}
                    disabled={isGenerating || isListening}
                    className="w-full bg-black border-2 border-white/20 rounded-full px-10 py-8 text-2xl md:text-3xl focus:outline-none focus:border-white transition-all placeholder:text-white/60 pr-24 shadow-2xl text-white font-bold"
                  />
                  <button 
                    type="submit"
                    disabled={!customAction.trim() || isGenerating}
                    className="absolute right-10 top-1/2 -translate-y-1/2 p-2 text-white hover:scale-110 disabled:text-gray-900 transition-all"
                  >
                    <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M14 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                  </button>
                </form>

                <div className="flex gap-6 justify-center">
                  <button 
                    onClick={onSpeakClick}
                    disabled={isSpeaking || isGenerating}
                    className={`p-8 rounded-full border-2 transition-all active:scale-90 ${isSpeaking ? 'bg-white text-black border-white' : 'bg-black text-white border-white/20 hover:border-white'}`}
                  >
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                  </button>
                  <button 
                    onClick={onMicClick}
                    disabled={isListening || isGenerating}
                    className={`p-8 rounded-full border-2 transition-all active:scale-90 ${isListening ? 'bg-red-600 border-red-600 text-white' : 'bg-black text-white border-white/20 hover:border-white'}`}
                  >
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {scene.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => onChoice(choice)}
                    disabled={isGenerating || isListening}
                    className={`group relative flex items-center p-10 md:p-14 bg-black border-2 rounded-[3.5rem] transition-all text-left disabled:opacity-30 active:scale-[0.96] shadow-2xl overflow-hidden ${choice.usedItem ? 'border-amber-500 hover:bg-amber-500 hover:border-amber-500' : 'border-white/10 hover:bg-white hover:border-white'}`}
                  >
                    <div className="flex flex-col flex-1">
                      {choice.usedItem && <span className="text-[12px] uppercase font-black tracking-widest text-amber-500 group-hover:text-black mb-4 flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17,11V10H7V11H17M17,13V12H7V13H17M17,15V14H7V15H17M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19C3,20.1 3.89,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3Z"/></svg> Utilize {choice.usedItem}</span>}
                      <span className={`text-2xl md:text-4xl font-black leading-tight group-hover:text-black ${choice.usedItem ? 'text-amber-500' : 'text-white'}`}>
                        {choice.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-24 animate-fadeIn">
              <button 
                onClick={onReturnToActive}
                className="px-16 py-8 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 text-lg"
              >
                Awaken to Reality
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
