
import React from 'react';
import { Scene, Choice } from '../types';

interface StoryDisplayProps {
  scene: Scene;
  onChoice: (choice: Choice) => void;
  isGenerating: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  error: string | null;
  onMicClick: () => void;
  onSpeakClick: () => void;
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ 
  scene, onChoice, isGenerating, isSpeaking, isListening, error, onMicClick, onSpeakClick 
}) => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-12 fade-in relative">
      
      {/* Visual Header */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group">
        <img 
          src={scene.imageUrl} 
          alt={scene.title}
          className={`w-full h-full object-cover transition-transform duration-[20s] ease-linear hover:scale-110 ${isGenerating || isSpeaking ? 'brightness-75' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />
        
        {/* Floating Controls */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button 
            onClick={onSpeakClick}
            disabled={isSpeaking || isGenerating}
            className={`p-3 rounded-full backdrop-blur-md border border-white/20 transition-all ${isSpeaking ? 'bg-purple-500 animate-pulse' : 'bg-white/10 hover:bg-white/20'}`}
            title="Read scene"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
          </button>
          <button 
            onClick={onMicClick}
            disabled={isListening || isGenerating}
            className={`p-3 rounded-full backdrop-blur-md border border-white/20 transition-all ${isListening ? 'bg-red-500 animate-pulse scale-110 shadow-lg shadow-red-500/50' : 'bg-white/10 hover:bg-white/20'}`}
            title="Voice Command"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
          </button>
        </div>
        
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 backdrop-blur-sm">
            <div className="text-white font-bold text-2xl animate-pulse flex flex-col items-center">
              <span>Listening...</span>
              <span className="text-sm font-light mt-2 opacity-70">Say your choice aloud</span>
            </div>
          </div>
        )}
      </div>

      {/* Narrative Section */}
      <div className="space-y-6">
        <h1 className={`serif text-4xl md:text-5xl font-bold leading-tight transition-all ${isSpeaking ? 'text-purple-400' : ''}`}>
          {scene.title}
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-purple-500">
          {scene.description}
        </p>
      </div>

      {/* Choices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
        {scene.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => onChoice(choice)}
            disabled={isGenerating || isListening}
            className="group relative flex items-center p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-purple-500/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="mr-4 flex-shrink-0 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs text-gray-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              ➔
            </div>
            <span className="text-lg font-medium text-gray-200 group-hover:text-white">
              {choice.text}
            </span>
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-purple-500 transition-all group-hover:w-full" />
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm animate-bounce">
          {error}
        </div>
      )}

      {/* Footer Decoration */}
      <div className="pt-20 pb-10 flex justify-center">
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      </div>
    </div>
  );
};
