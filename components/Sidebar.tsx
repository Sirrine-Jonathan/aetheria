
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
    <aside className="w-[300px] md:w-80 h-full border-r border-white/10 bg-[#050505] flex flex-col shadow-2xl z-50">
      {/* Header */}
      <div className="p-8 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]">
        <h2 className="serif text-3xl font-bold text-purple-400 tracking-tight">Aetheria</h2>
        <button onClick={onCloseMobile} className="md:hidden text-white text-2xl">✕</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-[#0a0a0a]">
        <button 
          onClick={() => setActiveTab('status')}
          className={`flex-1 py-4 text-[11px] uppercase tracking-widest font-black transition-colors ${activeTab === 'status' ? 'text-purple-400 border-b-2 border-purple-500 bg-white/5' : 'text-gray-500'}`}
        >
          Adventurer
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-4 text-[11px] uppercase tracking-widest font-black transition-colors ${activeTab === 'history' ? 'text-purple-400 border-b-2 border-purple-500 bg-white/5' : 'text-gray-500'}`}
        >
          Chronicle
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'status' ? (
          <div className="p-8 space-y-10 animate-fadeIn">
            {/* Vitality */}
            <section className="space-y-4">
              <div className="flex justify-between text-[11px] uppercase font-black tracking-widest text-gray-300">
                <span>Vitality</span>
                <span className="text-white">{character.health}/{character.maxHealth}</span>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                  style={{ width: `${(character.health / character.maxHealth) * 100}%` }}
                />
              </div>
            </section>

            {/* Sanity */}
            <section className="space-y-4">
              <div className="flex justify-between text-[11px] uppercase font-black tracking-widest text-gray-300">
                <span>Sanity</span>
                <span className="text-white">{character.sanity}%</span>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                  style={{ width: `${character.sanity}%` }}
                />
              </div>
            </section>

            {/* Inventory */}
            <section className="space-y-5">
              <h3 className="text-[11px] uppercase font-black tracking-widest text-gray-500">Inventory</h3>
              {character.inventory.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-3xl">
                  <span className="text-sm text-gray-600 font-medium">Empty Backpack</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {character.inventory.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl group transition-all hover:bg-white/[0.08]">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                      <span className="text-sm text-gray-100 font-bold">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="p-6 space-y-4 animate-fadeIn">
            <button 
              onClick={() => onSelectHistory(null)}
              className={`w-full p-5 rounded-2xl border transition-all text-left ${viewingIndex === null ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`}
            >
              <span className="text-[10px] font-black uppercase block mb-1 opacity-60">Active Journey</span>
              <h3 className="text-sm font-bold truncate">{currentScene?.title}</h3>
            </button>

            {history.slice().reverse().map((step, revIdx) => {
              const actualIdx = history.length - 1 - revIdx;
              return (
                <button 
                  key={step.id} 
                  onClick={() => onSelectHistory(actualIdx)}
                  className={`w-full p-5 rounded-2xl border transition-all text-left ${viewingIndex === actualIdx ? 'bg-amber-600/20 border-amber-500 text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`}
                >
                  <span className="text-[10px] font-black uppercase block mb-1 opacity-60">Log {actualIdx + 1}</span>
                  <h3 className="text-sm font-bold truncate">{step.title}</h3>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-8 space-y-5 border-t border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-300 uppercase tracking-widest font-black">Narration</span>
          <button onClick={onToggleDictate} className={`w-12 h-6 rounded-full transition-all relative p-1 ${autoDictate ? 'bg-purple-600' : 'bg-gray-800'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-all ${autoDictate ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-300 uppercase tracking-widest font-black">Speech-to-Action</span>
          <button onClick={onToggleListen} className={`w-12 h-6 rounded-full transition-all relative p-1 ${autoListen ? 'bg-indigo-600' : 'bg-gray-800'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-all ${autoListen ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
        <button onClick={onReset} className="w-full py-4 text-[11px] uppercase font-black tracking-[0.2em] text-gray-500 hover:text-red-400 transition-colors mt-4">
          Sever Connection
        </button>
      </div>
    </aside>
  );
};
