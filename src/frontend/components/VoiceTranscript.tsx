import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Volume2, HelpCircle, Bot, User } from 'lucide-react';

interface VoiceTranscriptProps {
  transcript: string;
  response: string;
  isListening: boolean;
  language: 'en' | 'ta' | 'hi';
}

export default function VoiceTranscript({ transcript, response, isListening, language }: VoiceTranscriptProps) {
  // Helper to render responsive sine bars
  const renderWaveform = () => {
    return (
      <div className="flex items-center justify-center gap-1.5 h-10 w-full px-12">
        {[...Array(15)].map((_, i) => {
          const delays = [0.1, 0.3, 0.5, 0.2, 0.4, 0.6, 0.1, 0.7, 0.3, 0.5, 0.2, 0.4, 0.8, 0.1, 0.3];
          const heights = [16, 24, 36, 12, 32, 40, 16, 44, 24, 36, 20, 28, 48, 12, 24];
          return (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-blue-600"
              animate={{ 
                height: isListening ? [8, heights[i], 8] : 6
              }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeInOut",
                delay: delays[i]
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Waveform indicator */}
      {isListening && (
        <div className="bg-sky-50 rounded-2xl py-5 border border-sky-200 flex flex-col items-center justify-center space-y-3">
          {renderWaveform()}
          <p className="text-[10px] uppercase font-bold tracking-widest text-blue-700 animate-pulse">
            Listening for {language === 'ta' ? 'தமிழ்' : language === 'hi' ? 'हिन्दी' : 'English'} voice commands...
          </p>
        </div>
      )}

      {/* Transcript bubbles */}
      {(transcript || response) && (
        <div className="space-y-4 pt-2">
          {/* User query speech balloon */}
          {transcript && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start justify-end gap-2.5"
            >
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-3.5 shadow-xs max-w-[85%] text-xs font-bold leading-relaxed">
                <span className="block text-[8px] text-sky-200 uppercase font-extrabold tracking-wider mb-1">What you said</span>
                {transcript}
              </div>
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-blue-700 flex items-center justify-center shrink-0">
                <User className="w-4.5 h-4.5" />
              </div>
            </motion.div>
          )}

          {/* Assistant Response speech balloon */}
          {response && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-start justify-start gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-blue-700 flex items-center justify-center shrink-0 border border-sky-200">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="bg-white border border-sky-150 text-slate-800 rounded-2xl rounded-tl-none p-3.5 shadow-xs max-w-[85%] text-xs font-bold leading-relaxed space-y-2">
                <span className="text-[8px] text-blue-700 uppercase font-extrabold tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> ThunAI Companion Response
                </span>
                
                <p className="text-slate-800">{response}</p>
                
                {/* Visual Audio Wave indicator */}
                <div className="bg-sky-50 rounded-lg p-2 flex items-center gap-2 border border-sky-200">
                  <span className="p-1 bg-sky-100 text-blue-700 rounded-md">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  </span>
                  <span className="text-[10px] text-blue-950 font-bold">Audio streaming is playing...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Suggestion tags helper */}
      {!transcript && !response && !isListening && (
        <div className="space-y-2 text-center py-4 bg-sky-50/60 rounded-2xl border border-dashed border-sky-200">
          <HelpCircle className="w-6 h-6 text-blue-600/60 mx-auto" />
          <h4 className="font-bold text-xs text-blue-950">Try saying:</h4>
          <div className="flex flex-wrap items-center justify-center gap-1.5 px-4 pt-1">
            {['"Show benefits"', '"My documents"', '"Translate"', '"Profile"'].map((phrase, idx) => (
              <span key={idx} className="bg-white border border-sky-200 text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-2xs">
                {phrase}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
