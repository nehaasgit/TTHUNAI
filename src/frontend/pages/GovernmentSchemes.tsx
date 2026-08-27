import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../contexts/AppContext.js';
import { BookOpenCheck, CheckCircle2, ChevronRight, HelpCircle, FileText, ArrowLeft, HeartHandshake, Info } from 'lucide-react';
import SpeakButton from '../components/SpeakButton.js';
import { getLocalizedScheme } from '../utils/schemeTranslations.js';

export default function GovernmentSchemes() {
  const { user, schemes, fetchSchemes, t, language } = useApp();
  const [selectedScheme, setSelectedScheme] = useState<any>(null);
  const [matchingOnly, setMatchingOnly] = useState(false);
  const [appliedGuide, setAppliedGuide] = useState<string | null>(null);

  useEffect(() => {
    fetchSchemes();
  }, []);

  // Simple auto-matching calculation to simulate AI scheme compatibility
  const checkEligibilityMatch = (scheme: any): boolean => {
    if (!user) return true;
    
    // Board Registration Scheme matches manual labor unorganised sectors
    if (scheme.id === 'tn-scheme-1') {
      return user.industry?.toLowerCase().includes('construction') || 
             user.industry?.toLowerCase().includes('textiles') ||
             user.industry?.toLowerCase().includes('brick') ||
             user.industry?.toLowerCase().includes('manual');
    }
    // CMCHIS matches workers with low-income or unorganised sectors
    if (scheme.id === 'tn-scheme-2') {
      return true; // General unorganised sector
    }
    // Piped water and Transit housing matches specific industrial hubs
    if (scheme.id === 'tn-scheme-3') {
      return user.industry?.toLowerCase().includes('textiles') || 
             user.industry?.toLowerCase().includes('manufacturing') ||
             user.currentDistrictInTN === 'Tiruppur' ||
             user.currentDistrictInTN === 'Kanchipuram';
    }
    return true;
  };

  const handleApplySimulation = (schemeName: string) => {
    setAppliedGuide(schemeName);
    // Auto-timeout success banner
    setTimeout(() => {
      setAppliedGuide(null);
    }, 4500);
  };

  const filteredSchemes = matchingOnly 
    ? schemes.filter(s => checkEligibilityMatch(s))
    : schemes;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-white border border-sky-150 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-blue-950 flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-blue-600" />
            {t('schemes_title')}
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl font-medium">
            {t('schemes_intro')}
          </p>
        </div>

        {/* Dynamic toggle to only show matching schemes */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="text-xs font-bold text-slate-600">
            Show Matches Only
          </label>
          <button
            onClick={() => setMatchingOnly(!matchingOnly)}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              matchingOnly ? 'bg-blue-600' : 'bg-sky-150'
            }`}
          >
            <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform duration-200 ${
              matchingOnly ? 'translate-x-5.5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Success Apply Toast Overlay */}
      <AnimatePresence>
        {appliedGuide && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-emerald-600 text-white font-bold rounded-2xl flex items-center gap-3 shadow-md text-xs"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <span>{t('applied_success')}</span>
              <p className="font-normal text-[10px] text-emerald-100 mt-0.5">
                Our AI Agent has prepared custom local guidelines for applying to "{appliedGuide}". Download the checklist below.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredSchemes.map((rawScheme) => {
          const scheme = getLocalizedScheme(rawScheme, language);
          const isEligible = checkEligibilityMatch(scheme);
          const textToSpeak = `${scheme.name}. ${scheme.description}. Benefits: ${scheme.benefit}.`;
          return (
            <motion.div
              layout
              key={scheme.id}
              className={`bg-white border rounded-3xl p-6 transition-all shadow-xs ${
                isEligible 
                  ? 'border-sky-150' 
                  : 'border-sky-100 opacity-75'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-1.5 flex-1 w-full">
                  
                  {/* Title and Speaker icon */}
                  <div className="flex items-start gap-3">
                    <h3 className="font-black text-blue-950 text-base md:text-lg leading-snug flex-1">
                      {scheme.name}
                    </h3>
                    <SpeakButton text={textToSpeak} size="sm" className="shrink-0" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <span className="inline-block text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 bg-sky-50 text-blue-700 rounded-md border border-sky-200">
                      {scheme.category}
                    </span>
                    
                    {isEligible ? (
                      <span className="inline-block text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                        Profile Matched
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 bg-sky-50 text-slate-600 rounded-md border border-sky-150">
                        Check Eligibility
                      </span>
                    )}
                  </div>
                </div>

                {/* Benefits Pill */}
                <div className="bg-sky-50 p-3.5 rounded-2xl border border-sky-150 text-left md:text-right shrink-0 max-w-xs w-full md:w-auto">
                  <div className="text-[10px] text-blue-700 font-extrabold uppercase tracking-widest">{t('benefit_label')}</div>
                  <div className="text-xs font-bold text-blue-950 mt-1">{scheme.benefit}</div>
                </div>
              </div>

              {/* Scheme Description */}
              <p className="text-xs text-slate-700 mt-4 leading-relaxed font-medium">
                {scheme.description}
              </p>

              {/* Expandable Section for Application guidelines */}
              <div className="mt-6 pt-4 border-t border-sky-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                <button
                  onClick={() => setSelectedScheme(selectedScheme?.id === scheme.id ? null : scheme)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-4 h-4" />
                  {selectedScheme?.id === scheme.id ? 'Hide Application Steps' : t('how_to_apply')}
                  <ChevronRight className={`w-4 h-4 transform transition-transform ${selectedScheme?.id === scheme.id ? 'rotate-90' : ''}`} />
                </button>

                <button
                  onClick={() => handleApplySimulation(scheme.name)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Generate Apply Guide
                </button>
              </div>

              {/* Expandable Details Container */}
              <AnimatePresence>
                {selectedScheme?.id === scheme.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-sky-50/70 rounded-2xl p-4.5 mt-4 border border-sky-200/80 space-y-4">
                      
                      {/* Eligibility Rules */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-blue-600" />
                          {t('eligibility_label')}
                        </h4>
                        <p className="text-xs font-semibold text-slate-800">
                          {scheme.eligibility}
                        </p>
                      </div>

                      {/* Application Steps */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-600" />
                          {t('how_to_apply')} ({scheme.stepsToApply.length} steps)
                        </h4>
                        <ol className="space-y-2.5">
                          {scheme.stepsToApply.map((step: string, sIdx: number) => (
                            <li key={sIdx} className="flex gap-2.5 text-xs font-semibold text-slate-700">
                              <span className="w-5 h-5 bg-sky-200 text-blue-900 rounded-full flex items-center justify-center shrink-0 font-bold font-mono">
                                {sIdx + 1}
                              </span>
                              <span className="pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
