import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../contexts/AppContext.js';
import { voiceService } from '../services/voiceService.js';
import { profileService } from '../services/profileService.js';
import { Mic, MicOff, X, Sparkles, Send, Volume2, User, Bot, Maximize2, RefreshCw } from 'lucide-react';

export default function VoiceAssistant() {
  const { t, language, token } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [query, setQuery] = useState('');
  const [workerName, setWorkerName] = useState('Worker');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'assistant'; text: string }[]>([]);

  // Load name for greeting
  useEffect(() => {
    async function loadName() {
      if (!token) return;
      try {
        const data = await profileService.getProfile(token);
        if (data && data.name) {
          setWorkerName(data.name);
        }
      } catch (err) {}
    }
    loadName();
  }, [token]);

  // Welcome greeting inside the drawer
  useEffect(() => {
    if (isOpen && chatHistory.length === 0) {
      const welcome = language === 'ta' 
        ? `வணக்கம் ${workerName}! நான் துன். உங்களுக்கு இன்று எவ்வாறு உதவட்டும்?` 
        : language === 'hi'
          ? `नमस्ते ${workerName}! मैं आपकी थुन एआई हूँ। मैं आपकी क्या मदद करूँ?`
          : `Vanakkam ${workerName}! I am ThunAI. How can I assist you with Tamil Nadu government schemes or your document vault today?`;
      
      setChatHistory([{ sender: 'assistant', text: welcome }]);
      speakText(welcome);
    }
  }, [isOpen]);

  const speakText = (text: string) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (language === 'ta') utterance.lang = 'ta-IN';
      else if (language === 'hi') utterance.lang = 'hi-IN';
      else utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const handleStartListening = () => {
    setIsListening(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Simulator Fallback
      setTimeout(() => {
        setIsListening(false);
        const simQuery = language === 'ta' ? 'திட்டங்கள் காட்டு' : language === 'hi' ? 'योजनाएं' : 'Show benefits';
        setQuery(simQuery);
        triggerQuerySubmit(simQuery);
      }, 2000);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onresult = async (event: any) => {
        const spoken = event.results[0][0].transcript;
        setQuery(spoken);
        setIsListening(false);
        triggerQuerySubmit(spoken);
      };

      rec.onerror = () => {
        setIsListening(false);
        // Simulator Fallback
        const simQuery = language === 'ta' ? 'திட்டங்கள் காட்டு' : language === 'hi' ? 'योजनाएं' : 'Show benefits';
        setQuery(simQuery);
        triggerQuerySubmit(simQuery);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    triggerQuerySubmit(query);
  };

  const triggerQuerySubmit = async (textToSend: string) => {
    setChatHistory(prev => [...prev, { sender: 'user', text: textToSend }]);
    setQuery('');

    if (!token) return;

    try {
      const result = await voiceService.processVoiceCommand(token, textToSend, language);
      
      if (result.success) {
        setChatHistory(prev => [...prev, { sender: 'assistant', text: result.responseSpeechText }]);
        speakText(result.responseSpeechText);

        // Auto redirect if matched
        if (result.targetRoute && result.matchedCommand !== 'Unknown') {
          setTimeout(() => {
            setIsOpen(false);
            navigate(result.targetRoute);
          }, 3000);
        }
      } else {
        const failMsg = "Sorry, I couldn't reach the server right now.";
        setChatHistory(prev => [...prev, { sender: 'assistant', text: failMsg }]);
        speakText(failMsg);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenImmersive = () => {
    setIsOpen(false);
    navigate('/voice-assistant');
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <motion.button
        id="voice-assistant-fab"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center gap-2 cursor-pointer border-2 border-white"
      >
        <Mic className="w-6 h-6" />
        <span className="hidden md:inline-block text-xs font-bold uppercase tracking-wider pr-1">ThunAI Voice</span>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-sky-300 border-2 border-white rounded-full"></span>
      </motion.button>

      {/* Slide-Up Panel / Backdrop Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900 z-50 transition-opacity"
            />

            {/* Assistant Drawer Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 md:inset-x-auto md:right-6 md:w-96 bg-white border-t md:border border-sky-200 rounded-t-3xl md:rounded-3xl shadow-2xl z-50 flex flex-col max-h-[85vh] md:max-h-[600px] overflow-hidden"
            >
              {/* Panel Header */}
              <div className="p-4 border-b border-sky-150 flex items-center justify-between bg-sky-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-600 text-white rounded-xl shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-blue-950">ThunAI</h3>
                    <div className="text-[10px] text-blue-700 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                      Active Voice Support
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleOpenImmersive}
                    title="Open Fullscreen Immersive Assistant"
                    className="p-1.5 hover:bg-sky-100 rounded-full text-slate-500 cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-sky-100 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Log Window */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[250px] bg-[#f0f6fc]/50">
                {chatHistory.map((chat, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${chat.sender === 'user' ? 'justify-end' : ''}`}
                  >
                    {chat.sender === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-sky-100 text-blue-700 flex items-center justify-center shrink-0 border border-sky-200">
                        <Bot className="w-4.5 h-4.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                        chat.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-xs'
                          : 'bg-white border border-sky-150 text-slate-800 rounded-tl-none shadow-xs'
                      }`}
                    >
                      {chat.text}
                      {chat.sender === 'assistant' && (
                        <button 
                          onClick={() => speakText(chat.text)}
                          className="block mt-2 text-blue-700 hover:text-blue-900 font-extrabold text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Speak Answer
                        </button>
                      )}
                    </div>
                    {chat.sender === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-sky-100 text-blue-700 flex items-center justify-center shrink-0">
                        <User className="w-4.5 h-4.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Speech activity panel */}
              {isListening && (
                <div className="px-4 py-3 bg-sky-50 border-t border-sky-200 flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-xs font-bold text-blue-700">
                    Listening... Speak now
                  </span>
                </div>
              )}

              {/* Input Action Form */}
              <div className="p-4 border-t border-sky-150 bg-white">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('voice_prompt_placeholder')}
                    className="flex-1 bg-sky-50/50 border border-sky-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-600 focus:bg-white font-semibold text-slate-900 placeholder:text-slate-400"
                  />
                  
                  {/* Speech Trigger Button */}
                  <button
                    type="button"
                    onClick={handleStartListening}
                    className={`p-2.5 rounded-xl border cursor-pointer ${
                      isListening
                        ? 'bg-rose-600 border-rose-600 text-white animate-pulse'
                        : 'bg-sky-50 border-sky-200 text-blue-700 hover:bg-sky-100'
                    }`}
                    title="Speak in your native language"
                  >
                    {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shrink-0 cursor-pointer shadow-xs"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </form>

                <div className="text-[10px] text-slate-500 text-center mt-2.5 font-bold">
                  Bilingual: English, தமிழ், हिन्दी. Redirection active.
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
