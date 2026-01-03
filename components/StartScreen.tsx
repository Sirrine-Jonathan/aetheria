
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

const VOICES = ['Charon', 'Puck', 'Kore', 'Fenrir', 'Zephyr'];

export const StartScreen: React.FC<StartScreenProps> = ({ 
  onStart, isLoading, isListening, onMicClick, startTheme, setStartTheme, 
  selectedVoice, setSelectedVoice, speechSpeed, setSpeechSpeed, 
  onPreviewVoice, isSpeaking, hasApiKey, onConnectKey, error
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startTheme.trim()) onStart(startTheme);
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#050505] text-center overflow-y-auto pt-0 pb-20">
      
      {/* Cinematic Hero */}
      <header className="relative w-full h-[45vh] md:h-[55vh] flex-shrink-0 overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
          alt="Aetheria Weaver" 
          className="w-full h-full object-cover transition-transform duration-[40s] group-hover:scale-110 opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        
        <div className="absolute bottom-12 left-0 w-full flex flex-col items-center space-y-4 px-6">
          <h1 className="serif text-6xl md:text-9xl font-bold bg-gradient-to-br from-white via-purple-100 to-indigo-300 bg-clip-text text-transparent tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
            Aetheria
          </h1>
          <p className="text-gray-400 uppercase tracking-[0.5em] text-[10px] md:text-xs font-black opacity-60">
            Infinite AI-Driven Chronicles
          </p>
        </div>
      </header>

      <div className="max-w-4xl w-full px-6 py-12 md:py-20 fade-in space-y-12">
        
        {/* API Key / Setup Info */}
        {!hasApiKey && (
          <div className="p-8 bg-purple-500/10 border border-purple-500/20 rounded-[2.5rem] text-left space-y-4 max-w-2xl mx-auto backdrop-blur-xl">
            <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              Reality Weaver Connection Required
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              To weave these high-fidelity chronicles and illustrate your journey, connect to the Google Gemini API. Ensure your project has billing enabled for best performance.
            </p>
            <button 
              onClick={onConnectKey}
              className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-bold text-xs uppercase tracking-widest hover:bg-purple-100 transition-all active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.32-2.12 4.52-1.2 1.2-3.04 2.16-5.72 2.16-4.6 0-8.36-3.72-8.36-8.32s3.76-8.32 8.36-8.32c2.48 0 4.28.96 5.64 2.24l2.32-2.32C18.44 2.08 15.68 1 12.48 1 6.12 1 1 6.12 1 12.48S6.12 24 12.48 24c3.44 0 6.08-1.12 8.12-3.24 2.08-2.08 2.72-5.04 2.72-7.36 0-.72-.04-1.4-.16-2.08H12.48z"/></svg>
              Connect Google Account
            </button>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="block text-[10px] text-gray-600 hover:text-purple-400 underline uppercase tracking-tighter">Billing Documentation</a>
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-3xl text-red-400 text-sm font-medium leading-relaxed max-w-xl mx-auto">
            {error}
          </div>
        )}

        {/* Narrative Input */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto group">
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
                className={`absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-2xl transition-all active:scale-90 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'text-gray-600 hover:text-purple-400 disabled:opacity-30'}`}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || isListening || !startTheme.trim()}
              className="w-full px-12 py-6 rounded-3xl font-black text-xl uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 group/btn bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40 disabled:opacity-50 disabled:bg-gray-800 disabled:shadow-none"
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

        {/* Customization Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto pt-8">
          {/* Voice Selector */}
          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block text-left ml-2">Guardian Voice</label>
            <div className="flex gap-2">
              <select 
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
              >
                {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <button 
                onClick={onPreviewVoice}
                disabled={isSpeaking}
                className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors disabled:opacity-30"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              </button>
            </div>
          </div>

          {/* Speed Slider */}
          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block text-left ml-2">Speech Pace ({speechSpeed}x)</label>
            <input 
              type="range" 
              min="0.5" 
              max="2.0" 
              step="0.1" 
              value={speechSpeed} 
              onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        {/* Destiny Presets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-12">
          {PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => {
                setStartTheme(preset);
                onStart(preset);
              }}
              disabled={isLoading || isListening}
              className="group relative p-8 text-left rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-purple-500/30 transition-all text-sm text-gray-500 hover:text-white overflow-hidden shadow-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <div className="absolute top-0 left-0 w-1.5 h-0 bg-purple-500 group-hover:h-full transition-all duration-300" />
              <span className="block font-medium leading-relaxed italic">"{preset}"</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
