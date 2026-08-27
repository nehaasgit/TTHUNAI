import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useApp } from '../contexts/AppContext.js';
import { Language } from '../../shared/types.js';
import { Languages, Check } from 'lucide-react';

export default function LanguageSelection() {
  const { language, setLanguage, t } = useApp();
  const navigate = useNavigate();

  const options: { code: Language; name: string; nativeName: string; region: string }[] = [
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu • தமிழ்நாடு' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'North India • उत्तर भारत' },
    { code: 'en', name: 'English', nativeName: 'English', region: 'General • ஆங்கிலம்' }
  ];

  const handleSelect = (code: Language) => {
    setLanguage(code);
  };

  const handleNext = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col justify-between min-h-screen bg-[#f0f6fc] text-slate-900 px-6 py-8 transition-colors duration-200">
      
      {/* Header */}
      <div className="w-full max-w-md mx-auto text-center pt-8">
        <div className="inline-flex p-3 bg-sky-50 text-blue-700 border border-sky-200 rounded-2xl mb-4 shadow-2xs">
          <Languages className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-blue-950">
          {t('select_language')}
        </h2>
        <p className="text-sm text-slate-600 mt-1 font-medium">
          {t('select_language_sub')}
        </p>
      </div>

      {/* Language Card Grid */}
      <div className="w-full max-w-md mx-auto space-y-3.5 my-auto py-8">
        {options.map((opt) => {
          const isSelected = language === opt.code;
          return (
            <motion.button
              key={opt.code}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(opt.code)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer ${
                isSelected
                  ? 'border-blue-600 bg-sky-50 shadow-sm shadow-blue-500/5'
                  : 'border-sky-150 bg-white hover:border-sky-300 shadow-2xs'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xl font-black text-blue-950">
                  {opt.nativeName}
                </span>
                <span className="text-sm font-bold text-blue-700">
                  {opt.name}
                </span>
                <span className="text-xs text-slate-500 mt-1 font-mono font-medium">
                  {opt.region}
                </span>
              </div>

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-sky-200 bg-sky-50'
                }`}
              >
                {isSelected && <Check className="w-4 h-4" strokeWidth={3} />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Next Step Action Button */}
      <div className="w-full max-w-md mx-auto pb-6">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleNext}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-600/15 flex items-center justify-center gap-2 text-base cursor-pointer"
        >
          {t('continue')} &rarr;
        </motion.button>
      </div>

    </div>
  );
}
