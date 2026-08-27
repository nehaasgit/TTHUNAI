import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../contexts/AppContext.js';
import SpeakButton from '../components/SpeakButton.js';
import { 
  Sparkles, 
  Mic, 
  MicOff,
  Volume2, 
  VolumeX, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Heart, 
  RotateCcw, 
  Loader2, 
  Check, 
  FileText, 
  ExternalLink, 
  BookOpenCheck,
  UserCheck,
  Award,
  Bookmark,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { GovernmentScheme, Language } from '../../shared/types.js';
import { getLocalizedScheme } from '../utils/schemeTranslations.js';

// Types for personalized recommendations
interface PersonalizedRecommendation {
  scheme: GovernmentScheme;
  matchScore: number;
  relevanceReasonEn: string;
  relevanceReasonTa: string;
  relevanceReasonHi: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface QuestionNode {
  id: string;
  textEn: string;
  textTa: string;
  textHi: string;
  options: Array<{
    value: string;
    labelEn: string;
    labelTa: string;
    labelHi: string;
  }>;
}

export default function BenefitsDiscovery() {
  const { user, token, language, t, documents } = useApp();
  
  // App navigation & states
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'questions' | 'processing' | 'results' | 'favorites'>('welcome');
  
  // Questions states
  const [questions, setQuestions] = useState<QuestionNode[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Results & AI states
  const [eligibility, setEligibility] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [aiReasoning, setAiReasoning] = useState<string>('');
  const [suggestedSteps, setSuggestedSteps] = useState<string[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<PersonalizedRecommendation | null>(null);
  const [activeTab, setActiveTab] = useState<'explanation' | 'documents' | 'steps'>('explanation');
  
  // Bookmarks state
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([]);
  
  // Speech & Voice Synthesis states
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetchQuestions();
    fetchSavedSchemes();
    fetchExistingEligibility();
  }, [token]);

  // Speech output when questions or screen changes
  useEffect(() => {
    if (currentScreen === 'questions' && questions.length > 0) {
      speakCurrentQuestion();
    } else if (currentScreen === 'welcome') {
      speakText("Welcome to ThunAI Rights Discovery. I will help you find government benefits tailored to your work. Choose continue to start.", "Welcome to ThunAI Rights Discovery. I will help you find government benefits tailored to your work. Choose continue to start.", "थुनएआई अधिकार खोज में आपका स्वागत है। मैं आपके काम के अनुसार सरकारी लाभ ढूंढने में आपकी मदद करूंगी। शुरू करने के लिए आगे बढ़ें चुनें।");
    } else if (currentScreen === 'processing') {
      speakText("ThunAI is scanning your credentials and checking welfare regulations in Tamil Nadu. Please wait.", "துன் ஏஐ உங்களது தகுதி மற்றும் தமிழ்நாடு நல வாரிய விதிகளை சரிபார்க்கிறது. தயவுசெய்து காத்திருக்கவும்.", "थुनएआई आपकी योग्यता और तमिलनाडु कल्याण बोर्ड के नियमों की जांच कर रहा है। कृपया प्रतीक्षा करें।");
    }
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentScreen, currentQuestionIndex, questions]);

  const fetchQuestions = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/discovery/questions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSavedSchemes = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/discovery/saved', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedSchemeIds(data.saved.map((s: any) => s.schemeId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchExistingEligibility = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/discovery/eligibility', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.eligibility) {
          setEligibility(data.eligibility);
          setRecommendations(data.recommendations);
          setCurrentScreen('results');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Speaks localized text
  const speakText = (textEn: string, textTa: string, textHi: string) => {
    if (isMuted) return;
    window.speechSynthesis.cancel();
    
    let text = textEn;
    let langCode = 'en-US';

    if (language === 'ta') {
      text = textTa;
      langCode = 'ta-IN';
    } else if (language === 'hi') {
      text = textHi;
      langCode = 'hi-IN';
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.95; // Slightly slower for low-literacy clarity
    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const speakCurrentQuestion = () => {
    if (questions.length === 0) return;
    const q = questions[currentQuestionIndex];
    speakText(q.textEn, q.textTa, q.textHi);
  };

  // Simulated Voice input
  const startVoiceListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    setIsListening(true);
    setVoiceTranscript("Listening...");

    // Simulate worker speaking an answer in 3 seconds
    setTimeout(() => {
      if (questions.length === 0) return;
      const q = questions[currentQuestionIndex];
      // Select the first option as simulated voice input
      const randomOption = q.options[1] || q.options[0];
      
      setVoiceTranscript(`"${randomOption.labelEn}"`);
      setIsListening(false);
      
      // Auto register the answer
      handleSelectOption(randomOption.value);
    }, 2500);
  };

  const handleSelectOption = async (val: string) => {
    if (questions.length === 0) return;
    const q = questions[currentQuestionIndex];
    
    // Save answer locally
    const newAnswers = { ...answers, [q.id]: val };
    setAnswers(newAnswers);

    // Submit answer to server-side DB
    try {
      await fetch('/api/discovery/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: q.id,
          questionText: language === 'ta' ? q.textTa : language === 'hi' ? q.textHi : q.textEn,
          answer: val
        })
      });
    } catch (e) {
      console.error(e);
    }

    // Go to next question or trigger analysis
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Trigger AI Analysis
      triggerAnalysis();
    }
  };

  const triggerAnalysis = async () => {
    setCurrentScreen('processing');
    
    try {
      const res = await fetch('/api/discovery/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setEligibility(data.eligibility);
        setRecommendations(data.recommendations);
        setAiReasoning(data.aiReasoning);
        setSuggestedSteps(data.suggestedSteps);
        
        // Stagger transitions to let loaders play beautifully
        setTimeout(() => {
          setCurrentScreen('results');
          if (data.recommendations.length > 0) {
            setSelectedScheme(data.recommendations[0]);
            speakText(
              `We found ${data.recommendations.length} matching welfare programs. Let me explain the first one.`,
              `உங்களுக்குப் பொருந்தக்கூடிய ${data.recommendations.length} நலத்திட்டங்களை நாங்கள் கண்டறிந்துள்ளோம். முதல் திட்டத்தை விளக்குகிறேன்.`,
              `हमें आपके लिए ${data.recommendations.length} मिलान वाली योजनाएं मिली हैं। मैं आपको पहली योजना के बारे में बताती हूँ।`
            );
          } else {
            speakText(
              "We completed the check, but did not find exact matches today. Update your profile anytime.",
              "நாங்கள் சோதனையை முடித்தோம், ஆனால் இன்று பொருத்தமான திட்டங்கள் எதுவும் கண்டறியப்படவில்லை. உங்கள் சுயவிவரத்தை எப்போது வேண்டுமானாலும் புதுப்பிக்கலாம்.",
              "हमने जाँच पूरी कर ली है, लेकिन आज कोई उपयुक्त योजना नहीं मिली। आप कभी भी अपनी प्रोफ़ाइल अपडेट कर सकते हैं।"
            );
          }
        }, 1500);
      }
    } catch (e) {
      console.error(e);
      setCurrentScreen('welcome');
    }
  };

  const restartDiscovery = async () => {
    window.speechSynthesis.cancel();
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedScheme(null);
    setEligibility(null);
    setRecommendations([]);
    
    // Clear responses database
    try {
      await fetch('/api/discovery/clear-answers', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      console.error(e);
    }

    setCurrentScreen('questions');
  };

  const toggleSaveScheme = async (schemeId: string) => {
    const isSaved = savedSchemeIds.includes(schemeId);
    
    try {
      if (isSaved) {
        const res = await fetch(`/api/discovery/save/${schemeId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setSavedSchemeIds(prev => prev.filter(id => id !== schemeId));
          speakText("Removed from favorites", "பிடித்தவையிலிருந்து நீக்கப்பட்டது", "पसंदीदा से हटा दिया गया");
        }
      } else {
        const res = await fetch('/api/discovery/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ schemeId })
        });
        if (res.ok) {
          setSavedSchemeIds(prev => [...prev, schemeId]);
          speakText("Saved to favorites!", "பிடித்தவைகளில் சேமிக்கப்பட்டது!", "पसंदीदा में सहेजा गया!");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getLocalizedLabel = (option: any) => {
    if (language === 'ta') return option.labelTa;
    if (language === 'hi') return option.labelHi;
    return option.labelEn;
  };

  const getLocalizedTitle = (scheme: any) => {
    return getLocalizedScheme(scheme, language).name;
  };

  const getLocalizedReason = (rec: PersonalizedRecommendation) => {
    if (language === 'ta') return rec.relevanceReasonTa;
    if (language === 'hi') return rec.relevanceReasonHi;
    return rec.relevanceReasonEn;
  };

  // Document checklist helper
  // Checks which documents the worker actually has in their DocumentVault
  const checkDocumentStatus = (stepText: string) => {
    const textLower = stepText.toLowerCase();
    let docTypeMatch: 'Aadhaar' | 'Ration Card' | 'Voter ID' | 'Labour Card' | null = null;

    if (textLower.includes('aadhaar')) docTypeMatch = 'Aadhaar';
    else if (textLower.includes('ration')) docTypeMatch = 'Ration Card';
    else if (textLower.includes('voter')) docTypeMatch = 'Voter ID';
    else if (textLower.includes('labour') || textLower.includes('welfare')) docTypeMatch = 'Labour Card';

    if (!docTypeMatch) return { exists: false, unknown: true };

    const matchingDoc = documents.find(d => d.type === docTypeMatch);
    return {
      exists: !!matchingDoc,
      verified: matchingDoc?.verified || false,
      name: matchingDoc?.name || docTypeMatch
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Voice Assistant Header Controls */}
      <div className="bg-white border border-sky-150 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-xs">
            <Volume2 className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="font-black text-sm text-blue-950">
              {language === 'ta' ? 'துன் குரல் உதவியாளர்' : language === 'hi' ? 'थुन वॉयस गाइड' : 'ThunAI Audio Companion'}
            </h3>
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
              {language === 'ta' ? 'பேசும் வழிகாட்டி இயக்கத்தில் உள்ளது' : language === 'hi' ? 'बोलने वाली मार्गदर्शिका सक्रिय है' : 'Voice Guidance Active'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const nextMuted = !isMuted;
            setIsMuted(nextMuted);
            if (nextMuted) {
              window.speechSynthesis.cancel();
            } else {
              if (currentScreen === 'questions') speakCurrentQuestion();
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isMuted 
              ? 'bg-sky-50 text-slate-500 hover:text-slate-700 border border-sky-200' 
              : 'bg-sky-100 text-blue-800 border border-blue-300'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-700" />}
          <span>{isMuted ? 'Muted' : 'Speaking'}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* SCREEN 1: WELCOME SCREEN */}
        {currentScreen === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-sky-150 rounded-3xl p-6 md:p-10 text-center shadow-sm relative overflow-hidden"
          >
            <div className="max-w-xl mx-auto space-y-6 py-6">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-10 h-10 text-sky-200" strokeWidth={1.5} />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-blue-950">
                  {language === 'ta' ? 'அரசு நலத்திட்டங்களை கண்டறியவும்' : language === 'hi' ? 'अपनी सरकारी योजनाएं खोजें' : 'AI Rights & Benefits Discovery'}
                </h1>
                <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                  {language === 'ta' 
                    ? 'சில எளிய கேள்விகளுக்கு பதிலளிப்பதன் மூலம் நீங்கள் தகுதிபெறும் தமிழ்நாடு அரசு நலவாரிய உதவித்தொகை மற்றும் பலன்களை எளிதாகக் கண்டறியுங்கள்.' 
                    : language === 'hi'
                    ? 'कुछ सरल प्रश्नों के उत्तर देकर आसानी से उन योजनाओं और लाभों को खोजें जिनके लिए आप तमिलनाडु में पात्र हैं।'
                    : 'Discover financial aid, health cover, and housing benefits provided for unorganised and manual interstate workers in Tamil Nadu.'}
                </p>
              </div>

              {/* Large, High-Contrast Accessible Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                <button
                  onClick={restartDiscovery}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-2xl shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Mic className="w-5 h-5 text-sky-200 animate-pulse" />
                  <span>
                    {language === 'ta' ? 'குரல் உதவியுடன் தொடங்கவும்' : language === 'hi' ? 'वॉयस असिस्टेंट से शुरू करें' : 'Start Voice Assistant'}
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setCurrentScreen('favorites')}
                  className="px-8 py-4 bg-sky-50 text-blue-950 hover:bg-sky-100 border border-sky-200 text-base font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                  <span>
                    {language === 'ta' ? 'சேமிக்கப்பட்ட திட்டங்கள்' : language === 'hi' ? 'सहेजी गई योजनाएं' : 'My Saved Schemes'}
                  </span>
                </button>
              </div>

              {/* Visual Help Tip */}
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs font-semibold text-slate-600 flex items-start gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-blue-950 font-bold">Zero Literacy Support:</span> ThunAI will speak every question aloud. You can reply using the large visual buttons, or tap the microphone to speak back.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SCREEN 2: QUESTION FLOW */}
        {currentScreen === 'questions' && questions.length > 0 && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Progress indicator */}
            <div className="bg-white border border-sky-150 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              
              {/* Simple graphic bar */}
              <div className="w-48 bg-sky-150 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Core Question Card */}
            <div className="bg-white border border-sky-150 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>

              {/* Animated wave indicator to show voice speaking */}
              {!isMuted && (
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="w-1 h-3 bg-blue-600 rounded-full animate-pulse"></span>
                  <span className="w-1 h-5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-1 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider ml-1">ThunAI Speaking</span>
                </div>
              )}

              {/* Localized Question Heading */}
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-blue-950">
                  {language === 'ta' 
                    ? questions[currentQuestionIndex].textTa 
                    : language === 'hi' 
                    ? questions[currentQuestionIndex].textHi 
                    : questions[currentQuestionIndex].textEn}
                </h2>
              </div>

              {/* Large Accessible Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {questions[currentQuestionIndex].options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelectOption(opt.value)}
                    className="p-5 text-left bg-sky-50/50 border-2 border-sky-150 hover:border-blue-600 hover:bg-sky-100/50 rounded-2xl active:scale-[0.99] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm md:text-base text-blue-950 group-hover:text-blue-700">
                        {getLocalizedLabel(opt)}
                      </span>
                      <div className="w-6 h-6 rounded-full border border-sky-300 flex items-center justify-center group-hover:border-blue-600 group-hover:bg-blue-600 text-white transition-all">
                        <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* VOICE REPLY PANEL (MIC SIMULATION) */}
              <div className="border-t border-sky-150 pt-6 flex flex-col items-center gap-3">
                <button
                  onClick={startVoiceListening}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white animate-ping shadow-lg shadow-rose-600/35'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:scale-105 active:scale-95'
                  } cursor-pointer`}
                >
                  {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>
                
                <div className="text-center">
                  <div className="text-xs font-bold text-blue-950">
                    {isListening ? 'Listening to your voice...' : 'Speak your answer'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 font-mono min-h-[15px]">
                    {isListening ? voiceTranscript : 'Or tap any button above'}
                  </div>
                </div>
              </div>

              {/* Navigation help */}
              <div className="flex justify-between items-center pt-2 border-t border-sky-150">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-sky-50 disabled:opacity-40"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('back')}</span>
                </button>

                <button
                  onClick={() => setCurrentScreen('welcome')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
                >
                  <span>Exit Discovery</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* SCREEN 3: PROCESSING / WAVE EFFECT */}
        {currentScreen === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-sky-150 rounded-3xl p-10 text-center shadow-sm py-16 flex flex-col items-center justify-center space-y-6"
          >
            {/* Pulsing radar wave animation */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
              <div className="absolute inset-4 bg-sky-500/20 rounded-full animate-pulse" style={{ animationDuration: '1.5s' }}></div>
              <div className="relative bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-md">
                <Sparkles className="w-8 h-8 text-sky-200 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-blue-950">
                {language === 'ta' ? 'தகுதிகளைச் சரிபார்க்கிறது...' : language === 'hi' ? 'पात्रता की जांच की जा रही है...' : 'ThunAI calculation...'}
              </h3>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                {language === 'ta' ? 'அரசு நல வாரிய விதிகள் ஆய்வு' : language === 'hi' ? 'सरकारी कल्याण नियमों का विश्लेषण' : 'Analysing Labour Welfare Regulations'}
              </p>
              <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium leading-relaxed pt-2">
                We are generating your personalized welfare eligibility card using official Tamil Nadu Labour guidelines.
              </p>
            </div>
          </motion.div>
        )}

        {/* SCREEN 4: ELIGIBLE BENEFITS / DETAILS SPLIT VIEW */}
        {currentScreen === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Summary card */}
            <div className="bg-blue-600 rounded-3xl p-5 md:p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="bg-white/15 p-3.5 rounded-2xl border border-white/20 text-sky-200">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black tracking-tight">
                    {language === 'ta' ? 'வாழ்த்துக்கள்! உங்கள் உரிமைகள் தயார்' : language === 'hi' ? 'बधाई हो! आपके अधिकार तैयार हैं' : 'Welfare Match Results'}
                  </h2>
                  <p className="text-xs text-sky-100 font-semibold uppercase tracking-wider mt-0.5">
                    {recommendations.length} Program matches identified
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={restartDiscovery}
                  className="px-4.5 py-2.5 bg-white/15 border border-white/25 hover:bg-white/25 text-white text-xs font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Check Again</span>
                </button>
                <button
                  onClick={() => setCurrentScreen('favorites')}
                  className="px-4.5 py-2.5 bg-white text-blue-700 hover:bg-sky-50 text-xs font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>My Saved</span>
                </button>
              </div>
            </div>

            {/* Split layout: List on Left, Active item on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left column: Cards list */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Matching Schemes ({recommendations.length})
                </h3>

                {recommendations.length === 0 ? (
                  <div className="bg-white border border-sky-150 rounded-2xl p-6 text-center text-slate-500">
                    No matching schemes found based on answers. Try checking again or complete your profile.
                  </div>
                ) : (
                  recommendations.map((rec) => {
                    const isSelected = selectedScheme?.scheme.id === rec.scheme.id;
                    const isSaved = savedSchemeIds.includes(rec.scheme.id);
                    return (
                      <div
                        key={rec.scheme.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedScheme(rec);
                          setActiveTab('explanation');
                          speakText(
                            rec.scheme.name,
                            rec.scheme.nameTranslated,
                            rec.scheme.name
                          );
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedScheme(rec);
                            setActiveTab('explanation');
                            speakText(
                              rec.scheme.name,
                              rec.scheme.nameTranslated,
                              rec.scheme.name
                            );
                          }
                        }}
                        className={`w-full text-left p-4.5 rounded-2xl border-2 transition-all flex items-start gap-3 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                          isSelected 
                            ? 'bg-sky-50 border-blue-600 shadow-xs' 
                            : 'bg-white border-sky-150 hover:border-sky-300'
                        }`}
                      >
                        {/* Rating block */}
                        <div className="bg-blue-600 text-white rounded-xl p-2.5 shrink-0 flex flex-col items-center justify-center min-w-[50px]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-100">Match</span>
                          <span className="text-sm font-black font-mono">{rec.matchScore}%</span>
                        </div>

                        {/* Text details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs md:text-sm text-blue-950 truncate">
                            {getLocalizedTitle(rec.scheme)}
                          </h4>
                          <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 bg-sky-50 text-blue-700 rounded-md mt-1 border border-sky-200 uppercase tracking-wider">
                            {rec.scheme.category}
                          </span>
                          <p className="text-[11px] text-slate-600 mt-2 font-medium line-clamp-2">
                            {getLocalizedReason(rec)}
                          </p>
                        </div>

                        <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveScheme(rec.scheme.id);
                            }}
                            className="p-1.5 hover:bg-sky-50 rounded-lg text-rose-500 cursor-pointer"
                          >
                            <Heart className={`w-4.5 h-4.5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
                          </button>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right column: Selected scheme details */}
              <div className="lg:col-span-7">
                {selectedScheme ? (() => {
                  const activeLocalizedScheme = getLocalizedScheme(selectedScheme.scheme, language);
                  return (
                    <div className="bg-white border border-sky-150 rounded-3xl overflow-hidden shadow-xs flex flex-col h-full">
                      
                      {/* Header bar */}
                      <div className="p-5 border-b border-sky-150 bg-sky-50/50 flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-blue-700">
                            {activeLocalizedScheme.category} Welfare Program
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <h3 className="font-black text-base md:text-lg text-blue-950 leading-tight flex-1">
                              {activeLocalizedScheme.name}
                            </h3>
                            <SpeakButton 
                              text={`${activeLocalizedScheme.name}. ${activeLocalizedScheme.description}. Benefits: ${activeLocalizedScheme.benefit}.`} 
                              size="sm" 
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => toggleSaveScheme(selectedScheme.scheme.id)}
                          className={`p-3 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            savedSchemeIds.includes(selectedScheme.scheme.id)
                              ? 'bg-rose-50 border-rose-200 text-rose-600'
                              : 'bg-white border-sky-200 text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${savedSchemeIds.includes(selectedScheme.scheme.id) ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>

                      {/* Accessible visual tabs */}
                      <div className="flex border-b border-sky-150 bg-white">
                        {[
                          { id: 'explanation', label: '1. What you get' },
                          { id: 'documents', label: '2. Required ID Cards' },
                          { id: 'steps', label: '3. How to apply' }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-4 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${
                              activeTab === tab.id
                                ? 'border-blue-600 text-blue-700 bg-sky-50/60'
                                : 'border-transparent text-slate-500 hover:text-blue-950'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Content area */}
                      <div className="p-6 flex-1 min-h-[300px] text-slate-700">
                        
                        {/* TAB 1: EXPLANATION */}
                        {activeTab === 'explanation' && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                          >
                            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4.5">
                              <h4 className="font-black text-sm text-blue-950 flex items-center gap-2">
                                <Sparkles className="w-4.5 h-4.5 text-blue-600" />
                                Personal Eligibility Match
                              </h4>
                              <p className="text-xs text-slate-600 mt-2 leading-relaxed font-semibold">
                                {getLocalizedReason(selectedScheme)}
                              </p>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">The Benefit Value</span>
                                <p className="text-base font-black text-blue-700 mt-1">
                                  {activeLocalizedScheme.benefit}
                                </p>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Scheme Overview</span>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                                  {activeLocalizedScheme.description}
                                </p>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Who Can Apply</span>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                                  {activeLocalizedScheme.eligibility}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                      {/* TAB 2: REQUIRED DOCUMENTS CHECK */}
                      {activeTab === 'documents' && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-5"
                        >
                          <div className="text-xs font-semibold text-slate-600">
                            We scanned your <span className="font-extrabold text-blue-700">Document Vault</span> to verify if you have the required ID cards for this benefit.
                          </div>

                          <div className="space-y-3.5">
                            {['Aadhaar Card copy', 'Bank Passbook copy', 'Ration card / Family ID proof'].map((docName, i) => {
                              const status = checkDocumentStatus(docName);
                              return (
                                <div 
                                  key={i} 
                                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                                    status.exists 
                                      ? 'bg-sky-50 border-sky-200 text-blue-950' 
                                      : 'bg-amber-50/60 border-amber-200 text-amber-900'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${status.exists ? 'bg-sky-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <div className="font-bold text-xs text-slate-900">{docName}</div>
                                      <div className="text-[10px] opacity-75 font-bold uppercase tracking-wider mt-0.5">
                                        {status.exists ? `Found: ${status.name}` : 'Missing in your Vault'}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {status.exists ? (
                                      <>
                                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                        {status.verified && (
                                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-sky-100 text-blue-800 rounded-md">
                                            AI Verified
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <div className="flex items-center gap-1.5 bg-amber-100 px-2 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-wider text-amber-900">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>Need Upload</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <a
                            href="#/documents"
                            className="w-full mt-4 py-3.5 bg-sky-50 hover:bg-sky-100 text-blue-700 font-bold rounded-2xl flex items-center justify-center gap-2 text-xs border border-sky-200"
                          >
                            <span>Open Document Vault to Upload IDs</span>
                          </a>
                        </motion.div>
                      )}

                      {/* TAB 3: APPLICATION STEPS */}
                      {activeTab === 'steps' && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-4"
                        >
                          <div className="bg-sky-50 p-4 border border-sky-200 rounded-2xl flex gap-3 text-xs font-semibold text-slate-600 leading-relaxed">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              ThunAI generated an official application guidance checklist for you. Follow these steps to receive your benefit.
                            </div>
                          </div>

                          <div className="space-y-3 pt-2">
                            {selectedScheme.scheme.stepsToApply.map((step, idx) => (
                              <div key={idx} className="flex gap-4 p-3.5 rounded-xl bg-white border border-sky-150">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </div>
                                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                );
              })() : (
                  <div className="bg-white border border-sky-150 rounded-3xl p-10 text-center text-slate-400 flex flex-col items-center justify-center h-full min-h-[400px]">
                    <Sparkles className="w-12 h-12 text-sky-300 mb-3" />
                    <p className="font-bold text-blue-950">Select a Scheme to View Details</p>
                    <p className="text-xs text-slate-500 mt-1">Tap any matching card on the left to see required ID cards, steps, and explanations.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* SCREEN 8: FAVORITES VIEW */}
        {currentScreen === 'favorites' && (
          <motion.div
            key="favorites"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center bg-white border border-sky-150 p-5 rounded-2xl shadow-xs">
              <div>
                <h2 className="text-lg font-black text-blue-950 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <span>
                    {language === 'ta' ? 'எனது சேமிக்கப்பட்ட திட்டங்கள்' : language === 'hi' ? 'सहेजी गई कल्याण योजनाएं' : 'My Saved Welfare Schemes'}
                  </span>
                </h2>
                <p className="text-xs font-bold text-slate-500 uppercase mt-0.5 tracking-wider">
                  Bookmarked schemes and checklists
                </p>
              </div>

              <button
                onClick={() => setCurrentScreen(eligibility ? 'results' : 'welcome')}
                className="px-4 py-2 hover:bg-sky-50 rounded-xl text-xs font-bold text-slate-700 border border-sky-200 cursor-pointer"
              >
                Go Back
              </button>
            </div>

            {/* List of bookmarks */}
            {savedSchemeIds.length === 0 ? (
              <div className="bg-white border border-sky-150 rounded-3xl p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-4">
                <Heart className="w-12 h-12 text-sky-200" />
                <div className="space-y-1">
                  <p className="font-bold text-sm text-blue-950">No bookmarked schemes yet</p>
                  <p className="text-xs text-slate-500">Bookmark schemes in the Rights Discovery flow to access your checklists instantly here.</p>
                </div>
                <button
                  onClick={restartDiscovery}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Start Discovery Flow
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Find schemes matching saved ids */}
                {recommendations
                  .filter(rec => savedSchemeIds.includes(rec.scheme.id))
                  .map((rec) => (
                    <div 
                      key={rec.scheme.id}
                      className="bg-white border border-sky-150 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-5"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-mono font-bold text-blue-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                            {rec.scheme.category}
                          </span>
                          <button
                            onClick={() => toggleSaveScheme(rec.scheme.id)}
                            className="text-rose-500 hover:scale-105 cursor-pointer"
                          >
                            <Heart className="w-5 h-5 fill-rose-500" />
                          </button>
                        </div>

                        <h4 className="font-bold text-sm text-blue-950 mt-3 leading-tight">
                          {getLocalizedTitle(rec.scheme)}
                        </h4>
                        
                        <p className="text-xs font-semibold text-blue-700 mt-2">
                          {rec.scheme.benefit}
                        </p>
                      </div>

                      <div className="border-t border-sky-150 pt-4 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500">
                          {rec.scheme.stepsToApply.length} Application Steps
                        </span>
                        
                        <button
                          onClick={() => {
                            setSelectedScheme(rec);
                            setCurrentScreen('results');
                          }}
                          className="px-4.5 py-2 bg-sky-50 hover:bg-sky-100 text-blue-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-sky-200"
                        >
                          <span>Open Checklist</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
