
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
    <div className="relative min-h-screen w-full flex flex-col">
      
      {/* Hero Visual Section */}
      <div className="relative w-full h-[50vh] md:h-[65vh] flex-shrink-0 overflow-hidden shadow-2xl">
        <img 
          src={scene.imageUrl} 
          alt={scene.title}
          className={`w-full h-full object-cover transition-transform duration-[30s] ease-linear hover:scale-110 ${isGenerating || isSpeaking ? 'brightness-50 blur-[2px]' : 'brightness-90'}`}
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-transparent" />

        {isHistorical && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
            <div className="px-6 py-2 bg-amber-500 text-black text-[10px] uppercase font-black tracking-widest rounded-full shadow-2xl ring-4 ring-amber-500/20">
              Echo of the Past
            </div>
          </div>
        )}

        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-10">
            <div className="text-white text-center px-6 scale-in">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-4 h-4 bg-red-500 rounded-full animate-ping" />
                </div>
              </div>
              <span className="text-3xl font-black tracking-tighter uppercase">Listening</span>
              <p className="text-sm text-gray-400 mt-2 font-medium">Describe your next action</p>
            </div>
          </div>
        )}
      </div>

      {/* Narrative & Interface Section */}
      <div className="flex-1 w-full -mt-24 md:-mt-36 relative z-10 px-4 sm:px-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
          
          {/* Main Content Card */}
          <div className="glass-panel rounded-[2rem] p-8 md:p-12 shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-30" />
            
            <header className="space-y-4 mb-8 flex justify-between items-start">
              <div className="flex-1">
                <h1 className={`serif text-4xl md:text-6xl font-bold leading-tight transition-all duration-700 ${isSpeaking ? 'text-purple-400' : 'text-white'}`}>
                  {scene.title}
                </h1>
                <div className="h-1 w-24 bg-purple-500/40 rounded-full mt-6" />
              </div>
              
              {isHistorical && (
                <button 
                  onClick={onReturnToActive}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-90 flex items-center gap-2"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                  Present
                </button>
              )}
            </header>

            <article className="prose prose-invert max-w-none">
              <p className="text-xl md:text-3xl text-gray-200 leading-relaxed font-light tracking-wide first-letter:text-6xl first-letter:font-bold first-letter:text-purple-500 first-letter:mr-3 first-letter:float-left">
                {scene.description}
              </p>
            </article>

            {error && (
              <div className="mt-8 p-5 bg-red-950/40 border border-red-500/30 rounded-2xl text-red-400 text-sm animate-pulse text-center font-bold">
                {error}
              </div>
            )}
          </div>

          {/* Interaction Area */}
          {!isHistorical ? (
            <div className="space-y-10 animate-fadeIn">
              
              {/* Voice & Action Row */}
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleCustomSubmit} className="relative flex-1 group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl blur opacity-0 group-focus-within:opacity-20 transition duration-500" />
                  <input 
                    type="text" 
                    placeholder="Type or speak a unique path..."
                    value={customAction}
                    onChange={(e) => onCustomActionChange(e.target.value)}
                    disabled={isGenerating || isListening}
                    className="w-full bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl px-8 py-6 md:py-7 text-lg md:text-2xl focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-700 pr-20 shadow-2xl relative z-10"
                  />
                  <button 
                    type="submit"
                    disabled={!customAction.trim() || isGenerating}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-purple-500 hover:text-purple-400 disabled:text-gray-800 transition-all active:scale-90 z-20"
                  >
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                  </button>
                </form>

                <div className="flex gap-4 justify-center relative z-10">
                  <button 
                    onClick={onSpeakClick}
                    disabled={isSpeaking || isGenerating}
                    className={`p-6 md:p-7 rounded-[1.5rem] backdrop-blur-2xl border border-white/10 shadow-2xl transition-all active:scale-90 ${isSpeaking ? 'bg-purple-600 text-white animate-pulse' : 'bg-white/5 hover:bg-white/10 text-gray-500'}`}
                    title="Speak Story"
                  >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                  </button>
                  <button 
                    onClick={onMicClick}
                    disabled={isListening || isGenerating}
                    className={`p-6 md:p-7 rounded-[1.5rem] backdrop-blur-2xl border border-white/10 shadow-2xl transition-all active:scale-90 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-white/5 hover:bg-white/10 text-gray-500'}`}
                    title="Voice Command"
                  >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 px-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[11px] text-gray-600 uppercase tracking-[0.3em] font-black">Predicted Paths</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* Predefined Choices Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {scene.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => onChoice(choice)}
                    disabled={isGenerating || isListening}
                    className="group relative flex items-center p-6 md:p-10 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/[0.08] hover:border-purple-500/40 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] overflow-hidden shadow-xl"
                  >
                    <div className="mr-6 flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl border border-white/20 flex items-center justify-center text-xs text-gray-500 group-hover:bg-purple-600 group-hover:border-purple-600 group-hover:text-white transition-all shadow-inner">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7" /></svg>
                    </div>
                    <span className="text-lg md:text-2xl font-bold text-gray-200 group-hover:text-white transition-colors leading-tight">
                      {choice.text}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-purple-600/0 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 animate-fadeIn">
              <p className="text-gray-500 italic mb-8 text-xl font-light">"This moment has passed into the tapestry of the Chronicle."</p>
              <button 
                onClick={onReturnToActive}
                className="inline-flex items-center gap-4 px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-3xl transition-all font-black uppercase tracking-widest shadow-2xl shadow-purple-900/40 active:scale-95 group"
              >
                <span>Awaken to the Now</span>
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="h-12 w-full" />
    </div>
  );
};
