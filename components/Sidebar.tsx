
import React, { useState } from 'react';
import { Scene, CharacterState } from '../types';

interface SidebarProps {
  history: Scene[];
  onReset: () => void;
  autoDictate: boolean;
  autoListen: boolean;
  onToggleDictate: () => void;
  onToggleListen: () => void;
  onCloseMobile?: () => void;
  character: CharacterState;
  currentScene: Scene | null;
  viewingIndex: number | null;
  onSelectHistory: (index: number | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  history, 
  onReset, 
  autoDictate, 
  autoListen, 
  onToggleDictate, 
  onToggleListen,
  onCloseMobile,
  character,
  currentScene,
  viewingIndex,
  onSelectHistory
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'history'>('status');

  return (
    <aside className="w-[300px] md:w-80 h-full border-r border-white/10 bg-[#0a0a0a] flex flex-col shadow-2xl z-50">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h2 className="serif text-2xl font-bold text-purple-400 tracking-tight">Aetheria</h2>
        <button onClick={onCloseMobile} className="md:hidden text-gray-500">✕</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button 
          onClick={() => setActiveTab('status')}
          className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors ${activeTab === 'status' ? 'text-purple-400 bg-white/5 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Adventurer
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors ${activeTab === 'history' ? 'text-purple-400 bg-white/5 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Chronicle
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'status' ? (
          <div className="p-6 space-y-8 animate-fadeIn">
            {/* Health */}
            <section className="space-y-3">
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter text-gray-400">
                <span>Vitality</span>
                <span>{character.health}/{character.maxHealth}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-1000"
                  style={{ width: `${(character.health / character.maxHealth) * 100}%` }}
                />
              </div>
            </section>

            {/* Sanity */}
            <section className="space-y-3">
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter text-gray-400">
                <span>Sanity</span>
                <span>{character.sanity}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000"
                  style={{ width: `${character.sanity}%` }}
                />
              </div>
            </section>

            {/* Inventory */}
            <section className="space-y-4">
              <h3 className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Backpack</h3>
              {character.inventory.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
                  <span className="text-xs text-gray-600 italic">Empty...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {character.inventory.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl group hover:border-purple-500/50 transition-all">
                      <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                      <span className="text-xs text-gray-300 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="p-4 space-y-4 animate-fadeIn">
            <button 
              onClick={() => onSelectHistory(null)}
              className={`w-full p-4 rounded-xl border transition-all text-left group ${viewingIndex === null ? 'bg-purple-900/20 border-purple-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
            >
              <span className="text-[9px] text-purple-500 font-black uppercase block mb-1">Active Scene</span>
              <h3 className="text-xs font-bold text-gray-200 truncate">{currentScene?.title}</h3>
            </button>

            {history.length > 0 && (
              <div className="h-px bg-white/5 my-2" />
            )}

            {history.slice().reverse().map((step, revIdx) => {
              const actualIdx = history.length - 1 - revIdx;
              return (
                <button 
                  key={step.id} 
                  onClick={() => onSelectHistory(actualIdx)}
                  className={`w-full p-4 rounded-xl border transition-all text-left group ${viewingIndex === actualIdx ? 'bg-amber-900/20 border-amber-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                >
                  <span className="text-[9px] text-gray-500 font-black uppercase block mb-1 group-hover:text-amber-500 transition-colors">Log {actualIdx + 1}</span>
                  <h3 className="text-xs font-bold text-gray-200 truncate">{step.title}</h3>
                  <p className="text-[10px] text-gray-500 line-clamp-1 mt-1 leading-relaxed italic">"{step.description.substring(0, 40)}..."</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Settings / Controls */}
      <div className="p-6 space-y-4 border-t border-white/10 bg-black/40">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Dictate</span>
          <button onClick={onToggleDictate} className={`w-10 h-5 rounded-full transition-all relative ${autoDictate ? 'bg-purple-600' : 'bg-gray-700'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoDictate ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Listen</span>
          <button onClick={onToggleListen} className={`w-10 h-5 rounded-full transition-all relative ${autoListen ? 'bg-indigo-600' : 'bg-gray-700'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoListen ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
        <button onClick={onReset} className="w-full py-2 text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 hover:text-red-400 border border-white/5 rounded-lg hover:bg-red-950/20 transition-all mt-2">
          End Chronicle
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </aside>
  );
};
