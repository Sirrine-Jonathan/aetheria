
import React, { useState } from 'react';

interface StartScreenProps {
  onStart: (theme: string) => void;
  isLoading: boolean;
}

const PRESETS = [
  "A cyberpunk detective in a neon-soaked rain city",
  "A lost explorer in an ancient sunken civilization",
  "A rogue wizard in a floating academy of magic",
  "A space scavenger on a derelict gothic freighter",
  "A mystical samurai in a forest of shifting seasons"
];

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, isLoading }) => {
  const [customTheme, setCustomTheme] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTheme.trim()) onStart(customTheme);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-6 py-12 bg-[#050505] text-center">
      <div className="max-w-3xl w-full fade-in space-y-8">
        <h1 className="serif text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 bg-clip-text text-transparent">
          Aetheria
        </h1>
        <p className="text-xl text-gray-400 max-w-xl mx-auto">
          An infinite interactive adventure illustrated by artificial intelligence. Where will your path lead?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Describe your story universe..."
            value={customTheme}
            onChange={(e) => setCustomTheme(e.target.value)}
            disabled={isLoading}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !customTheme.trim()}
            className="w-full md:w-auto px-12 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 rounded-xl font-bold text-lg shadow-xl shadow-purple-900/20 transition-all active:scale-95"
          >
            {isLoading ? "Consulting the Fates..." : "Begin Journey"}
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-8">
          {PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => onStart(preset)}
              disabled={isLoading}
              className="glass-panel p-4 text-left rounded-xl hover:bg-white/10 transition-colors text-sm text-gray-400 hover:text-white"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
