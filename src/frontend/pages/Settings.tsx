import React from 'react';
import { useApp } from '../contexts/AppContext.js';
import { Language } from '../../shared/types.js';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Languages, 
  Moon, 
  Sun, 
  HelpCircle, 
  PhoneCall, 
  RefreshCw, 
  Info, 
  AlertCircle
} from 'lucide-react';

export default function Settings() {
  const { 
    language, 
    setLanguage, 
    voiceLanguage, 
    setVoiceLanguage, 
    textSize, 
    setTextSize, 
    highContrastMode, 
    setHighContrastMode, 
    theme, 
    toggleTheme, 
    user, 
    logout, 
    t 
  } = useApp();

  const handleResetApp = () => {
    if (confirm('This will wipe your local ThunAI session so you can test the OTP, Language selection, and Onboarding profile setup from the start. Proceed?')) {
      logout();
      window.location.href = '/';
    }
  };

  const supportContacts = [
    { title: 'Toll-Free Labor Welfare Helpline', value: '155214', desc: 'Tamil Nadu Government unorganised labor support' },
    { title: 'National Migrant Helpline', value: '1800 345 2000', desc: 'Central migrant workers welfare' },
    { title: 'Medical Assistance Care', value: '104', desc: 'Tamil Nadu state health services support' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* 1. Language Adjustment Card */}
      <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm shadow-blue-900/5">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Languages className="w-5 h-5 text-blue-600" />
          {t('select_language')}
        </h3>

        <div className="grid grid-cols-3 gap-3.5">
          {([
            { code: 'ta', label: 'தமிழ் (Tamil)' },
            { code: 'hi', label: 'हिन्दी (Hindi)' },
            { code: 'en', label: 'English (English)' }
          ] as { code: Language; label: string }[]).map((opt) => (
            <button
              key={opt.code}
              onClick={() => setLanguage(opt.code)}
              className={`p-4 rounded-xl border-2 font-bold text-xs text-center transition cursor-pointer ${
                language === opt.code
                  ? 'border-blue-600 bg-sky-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 shadow-sm shadow-blue-600/10'
                  : 'border-sky-100 dark:border-slate-800 bg-sky-50/40 dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:border-blue-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Accessibility & Display Preferences */}
      <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm shadow-blue-900/5">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-200 uppercase tracking-wider border-b border-sky-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-blue-600" />
          Accessibility & Display Settings
        </h3>

        {/* Theme Mode Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-sky-50 dark:border-slate-850">
          <div>
            <span className="text-xs font-extrabold block text-slate-900 dark:text-slate-200">
              {theme === 'light' ? t('light_mode') : t('dark_mode')}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 font-semibold">
              Adjust page colors for better reading in daylight or nighttime.
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-sky-200 dark:bg-slate-800'
            }`}
          >
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center text-slate-600 ${
              theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
            }`}>
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-blue-600" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            </div>
          </button>
        </div>

        {/* High Contrast Mode Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-sky-50 dark:border-slate-850">
          <div>
            <span className="text-xs font-extrabold block text-slate-900 dark:text-slate-200">
              {t('high_contrast_mode')}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 font-semibold">
              Enable pure black/white maximum contrast for easier visibility.
            </span>
          </div>

          <button
            onClick={() => setHighContrastMode(!highContrastMode)}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              highContrastMode ? 'bg-blue-600' : 'bg-sky-200 dark:bg-slate-800'
            }`}
          >
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center text-slate-600 ${
              highContrastMode ? 'translate-x-6' : 'translate-x-0'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${highContrastMode ? 'bg-blue-600' : 'bg-slate-300'}`} />
            </div>
          </button>
        </div>

        {/* Text Font Size Adjuster */}
        <div className="py-2 border-b border-sky-50 dark:border-slate-850 space-y-3">
          <div>
            <span className="text-xs font-extrabold block text-slate-900 dark:text-slate-200">
              {t('text_size')}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 font-semibold block">
              Scale all text labels up for extra clear readability without glasses.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([
              { size: 'normal', label: 'A (Normal)' },
              { size: 'large', label: 'A+ (Large)' },
              { size: 'extra-large', label: 'A++ (Extra-Large)' }
            ] as const).map((opt) => (
              <button
                key={opt.size}
                onClick={() => setTextSize(opt.size)}
                className={`p-3 rounded-xl border-2 font-extrabold text-[11px] text-center transition cursor-pointer ${
                  textSize === opt.size
                    ? 'border-blue-600 bg-sky-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400'
                    : 'border-sky-100 dark:border-slate-850 bg-sky-50/40 dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:border-blue-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Audio Language Selector */}
        <div className="py-2 space-y-3">
          <div>
            <span className="text-xs font-extrabold block text-slate-900 dark:text-slate-200">
              {t('voice_language')}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 font-semibold block">
              Choose the dialect used by the Speaker icon to read contents aloud.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([
              { code: 'ta', label: 'தமிழ் (Tamil)' },
              { code: 'hi', label: 'हिन्दी (Hindi)' },
              { code: 'en', label: 'English (English)' }
            ] as { code: Language; label: string }[]).map((opt) => (
              <button
                key={opt.code}
                onClick={() => setVoiceLanguage(opt.code)}
                className={`p-3 rounded-xl border-2 font-extrabold text-[11px] text-center transition cursor-pointer ${
                  voiceLanguage === opt.code
                    ? 'border-blue-600 bg-sky-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400'
                    : 'border-sky-100 dark:border-slate-850 bg-sky-50/40 dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:border-blue-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Official Help & Welfare Hotlines */}
      <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm shadow-blue-900/5">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          Welfare Help & Support
        </h3>

        <div className="space-y-4">
          {supportContacts.map((contact, idx) => (
            <div 
              key={idx} 
              className="flex justify-between items-center p-3 rounded-2xl bg-sky-50/40 dark:bg-slate-950/50 border border-sky-100 dark:border-slate-850"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">{contact.title}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-500 font-semibold">{contact.desc}</span>
              </div>
              <a
                href={`tel:${contact.value.replace(/\s/g, '')}`}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm shadow-blue-600/10"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {contact.value}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Sandbox Testing Controls (Wipe session to retest) */}
      <div className="bg-red-50/40 dark:bg-red-950/5 border border-red-200 dark:border-red-900/10 rounded-3xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
              Developer Sandbox Controls
            </h4>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Wipe your local storage profile to test the initial Splash screen, bilinguality preferences, Phone OTP verification simulator, and Official Onboarding Setup Form from the beginning.
            </p>
            
            <button
              onClick={handleResetApp}
              className="mt-4 flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition active:scale-[0.98] cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Demo Profile & Test Again
            </button>
          </div>
        </div>
      </div>

      {/* Meta App Info */}
      <div className="text-center text-[10px] text-slate-500 dark:text-slate-500 font-medium font-mono pt-4 flex flex-col gap-1 items-center">
        <div>ThunAI • Version 1.0.0 (Foundation Build)</div>
        <div className="flex items-center gap-1">
          <Info className="w-3 h-3 text-blue-600" />
          Tamil Nadu Interstate Migrant Welfare Digital Portal
        </div>
      </div>

    </div>
  );
}
