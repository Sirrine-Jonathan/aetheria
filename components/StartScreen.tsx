
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
  hasApiKey: boolean;
  onConnectKey: () => void;
  error?: string | null;
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
  selectedVoice, setSelectedVoice, speechSpeed, setSpeechSpeed, onPreviewVoice, isSpeaking,
  hasApiKey, onConnectKey, error
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasApiKey) {
      onConnectKey();
      return;
    }
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

        <div className="absolute top-6 right-6 z-30">
          <div className={`flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-md transition-all ${hasApiKey ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
             <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
             <span className="text-[10px] font-black uppercase tracking-widest">
               {hasApiKey ? 'Neural Link Active' : 'Sign-in Required'}
             </span>
          </div>
        </div>

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
      <div className="max-w-4xl w-full px-6 py-12 md:py-20 fade-in space-y-12">
        
        {/* Sign-in / Key Management Banner */}
        {!hasApiKey && (
          <div className="glass-panel rounded-3xl p-8 border border-white/10 bg-white/5 text-left space-y-6">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Enter the Multiverse</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Aetheria is powered by your own Google Gemini quota. Sign in to select an API key from your personal Google Cloud project. This ensures your stories are private and high-fidelity.
                </p>
                <div className="flex gap-4">
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="inline-block text-[10px] font-black uppercase text-purple-400 hover:text-purple-300 tracking-widest border-b border-purple-500/30 pb-0.5 mt-2">
                    Setup Guide
                  </a>
                  <button onClick={onConnectKey} className="inline-block text-[10px] font-black uppercase text-white hover:text-purple-300 tracking-widest border-b border-white/30 pb-0.5 mt-2">
                    Connect Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-bold">
            {error}
          </div>
        )}

        {/* Settings Area */}
        <section className="glass-panel rounded-3xl p-8 border border-white/5 space-y-8 text-left opacity-90">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
             </div>
             <h2 className="text-xl font-bold text-white tracking-tight">Voice Chronicle Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                placeholder={hasApiKey ? "Where shall your legend begin?" : "Connect your Google account to begin..."}
                value={startTheme}
                onChange={(e) => setStartTheme(e.target.value)}
                disabled={isLoading || isListening || !hasApiKey}
                className={`w-full bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl px-10 py-7 md:py-9 text-xl md:text-3xl focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-800 pr-24 shadow-2xl text-white font-light tracking-tight ${!hasApiKey ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <button 
                type="button"
                onClick={onMicClick}
                disabled={isListening || isLoading || !hasApiKey}
                className={`absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-2xl transition-all active:scale-90 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'text-gray-600 hover:text-purple-400 disabled:opacity-30'}`}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || isListening}
              className={`w-full px-12 py-6 rounded-3xl font-black text-xl uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 group/btn ${!hasApiKey ? 'bg-white text-black hover:bg-gray-200' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40'}`}
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing Reality...</span>
                </>
              ) : (
                <>
                  <span>{!hasApiKey ? 'Sign in with Google' : 'Begin Journey'}</span>
                  {!hasApiKey ? (
                    <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C20.187 1.44 17.4 0 12.48 0 5.827 0 0 5.28 0 12s5.827 12 12.48 12c3.547 0 6.227-1.16 8.32-3.347 2.147-2.147 2.827-5.187 2.827-7.587 0-.747-.067-1.493-.187-2.147H12.48z"/></svg>
                  ) : (
                    <svg className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                  )}
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
                onClick={() => {
                  setStartTheme(preset);
                  if (hasApiKey) onStart(preset);
                }}
                disabled={isLoading || isListening}
                className={`group relative p-8 text-left rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-purple-500/30 transition-all text-sm text-gray-500 hover:text-white overflow-hidden shadow-lg active:scale-95 ${!hasApiKey ? 'cursor-help' : ''}`}
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
            Aetheria v3.1 • Neural Story Engine
          </p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-gray-600 font-black">
            Powered by Gemini • BYO Key Protocol
          </p>
        </footer>
      </div>
    </div>
  );
};
