
import React, { useState, useEffect } from 'react';

const LOADING_TEXTS = [
  "Consulting the stars...",
  "Weaving threads of destiny...",
  "Painting the scene...",
  "Whispering to the ancient ones...",
  "Etching the future...",
  "Summoning the imagery..."
];

export const LoadingOverlay: React.FC = () => {
  const [text, setText] = useState(LOADING_TEXTS[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setText(LOADING_TEXTS[Math.floor(Math.random() * LOADING_TEXTS.length)]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-500">
      <div className="relative">
        {/* Spinner */}
        <div className="w-20 h-20 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-l-2 border-r-2 border-pink-500 rounded-full animate-spin-slow" />
        </div>
      </div>
      
      <p className="mt-8 serif text-2xl font-medium text-white/90 animate-pulse tracking-wide italic">
        {text}
      </p>

      <div className="absolute bottom-12 flex space-x-2">
        <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce delay-0" />
        <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce delay-150" />
        <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce delay-300" />
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
