import React from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function VoiceButton({ isListening, onClick, disabled = false }: VoiceButtonProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Tap Mic Pulsing Ripple Wrapper */}
      <div className="relative flex items-center justify-center">
        {isListening && (
          <>
            {/* Pulsating Ring 1 */}
            <motion.div 
              className="absolute w-28 h-28 bg-red-400/20 dark:bg-red-500/20 rounded-full"
              animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
            {/* Pulsating Ring 2 */}
            <motion.div 
              className="absolute w-24 h-24 bg-red-400/30 dark:bg-red-500/30 rounded-full"
              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.3 }}
            />
          </>
        )}

        <motion.button
          id="tactile-voice-mic-trigger"
          whileHover={disabled ? {} : { scale: 1.05 }}
          whileTap={disabled ? {} : { scale: 0.95 }}
          onClick={onClick}
          disabled={disabled}
          className={`relative z-10 w-20 h-20 rounded-full shadow-lg flex items-center justify-center border-2 border-white cursor-pointer transition-all ${
            isListening 
              ? 'bg-rose-600 text-white shadow-rose-600/30' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
          } ${disabled ? 'opacity-55 cursor-not-allowed' : ''}`}
        >
          {isListening ? (
            <MicOff className="w-9 h-9 animate-bounce" />
          ) : (
            <Mic className="w-9 h-9" />
          )}
        </motion.button>
      </div>

      <span className="text-xs font-black uppercase tracking-widest text-slate-500 text-center select-none">
        {isListening ? 'Listening... Speak now' : 'Tap here to talk'}
      </span>
    </div>
  );
}
