
import React from 'react';

interface StartScreenProps {
  onStart: (theme: string) => void;
  isLoading: boolean;
  isListening: boolean;
  onMicClick: () => void;
  startTheme: string;
  setStartTheme: (val: string) => void;
  selectedVoice: string;
  setSelectedVoice: (val: string) => void;
  speechSpeed: number;
  setSpeechSpeed: (val: number) => void;
  onPreviewVoice: () => void;
  isSpeaking: boolean;
}

const PRESETS = [
  "A cyberpunk detective in a neon-soaked rain city",
  "A lost explorer in an ancient sunken civilization",
  "A rogue wizard in a floating academy of magic",
  "A space scavenger on a derelict gothic freighter",
  "A mystical samurai in a forest of shifting seasons"
];

const VOICES = [
  { id: 'Charon', name: 'Charon (Deep/Male)' },
  { id: 'Kore', name: 'Kore (Female)' },
  { id: 'Puck', name: 'Puck (Playful/Male)' },
  { id: 'Zephyr', name: 'Zephyr (Calm/Neutral)' }
];

export const StartScreen: React.FC<StartScreenProps> = ({ 
  onStart, isLoading, isListening, onMicClick, startTheme, setStartTheme, 
  selectedVoice, setSelectedVoice, speechSpeed, setSpeechSpeed, onPreviewVoice, isSpeaking
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startTheme.trim()) onStart(startTheme);
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#050505] text-center overflow-y-auto pt-0 pb-20">
      
      {/* Edge-to-Edge Cinematic Hero Section */}
      <header className="relative w-full h-[45vh] md:h-[55vh] flex-shrink-0 overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
          alt="Aetheria Weaver" 
          className="w-full h-full object-cover transition-transform duration-[40s] group-hover:scale-110 opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-transparent" />

        <div className="absolute bottom-12 left-0 w-full flex flex-col items-center space-y-4 px-6">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-purple-500/50" />
            <span className="text-[10px] uppercase tracking-[0.5em] text-purple-400 font-black animate-pulse">
              Dimensional Weaving Initated
            </span>
            <div className="h-px w-8 bg-purple-500/50" />
          </div>
          <h1 className="serif text-6xl md:text-9xl font-bold bg-gradient-to-br from-white via-purple-100 to-indigo-300 bg-clip-text text-transparent tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
            Aetheria
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl w-full px-6 py-12 md:py-20 fade-in space-y-16">
        
        {/* Settings Area */}
        <section className="glass-panel rounded-3xl p-8 border border-white/5 space-y-8 animate-fadeIn text-left">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
             </div>
             <h2 className="text-xl font-bold text-white tracking-tight">Voice Chronicle Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Voice Selection */}
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Narrator Voice</label>
              <div className="flex gap-2">
                <select 
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                <button 
                  onClick={onPreviewVoice}
                  disabled={isSpeaking || isLoading}
                  className={`px-4 py-3 rounded-xl border border-white/10 transition-all ${isSpeaking ? 'bg-purple-600 text-white animate-pulse' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
            </div>

            {/* Speed Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Speech Speed</label>
                <span className="text-xs font-bold text-purple-400">{speechSpeed.toFixed(1)}x</span>
              </div>
              <input 
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speechSpeed}
                onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[8px] text-gray-600 font-bold uppercase tracking-widest">
                <span>Glacial</span>
                <span>Normal</span>
                <span>Racing</span>
              </div>
            </div>
          </div>
        </section>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto group">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-30 transition duration-1000" />
          <div className="relative space-y-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Where shall your legend begin?"
                value={startTheme}
                onChange={(e) => setStartTheme(e.target.value)}
                disabled={isLoading || isListening}
                className="w-full bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl px-10 py-7 md:py-9 text-xl md:text-3xl focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-800 pr-24 shadow-2xl text-white font-light tracking-tight"
              />
              <button 
                type="button"
                onClick={onMicClick}
                disabled={isListening || isLoading}
                className={`absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-2xl transition-all active:scale-90 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'text-gray-600 hover:text-purple-400'}`}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !startTheme.trim() || isListening}
              className="w-full px-12 py-6 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-500 rounded-3xl font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-purple-900/40 transition-all active:scale-95 flex items-center justify-center gap-4 group/btn"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing Reality...</span>
                </>
              ) : (
                <>
                  <span>Begin Journey</span>
                  <svg className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Destiny Presets */}
        <div className="space-y-8 pt-12">
          <div className="flex items-center gap-6 max-w-md mx-auto">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[11px] text-gray-600 uppercase tracking-[0.4em] font-black">Choose A Destiny</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => onStart(preset)}
                disabled={isLoading || isListening}
                className="group relative p-8 text-left rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-purple-500/30 transition-all text-sm text-gray-500 hover:text-white overflow-hidden shadow-lg active:scale-95"
              >
                <div className="absolute top-0 left-0 w-1.5 h-0 bg-purple-500 group-hover:h-full transition-all duration-300" />
                <span className="block font-medium leading-relaxed italic">"{preset}"</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <footer className="pt-24 pb-12 opacity-30 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-gray-500 font-bold mb-2">
            Aetheria v2.8 • Neural Story Engine
          </p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-gray-600 font-black">
            Powered by Gemini Multi-Modal Intelligence
          </p>
        </footer>
      </div>
    </div>
  );
};
