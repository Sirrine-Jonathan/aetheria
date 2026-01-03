
import React from 'react';
import { Scene } from '../types';

interface SidebarProps {
  history: Scene[];
  onReset: () => void;
  autoDictate: boolean;
  autoListen: boolean;
  onToggleDictate: () => void;
  onToggleListen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  history, 
  onReset, 
  autoDictate, 
  autoListen, 
  onToggleDictate, 
  onToggleListen 
}) => {
  return (
    <aside className="w-full md:w-80 h-full border-r border-white/10 bg-[#0a0a0a] flex flex-col">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h2 className="serif text-2xl font-bold text-purple-400">Chronicle</h2>
        <button 
          onClick={onReset}
          className="text-xs uppercase tracking-widest text-gray-500 hover:text-red-400 transition-colors"
        >
          New Game
        </button>
      </div>

      <div className="p-4 space-y-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Auto-Dictate</span>
          <button 
            onClick={onToggleDictate}
            className={`w-10 h-5 rounded-full transition-colors relative ${autoDictate ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoDictate ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Auto-Listen</span>
          <button 
            onClick={onToggleListen}
            className={`w-10 h-5 rounded-full transition-colors relative ${autoListen ? 'bg-indigo-600' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoListen ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 ? (
          <p className="text-gray-600 italic text-center py-8">Your story begins here...</p>
        ) : (
          history.map((step, i) => (
            <div key={step.id} className="p-3 bg-white/5 rounded-lg border border-white/5 group">
              <span className="text-[10px] text-purple-500 font-bold uppercase block mb-1">Step {i + 1}</span>
              <h3 className="text-sm font-semibold text-gray-300 truncate">{step.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mt-1">{step.description}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-gradient-to-t from-purple-900/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-400 uppercase tracking-tighter">Gemini Core Active</span>
        </div>
      </div>
    </aside>
  );
};
