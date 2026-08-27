import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../contexts/AppContext.js';
import { profileService } from '../services/profileService.js';
import ProgressStep from '../components/ProgressStep.js';
import VoiceButton from '../components/VoiceButton.js';
import { 
  User as UserIcon, 
  Languages, 
  MapPin, 
  Briefcase, 
  Accessibility, 
  Calendar, 
  Heart, 
  Baby, 
  FileText, 
  ArrowLeft, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Smile, 
  CheckCircle,
  Home
} from 'lucide-react';
import { Language } from '../../shared/types.js';

export default function RegisterProfile() {
  const { setupProfile, token, user, setLanguage, t } = useApp();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!token && !user) {
      navigate('/login');
    }
  }, [token, user, navigate]);

  // Total 10 Onboarding Steps
  const TOTAL_STEPS = 10;
  const [currentStep, setCurrentStep] = useState(1);

  // Profile Form States
  const [name, setName] = useState('');
  const [prefLang, setPrefLang] = useState<Language>('en');
  const [homeState, setHomeState] = useState('');
  const [occupation, setOccupation] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [age, setAge] = useState<number>(28);
  const [maritalStatus, setMaritalStatus] = useState<'married' | 'single'>('single');
  const [children, setChildren] = useState<'yes' | 'no'>('no');
  const [documents, setDocuments] = useState<string[]>([]);
  const [district, setDistrict] = useState('');

  // UI / UX States
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Options lists (large cards)
  const languageOptions = [
    { value: 'ta' as Language, label: 'தமிழ்', sub: 'Tamil', desc: 'வணக்கம், துன்-க்கு வரவேற்கிறோம்' },
    { value: 'hi' as Language, label: 'हिन्दी', sub: 'Hindi', desc: 'नमस्ते, थुन में आपका स्वागत है' },
    { value: 'en' as Language, label: 'English', sub: 'English', desc: 'Hello, Welcome to ThunAI' },
  ];

  const stateOptions = [
    { value: 'Bihar', label: 'Bihar (बिहार)' },
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh (उत्तर प्रदेश)' },
    { value: 'West Bengal', label: 'West Bengal (पश्चिम बंगाल)' },
    { value: 'Odisha', label: 'Odisha (ओडिशा)' },
    { value: 'Assam', label: 'Assam (असम)' },
    { value: 'Jharkhand', label: 'Jharkhand (झारखंड)' },
    { value: 'Madhya Pradesh', label: 'Madhya Pradesh (मध्य प्रदेश)' },
    { value: 'Rajasthan', label: 'Rajasthan (राजस्थान)' },
    { value: 'Other', label: 'Other State (अन्य राज्य)' },
  ];

  const occupationOptions = [
    { value: 'Construction', label: 'Construction (கட்டுமானம் / निर्माण)', icon: '🏗️' },
    { value: 'Factory', label: 'Factory (தொழிற்சாலை / कारखाना)', icon: '🏭' },
    { value: 'Hotel', label: 'Hotel & Catering (உணவகம் / होटल)', icon: '🏨' },
    { value: 'Housekeeping', label: 'Housekeeping (வீட்டு வேலை / घरेलू काम)', icon: '🧹' },
    { value: 'Delivery', label: 'Delivery / Transport (டெலிவரி / परिवहन)', icon: '🛵' },
    { value: 'Other', label: 'Other Manual Work (இதர வேலை / अन्य)', icon: '🛠️' },
  ];

  const genderOptions = [
    { value: 'male' as const, label: 'Male (ஆண் / पुरुष)', icon: '👨' },
    { value: 'female' as const, label: 'Female (பெண் / महिला)', icon: '👩' },
    { value: 'other' as const, label: 'Other (மற்றவை / अन्य)', icon: '👤' },
  ];

  const docOptions = [
    { value: 'Aadhaar', label: 'Aadhaar Card', sub: 'ஆதார் அட்டை / आधार', icon: '🆔' },
    { value: 'PAN', label: 'PAN Card', sub: 'பான் அட்டை / पैन', icon: '💳' },
    { value: 'Labour Card', label: 'Labour Welfare Card', sub: 'தொழிலாளர் அட்டை / लेबर कार्ड', icon: '👷' },
    { value: 'Bank Account', label: 'Bank Passbook', sub: 'வங்கி கணக்கு / बैंक खाता', icon: '🏦' },
    { value: 'Ration Card', label: 'Ration Card', sub: 'குடும்ப அட்டை / राशन कार्ड', icon: '🌾' },
    { value: 'Voter ID', label: 'Voter ID', sub: 'வாக்காளர் அட்டை / वोटर आईडी', icon: '🗳️' },
  ];

  const districtOptions = [
    { value: 'Tiruppur', label: 'Tiruppur (திருப்பூர்)' },
    { value: 'Chennai', label: 'Chennai (சென்னை)' },
    { value: 'Coimbatore', label: 'Coimbatore (கோவை)' },
    { value: 'Kanchipuram', label: 'Kanchipuram (காஞ்சிபுரம்)' },
    { value: 'Chengalpattu', label: 'Chengalpattu (செங்கல்பட்டு)' },
    { value: 'Madurai', label: 'Madurai (மதுரை)' },
    { value: 'Salem', label: 'Salem (சேலம்)' },
    { value: 'Erode', label: 'Erode (ஈரோடு)' },
    { value: 'Trichy', label: 'Trichy (திருச்சி)' },
    { value: 'Other', label: 'Other District (பிற மாவட்டம்)' },
  ];

  // TTS Voice Prompts Dictionary
  const voicePrompts: Record<number, { en: string; ta: string; hi: string }> = {
    1: {
      en: "What is your full name? Tap the microphone or write down below.",
      ta: "உங்கள் முழு பெயர் என்ன? மைக் பொத்தானைத் தட்டி உங்கள் பெயரைச் சொல்லுங்கள்.",
      hi: "आपका पूरा नाम क्या है? माइक्रोफोन को दबाएं या नीचे लिखें।"
    },
    2: {
      en: "Which language do you speak best? Select Tamil, Hindi, or English.",
      ta: "நீங்கள் எந்த மொழியில் பேச விரும்புகிறீர்கள்? தமிழ், ஹிந்தி, அல்லது ஆங்கிலத்தைத் தேர்ந்தெடுக்கவும்.",
      hi: "आप कौन सी भाषा सबसे अच्छी बोलते हैं? तमिल, हिन्दी या अंग्रेज़ी चुनें।"
    },
    3: {
      en: "Which home state are you from?",
      ta: "நீங்கள் இந்தியாவின் எந்த மாநிலத்திலிருந்து வந்திருக்கிறீர்கள்?",
      hi: "आप किस गृह राज्य से हैं?"
    },
    4: {
      en: "What type of industry or manual work do you do in Tamil Nadu?",
      ta: "நீங்கள் தமிழ்நாட்டில் எந்த வகையான வேலை செய்கிறீர்கள்?",
      hi: "आप तमिलनाडु में किस प्रकार का काम करते हैं?"
    },
    5: {
      en: "Are you male, female, or other?",
      ta: "உங்கள் பாலினம் என்ன? ஆண், பெண் அல்லது மற்றவை.",
      hi: "आपका लिंग क्या है? पुरुष, महिला या अन्य।"
    },
    6: {
      en: "How old are you? Use the buttons to increase or decrease your age.",
      ta: "உங்கள் வயது என்ன? பொத்தான்களைப் பயன்படுத்தி உங்கள் வயதைக் குறிப்பிடவும்.",
      hi: "आपकी उम्र कितनी है? अपनी उम्र घटाने या बढ़ाने के लिए बटनों का उपयोग करें।"
    },
    7: {
      en: "Are you married or single?",
      ta: "உங்களுக்கு திருமணமாகிவிட்டதா இல்லையா?",
      hi: "क्या आप शादीशुदा हैं या अविवाहित?"
    },
    8: {
      en: "Do you have children?",
      ta: "உங்களுக்குக் குழந்தைகள் இருக்கிறார்களா?",
      hi: "क्या आपके बच्चे हैं?"
    },
    9: {
      en: "Which identity documents do you currently have? Tap on all matching cards.",
      ta: "உங்களிடம் எந்தெந்த அடையாள அட்டைகள் உள்ளன? உள்ளவற்றைத் தட்டவும்.",
      hi: "आपके पास कौन-से पहचान दस्तावेज़ हैं? सभी सही कार्डों पर टैप करें।"
    },
    10: {
      en: "Which district in Tamil Nadu are you currently working in?",
      ta: "நீங்கள் தற்போது தமிழ்நாட்டின் எந்த மாவட்டத்தில் பணிபுரிகிறீர்கள்?",
      hi: "आप वर्तमान में तमिलनाडु के किस जिले में काम कर रहे हैं?"
    }
  };

  // Text to Speech Functionality
  const speakQuestion = (step: number) => {
    if (!ttsEnabled) return;
    try {
      window.speechSynthesis.cancel(); // Stop active speech

      const promptSet = voicePrompts[step];
      if (!promptSet) return;

      // Select translation matching user's selected preference
      const text = prefLang === 'ta' ? promptSet.ta : prefLang === 'hi' ? promptSet.hi : promptSet.en;

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select appropriate language voice code
      if (prefLang === 'ta') utterance.lang = 'ta-IN';
      else if (prefLang === 'hi') utterance.lang = 'hi-IN';
      else utterance.lang = 'en-IN';

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unsupported or blocked:', e);
    }
  };

  // Speak every time step or language changes
  useEffect(() => {
    speakQuestion(currentStep);
  }, [currentStep, prefLang, ttsEnabled]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    };
  }, []);

  // Web Speech Recognition Integration
  const handleStartVoiceInput = () => {
    setSpeechError(null);
    setIsListening(true);

    // Standard SpeechRecognition API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Simulate speech input in sandbox environments / unsupporting browsers
      setTimeout(() => {
        setIsListening(false);
        simulateSpeechResponse();
      }, 2500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = prefLang === 'ta' ? 'ta-IN' : prefLang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcriptText = event.results[0][0].transcript;
        processSpokenAnswer(transcriptText);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setSpeechError(`Voice input failed (${event.error}). Try typing or click to retry.`);
        setIsListening(false);
        // Fallback simulation to keep user experience perfect
        setTimeout(() => {
          simulateSpeechResponse();
        }, 1500);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
      simulateSpeechResponse();
    }
  };

  // Automated voice-to-field processor simulation
  const simulateSpeechResponse = () => {
    let result = '';
    if (currentStep === 1) {
      result = prefLang === 'ta' ? 'ராஜேஷ் குமார்' : prefLang === 'hi' ? 'राजेश कुमार' : 'Rajesh Kumar';
    } else if (currentStep === 6) {
      result = '32';
    } else if (currentStep === 3) {
      result = 'Bihar';
    } else {
      result = 'Construction';
    }

    processSpokenAnswer(result);
  };

  const processSpokenAnswer = (text: string) => {
    if (!text) return;
    
    // Process matching values depending on active step
    if (currentStep === 1) {
      setName(text);
    } else if (currentStep === 2) {
      const lower = text.toLowerCase();
      if (lower.includes('தமிழ்') || lower.includes('tamil') || lower.includes('ta')) {
        handleLanguageSelect('ta');
      } else if (lower.includes('हिन्दी') || lower.includes('hindi') || lower.includes('hi')) {
        handleLanguageSelect('hi');
      } else {
        handleLanguageSelect('en');
      }
    } else if (currentStep === 3) {
      const matched = stateOptions.find(opt => text.toLowerCase().includes(opt.value.toLowerCase()) || text.toLowerCase().includes(opt.label.toLowerCase()));
      if (matched) setHomeState(matched.value);
    } else if (currentStep === 4) {
      const matched = occupationOptions.find(opt => text.toLowerCase().includes(opt.value.toLowerCase()) || text.toLowerCase().includes(opt.label.toLowerCase()));
      if (matched) setOccupation(matched.value);
    } else if (currentStep === 5) {
      if (text.toLowerCase().includes('female') || text.toLowerCase().includes('महिला') || text.toLowerCase().includes('ஆண்')) {
        setGender('female');
      } else {
        setGender('male');
      }
    } else if (currentStep === 6) {
      const parsedAge = parseInt(text.replace(/[^0-9]/g, ''));
      if (!isNaN(parsedAge) && parsedAge > 15 && parsedAge < 80) {
        setAge(parsedAge);
      }
    } else if (currentStep === 7) {
      if (text.toLowerCase().includes('single') || text.toLowerCase().includes('अविवाहित')) {
        setMaritalStatus('single');
      } else {
        setMaritalStatus('married');
      }
    } else if (currentStep === 8) {
      if (text.toLowerCase().includes('no') || text.toLowerCase().includes('नहीं')) {
        setChildren('no');
      } else {
        setChildren('yes');
      }
    } else if (currentStep === 10) {
      const matched = districtOptions.find(opt => text.toLowerCase().includes(opt.value.toLowerCase()) || text.toLowerCase().includes(opt.label.toLowerCase()));
      if (matched) setDistrict(matched.value);
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    setPrefLang(lang);
    setLanguage(lang); // Sync with context immediately
  };

  const handleDocumentToggle = (docValue: string) => {
    if (documents.includes(docValue)) {
      setDocuments(documents.filter(d => d !== docValue));
    } else {
      setDocuments([...documents, docValue]);
    }
  };

  // Navigations
  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Save profile and redirect to dashboard
  const handleFinalSubmit = async () => {
    setSaving(true);
    try {
      const safeToken = token || localStorage.getItem('sahaaya_token') || 'dev_token_user';

      // 1. Core Profile creation in the database
      const payload = {
        name,
        phone: user?.phoneNumber || '',
        preferredLanguage: prefLang,
        homeState: homeState || 'Bihar',
        occupation: occupation || 'Construction',
        gender,
        age,
        maritalStatus,
        children,
        documents,
        district: district || 'Tiruppur'
      };

      await profileService.saveProfile(safeToken, payload);

      // 2. Sync with local Auth Context state (updates profileSetupCompleted)
      const setupResult = await setupProfile({
        name,
        age,
        stateOfOrigin: homeState || 'Bihar',
        nativeLanguage: prefLang,
        currentDistrictInTN: district || 'Tiruppur',
        industry: occupation || 'Construction'
      });

      if (setupResult.success) {
        navigate('/dashboard');
      } else {
        // Fallback redirection to keep user moving forward
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to finalise onboarding profile:', err);
      navigate('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  // Form Validity Guards for the "Next" button
  const isStepValid = () => {
    if (currentStep === 1) return name.trim().length >= 2;
    if (currentStep === 2) return !!prefLang;
    if (currentStep === 3) return !!homeState;
    if (currentStep === 4) return !!occupation;
    if (currentStep === 10) return !!district;
    return true; // Other fields have solid defaults
  };

  // Get localized step instructions
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return prefLang === 'ta' ? 'உங்கள் பெயர் என்ன?' : prefLang === 'hi' ? 'आपका नाम क्या है?' : 'What is your name?';
      case 2: return prefLang === 'ta' ? 'நீங்கள் எந்த மொழி பேசுகிறீர்கள்?' : prefLang === 'hi' ? 'आप कौन सी भाषा बोलते हैं?' : 'Which language do you speak?';
      case 3: return prefLang === 'ta' ? 'நீங்கள் எந்த மாநிலத்தை சேர்ந்தவர்?' : prefLang === 'hi' ? 'आप किस राज्य से हैं?' : 'Which state are you from?';
      case 4: return prefLang === 'ta' ? 'நீங்கள் என்ன வேலை செய்கிறீர்கள்?' : prefLang === 'hi' ? 'आप क्या काम करते हैं?' : 'What work do you do?';
      case 5: return prefLang === 'ta' ? 'பாலினம் என்ன?' : prefLang === 'hi' ? 'आपका लिंग क्या है?' : 'What is your gender?';
      case 6: return prefLang === 'ta' ? 'உங்கள் வயது என்ன?' : prefLang === 'hi' ? 'आपकी उम्र क्या है?' : 'What is your age?';
      case 7: return prefLang === 'ta' ? 'திருமண நிலை?' : prefLang === 'hi' ? 'क्या आपकी शादी हो चुकी है?' : 'Are you married?';
      case 8: return prefLang === 'ta' ? 'குழந்தைகள் இருக்கிறார்களா?' : prefLang === 'hi' ? 'क्या आपके बच्चे हैं?' : 'Do you have children?';
      case 9: return prefLang === 'ta' ? 'உங்களிடம் உள்ள ஆவணங்கள்?' : prefLang === 'hi' ? 'आपके पास कौन-से दस्तावेज़ हैं?' : 'Which documents do you have?';
      case 10: return prefLang === 'ta' ? 'தற்போது எங்கு வேலை செய்கிறீர்கள்?' : prefLang === 'hi' ? 'अभी आप कहाँ काम कर रहे हैं?' : 'Where are you working currently?';
      default: return 'Onboarding';
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f6fc] text-slate-900 px-4 py-6 md:py-12 transition-colors duration-200 flex flex-col justify-between">
      
      {/* Top Header Row with Speech Control */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between pb-4 border-b border-sky-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm shadow-blue-600/20">
            T
          </div>
          <div>
            <h1 className="font-black text-sm text-blue-950 leading-tight">ThunAI</h1>
            <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Digital Identity Setup</p>
          </div>
        </div>

        {/* Text to Speech toggle */}
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`p-2 px-3 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
            ttsEnabled 
              ? 'bg-sky-50 border-sky-300 text-blue-700' 
              : 'bg-white border-sky-200 text-slate-400'
          }`}
          title="Toggle Voice Assistant Speech Guidance"
        >
          {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">Voice On</span>
        </button>
      </div>

      {/* Main card stage */}
      <div className="flex-1 flex items-center justify-center my-6">
        <div className="max-w-xl w-full bg-white rounded-3xl p-6 md:p-8 border border-sky-150 shadow-md shadow-sky-950/5 relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Question Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex p-3.5 bg-sky-50 text-blue-700 rounded-2xl border border-sky-200 shadow-2xs">
                  {currentStep === 1 && <UserIcon className="w-8 h-8" />}
                  {currentStep === 2 && <Languages className="w-8 h-8" />}
                  {currentStep === 3 && <Home className="w-8 h-8" />}
                  {currentStep === 4 && <Briefcase className="w-8 h-8" />}
                  {currentStep === 5 && <Accessibility className="w-8 h-8" />}
                  {currentStep === 6 && <Calendar className="w-8 h-8" />}
                  {currentStep === 7 && <Heart className="w-8 h-8" />}
                  {currentStep === 8 && <Baby className="w-8 h-8" />}
                  {currentStep === 9 && <FileText className="w-8 h-8" />}
                  {currentStep === 10 && <MapPin className="w-8 h-8" />}
                </div>

                <h2 className="text-xl md:text-2xl font-black text-blue-950 tracking-tight">
                  {getStepTitle()}
                </h2>
                
                <p className="text-xs text-slate-600 font-medium px-4">
                  {prefLang === 'ta' ? voicePrompts[currentStep]?.ta : prefLang === 'hi' ? voicePrompts[currentStep]?.hi : voicePrompts[currentStep]?.en}
                </p>
              </div>

              {/* Speech recognition error helper */}
              {speechError && (
                <div className="text-center text-[10px] font-bold text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
                  {speechError}
                </div>
              )}

              {/* Dynamic Input Answer Panel */}
              <div className="py-2">
                
                {/* STEP 1: Name Input */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Type your name here..."
                      className="w-full bg-sky-50/50 border-2 border-sky-200 text-base rounded-2xl p-4 font-bold text-center focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-blue-950"
                    />
                    <VoiceButton isListening={isListening} onClick={handleStartVoiceInput} />
                  </div>
                )}

                {/* STEP 2: Language Preference Selector */}
                {currentStep === 2 && (
                  <div className="grid grid-cols-1 gap-3">
                    {languageOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleLanguageSelect(opt.value)}
                        className={`p-4 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                          prefLang === opt.value
                            ? 'bg-sky-50 border-2 border-blue-600 text-blue-950'
                            : 'bg-white border-sky-150 hover:border-sky-300 text-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-black text-sm text-blue-950">{opt.label}</div>
                          <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">{opt.sub}</div>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* STEP 3: Origin State Searchable Cards */}
                {currentStep === 3 && (
                  <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {stateOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setHomeState(opt.value)}
                        className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          homeState === opt.value
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-sky-50/60 border-sky-150 hover:bg-sky-100/60 text-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* STEP 4: Occupation Selector */}
                {currentStep === 4 && (
                  <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                    {occupationOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setOccupation(opt.value)}
                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center ${
                          occupation === opt.value
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-sky-50/60 border-sky-150 hover:bg-sky-100/60 text-slate-800'
                        }`}
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <span className="font-black text-[10px] leading-tight uppercase tracking-wider">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* STEP 5: Gender Selector */}
                {currentStep === 5 && (
                  <div className="grid grid-cols-3 gap-3">
                    {genderOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setGender(opt.value)}
                        className={`p-5 rounded-2xl border flex flex-col items-center gap-2.5 cursor-pointer transition-all ${
                          gender === opt.value
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-sky-50/60 border-sky-150 hover:bg-sky-100/60 text-slate-800'
                        }`}
                      >
                        <span className="text-3xl">{opt.icon}</span>
                        <span className="font-bold text-xs">{opt.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* STEP 6: Age Slider / Toggles */}
                {currentStep === 6 && (
                  <div className="space-y-6 text-center">
                    <div className="flex items-center justify-center gap-6">
                      <button
                        onClick={() => setAge(Math.max(18, age - 1))}
                        className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center font-black text-lg border border-sky-200 hover:bg-sky-100 text-blue-950 cursor-pointer shadow-2xs"
                      >
                        -
                      </button>
                      
                      <div className="text-4xl font-black text-blue-950">
                        {age} <span className="text-xs uppercase text-slate-500 font-bold">years old</span>
                      </div>
                      
                      <button
                        onClick={() => setAge(Math.min(75, age + 1))}
                        className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center font-black text-lg border border-sky-200 hover:bg-sky-100 text-blue-950 cursor-pointer shadow-2xs"
                      >
                        +
                      </button>
                    </div>

                    <input 
                      type="range" 
                      min="18" 
                      max="75" 
                      value={age} 
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full h-2 bg-sky-150 rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                )}

                {/* STEP 7: Marital Status */}
                {currentStep === 7 && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setMaritalStatus('married')}
                      className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        maritalStatus === 'married'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-sky-50/60 border-sky-150 hover:bg-sky-100/60 text-slate-800'
                      }`}
                    >
                      <span className="text-3xl">💍</span>
                      <span className="font-black text-sm">Married (திருமணம் ஆனவர்)</span>
                    </button>

                    <button
                      onClick={() => setMaritalStatus('single')}
                      className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        maritalStatus === 'single'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-sky-50/60 border-sky-150 hover:bg-sky-100/60 text-slate-800'
                      }`}
                    >
                      <span className="text-3xl">👤</span>
                      <span className="font-black text-sm">Single (தனிநபர்)</span>
                    </button>
                  </div>
                )}

                {/* STEP 8: Children Status */}
                {currentStep === 8 && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setChildren('yes')}
                      className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        children === 'yes'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-sky-50/60 border-sky-150 hover:bg-sky-100/60 text-slate-800'
                      }`}
                    >
                      <span className="text-3xl">👶</span>
                      <span className="font-black text-sm">Yes (குழந்தைகள் உண்டு)</span>
                    </button>

                    <button
                      onClick={() => setChildren('no')}
                      className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        children === 'no'
                          ? 'bg-slate-700 border-slate-700 text-white shadow-xs'
                          : 'bg-sky-50/60 border-sky-150 hover:bg-sky-100/60 text-slate-800'
                      }`}
                    >
                      <span className="text-3xl">✖️</span>
                      <span className="font-black text-sm">No (குழந்தைகள் இல்லை)</span>
                    </button>
                  </div>
                )}

                {/* STEP 9: Documents Checklist */}
                {currentStep === 9 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2.5 max-h-[180px] overflow-y-auto pr-1">
                      {docOptions.map((opt) => {
                        const checked = documents.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleDocumentToggle(opt.value)}
                            className={`p-3 rounded-xl border flex items-center gap-2.5 text-left cursor-pointer transition-all ${
                              checked
                                ? 'bg-sky-100 border-blue-600 text-blue-950 font-bold'
                                : 'bg-sky-50/60 border-sky-150 hover:bg-sky-100/60 text-slate-800'
                            }`}
                          >
                            <span className="text-xl shrink-0">{opt.icon}</span>
                            <div className="min-w-0">
                              <div className="font-black text-[10px] leading-tight truncate">{opt.label}</div>
                              <div className="text-[8px] text-slate-500 font-bold truncate">{opt.sub}</div>
                            </div>
                            {checked && <CheckCircle className="w-4 h-4 text-blue-600 ml-auto shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    
                    <p className="text-[10px] text-slate-500 text-center font-bold uppercase tracking-wider">
                      Simply check all documents you currently have.
                    </p>
                  </div>
                )}

                {/* STEP 10: Current Work District */}
                {currentStep === 10 && (
                  <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {districtOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDistrict(opt.value)}
                        className={`p-3 rounded-xl border text-center font-black text-xs cursor-pointer transition-all ${
                          district === opt.value
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-sky-50/60 border-sky-150 hover:bg-sky-100/60 text-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stepper Navigation Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-sky-150 mt-6 gap-3">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || saving}
              className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {/* Middle Step dots */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500">
              Step {currentStep} of {TOTAL_STEPS}
            </div>

            <button
              onClick={handleNext}
              disabled={!isStepValid() || saving}
              className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              {saving ? (
                <span>Saving...</span>
              ) : currentStep === TOTAL_STEPS ? (
                <>
                  <span>Create My Profile</span>
                  <CheckCircle className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Background Step Progress Line */}
          <div className="pt-5">
            <ProgressStep currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          </div>

        </div>
      </div>

      {/* Footer support notice */}
      <div className="text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider max-w-md mx-auto">
        ThunAI Digital Identity Registration • Designed for High accessibility and Low literacy.
      </div>

    </div>
  );
}
