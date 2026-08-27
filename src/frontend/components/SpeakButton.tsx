import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Square } from 'lucide-react';
import { useApp } from '../contexts/AppContext.js';
import { ttsService } from '../services/ttsService.js';

interface SpeakButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SpeakButton({ text, className = '', size = 'md' }: SpeakButtonProps) {
  const { language } = useApp();
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        ttsService.stop();
      }
    };
  }, [isSpeaking]);

  const handleToggleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering any parent element clicks
    
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      // Speak the text content
      const success = await ttsService.speak(text, language);
      setIsSpeaking(false);
    }
  };

  const sizeClasses = {
    sm: 'p-2 rounded-lg text-xs gap-1',
    md: 'p-3 rounded-xl text-sm gap-1.5',
    lg: 'p-4 rounded-2xl text-base gap-2 font-bold'
  };

  return (
    <button
      onClick={handleToggleSpeak}
      type="button"
      className={`inline-flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer ${
        isSpeaking
          ? 'bg-blue-600 hover:bg-blue-700 text-white animate-pulse'
          : 'bg-sky-50 hover:bg-sky-100 text-blue-700 font-bold'
      } border border-sky-200 ${sizeClasses[size]} ${className}`}
      title={isSpeaking ? "Stop Speaking" : "Read Content Aloud"}
    >
      {isSpeaking ? (
        <>
          <Square className="w-4.5 h-4.5 fill-current" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4.5 h-4.5" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Listen</span>
        </>
      )}
    </button>
  );
}
