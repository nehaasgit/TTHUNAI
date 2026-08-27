import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext.js';
import { voiceService } from '../services/voiceService.js';
import { profileService } from '../services/profileService.js';
import VoiceButton from '../components/VoiceButton.js';
import VoiceTranscript from '../components/VoiceTranscript.js';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowLeft, 
  Bot, 
  History, 
  Volume2, 
  VolumeX, 
  Mic, 
  ChevronRight, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { VoiceHistory } from '../../shared/types.js';

export default function VoiceAssistantPage() {
  const { user, token, language } = useApp();
  const navigate = useNavigate();

  // Voice Interaction States
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState<VoiceHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [workerName, setWorkerName] = useState('Worker');

  // Greet the user on mount
  useEffect(() => {
    async function loadWorkerProfile() {
      if (!token) return;
      try {
        const data = await profileService.getProfile(token);
        if (data && data.name) {
          setWorkerName(data.name);
          greetUser(data.name);
        } else if (user && user.name) {
          setWorkerName(user.name);
          greetUser(user.name);
        } else {
          greetUser('Worker');
        }
      } catch (err) {
        greetUser('Worker');
      }
    }
    loadWorkerProfile();
    loadVoiceHistory();
  }, [token]);

  const loadVoiceHistory = async () => {
    if (!token) return;
    try {
      const logs = await voiceService.getVoiceHistory(token);
      setHistory(logs);
    } catch (err) {
      console.error('Failed to load voice history logs:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const greetUser = (name: string) => {
    let greetText = `Hello ${name}. I am your ThunAI voice assistant. How can I help you today?`;
    if (language === 'ta') {
      greetText = `வணக்கம் ${name}. நான் உங்கள் துன் குரல் உதவியாளர். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?`;
    } else if (language === 'hi') {
      greetText = `नमस्ते ${name}। मैं आपकी थुन वॉयस असिस्टेंट हूँ। आज मैं आपकी क्या मदद कर सकती हूँ?`;
    }
    setResponse(greetText);
    speakUtterance(greetText);
  };

  const speakUtterance = (text: string) => {
    if (!ttsEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (language === 'ta') utterance.lang = 'ta-IN';
      else if (language === 'hi') utterance.lang = 'hi-IN';
      else utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS blocked or unsupported:', e);
    }
  };

  // Start Mic Listening
  const handleMicTrigger = () => {
    setTranscript('');
    setResponse('');
    setIsListening(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Simulate Speech STT
      setTimeout(() => {
        setIsListening(false);
        simulateSpokenInput();
      }, 2500);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onresult = async (event: any) => {
        const textSpoken = event.results[0][0].transcript;
        setTranscript(textSpoken);
        await submitTranscriptToBackend(textSpoken);
      };

      rec.onerror = (e: any) => {
        console.warn('Speech recognition warning/status:', e.error);
        setIsListening(false);
        if (e.error === 'not-allowed') {
          setResponse('Microphone access is not allowed or blocked. Please enable mic permissions or use the sandbox simulations.');
        } else if (e.error === 'no-speech') {
          setResponse('No speech was detected. Please try speaking again or click to simulate.');
        } else if (e.error === 'aborted') {
          // Just a standard cancel/abort
          simulateSpokenInput();
        } else {
          simulateSpokenInput();
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
    } catch (e) {
      console.error('Failed speech engine:', e);
      setIsListening(false);
      simulateSpokenInput();
    }
  };

  // Safe sandbox simulator fallback
  const simulateSpokenInput = async () => {
    const phrases = {
      en: ['Show benefits', 'My documents', 'Nearest hospital', 'Translate', 'My profile', 'Emergency help'],
      ta: ['திட்டங்கள் காட்டு', 'எனது ஆவணங்கள்', 'மருத்துவமனை', 'மொழியை மாற்று', 'எனது சுயவிவரம்', 'அவசர உதவி'],
      hi: ['योजनाएं दिखाएं', 'मेरे दस्तावेज़', 'अस्पताल', 'भाषा बदलो', 'मेरी प्रोफ़ाइल', 'आपातकालीन सहायता']
    };

    const currentPhrases = phrases[language] || phrases.en;
    const randomPhrase = currentPhrases[Math.floor(Math.random() * currentPhrases.length)];
    
    setTranscript(randomPhrase);
    await submitTranscriptToBackend(randomPhrase);
  };

  const submitTranscriptToBackend = async (spokenText: string) => {
    if (!token) return;
    try {
      const result = await voiceService.processVoiceCommand(token, spokenText, language);
      
      if (result.success) {
        setResponse(result.responseSpeechText);
        speakUtterance(result.responseSpeechText);
        
        // Refresh logging history list
        loadVoiceHistory();

        // If a matching route exists, announce navigation and redirect after 3 seconds
        if (result.targetRoute && result.matchedCommand !== 'Unknown') {
          setTimeout(() => {
            navigate(result.targetRoute);
          }, 3200);
        }
      } else {
        const failText = "Sorry, I couldn't connect to ThunAI database. Try again.";
        setResponse(failText);
        speakUtterance(failText);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Repeat a history log answer aloud
  const handleRepeatLog = (text: string) => {
    speakUtterance(text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              ThunAI Voice Companion
            </h2>
            <p className="text-[10px] text-green-600 font-extrabold uppercase tracking-wider">Multilingual Assistant</p>
          </div>
        </div>

        {/* Local TTS Toggle */}
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
            ttsEnabled 
              ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900' 
              : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
          }`}
        >
          {ttsEnabled ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">Sound On</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Interactive Panel: Microphone + Transcript (Vocal Core) */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-xl">
          <div className="text-center space-y-2">
            <h3 className="font-extrabold text-sm text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Talk to ThunAI
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
              Click the large microphone button and ask any question about your documents, labor cards, or government schemes.
            </p>
          </div>

          {/* Large tactile animated Voice button */}
          <VoiceButton isListening={isListening} onClick={handleMicTrigger} />

          {/* Dialog bubble layer */}
          <VoiceTranscript 
            transcript={transcript} 
            response={response} 
            isListening={isListening} 
            language={language}
          />
        </div>

        {/* Right Panel: Voice Command History Logs */}
        <div className="md:col-span-5 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <History className="w-4.5 h-4.5 text-blue-500" />
              <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-widest">Voice Command Logs</h3>
            </div>

            {loadingHistory ? (
              <div className="text-center py-6 text-slate-400 text-xs font-bold">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1.5 text-blue-500" />
                Loading voice logs...
              </div>
            ) : history && history.length > 0 ? (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {history.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850 space-y-1.5 hover:border-blue-400/50 transition-all text-xs font-semibold"
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                        {log.detectedCommand}
                      </span>
                      <span className="text-[8px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-slate-800 dark:text-slate-250 italic">
                      " {log.transcript} "
                    </p>

                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold border-t border-slate-200 dark:border-slate-850 pt-1.5 flex items-center justify-between">
                      <span className="truncate pr-4">{log.responseSpeechText}</span>
                      <button 
                        onClick={() => handleRepeatLog(log.responseSpeechText)}
                        className="text-blue-500 hover:underline shrink-0 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" /> Speak
                      </button>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs italic font-medium">
                No spoken voice histories recorded yet. Tap the microphone to start!
              </div>
            )}
          </div>

          {/* Multilingual instructions note card */}
          <div className="bg-gradient-to-tr from-slate-50 to-blue-50/25 dark:from-slate-900 dark:to-blue-950/5 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 flex gap-3 items-start">
            <span className="text-2xl">💡</span>
            <div className="space-y-1 text-xs">
              <h4 className="font-extrabold text-slate-800 dark:text-slate-100">Intelligent Routing</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                The voice companion matches spoken keywords and will guide you straight to the matching page. Give it a try!
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
