import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useApp } from '../contexts/AppContext.js';
import { profileService } from '../services/profileService.js';
import { 
  BookOpenCheck, 
  FolderLock, 
  UserCheck, 
  Settings as SettingsIcon, 
  Sparkles, 
  AlertTriangle, 
  PhoneCall, 
  BadgeCheck, 
  FileText,
  ChevronRight,
  Mic,
  Languages,
  Shield,
  Clock,
  Briefcase
} from 'lucide-react';

export default function Dashboard() {
  const { user, token, documents, schemes, fetchDocuments, fetchSchemes, language, t } = useApp();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchDocuments();
    fetchSchemes();
    async function loadDetailedProfile() {
      if (!token) return;
      try {
        const data = await profileService.getProfile(token);
        if (data) setProfile(data);
      } catch (err) {
        console.error('Error loading detailed profile inside dashboard', err);
      }
    }
    loadDetailedProfile();
  }, [token]);

  const getTimeBasedGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning (காலை வணக்கம்)';
    if (hr < 17) return 'Good Afternoon (மதிய வணக்கம்)';
    return 'Good Evening (மாலை வணக்கம்)';
  };

  const getLanguageLabel = (lang: string) => {
    if (lang === 'ta') return 'தமிழ் (Tamil)';
    if (lang === 'hi') return 'हिन्दी (Hindi)';
    return 'English';
  };

  const menuCards = [
    {
      id: 'discovery',
      title: 'Government Benefits',
      subtitle: 'AI Rights Discovery',
      description: 'Find your eligible schemes and welfare benefits with our simple voice-first assistant.',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-500 text-amber-600',
      bgGlow: 'bg-amber-500/10',
      badge: 'Voice AI',
      action: () => navigate('/benefits-discovery')
    },
    {
      id: 'schemes',
      title: t('schemes'),
      subtitle: t('schemes_sub'),
      description: 'Explore Tamil Nadu government financial aid and labor welfare schemes matching your profile.',
      icon: BookOpenCheck,
      color: 'from-blue-600 to-blue-500 text-blue-600',
      bgGlow: 'bg-blue-500/10',
      badge: `${schemes.length || 3} Active`,
      action: () => navigate('/schemes')
    },
    {
      id: 'documents',
      title: t('documents'),
      subtitle: t('documents_sub'),
      description: 'Store and secure your Aadhaar card, Ration card, and Labour ID. Scan with AI OCR.',
      icon: FolderLock,
      color: 'from-green-600 to-emerald-500 text-emerald-600',
      bgGlow: 'bg-emerald-500/10',
      badge: `${documents.length} Safe`,
      action: () => navigate('/documents')
    },
    {
      id: 'profile',
      title: t('profile'),
      subtitle: 'Official ThunAI ID Card',
      description: 'View your digital worker ID card, check registration date, and download your QR verification card.',
      icon: UserCheck,
      color: 'from-purple-600 to-indigo-500 text-indigo-600',
      bgGlow: 'bg-indigo-500/10',
      badge: 'Completed',
      action: () => navigate('/profile')
    },
    {
      id: 'settings',
      title: t('settings'),
      subtitle: 'Languages & Themes',
      description: 'Configure languages, switch between Dark/Light visual modes, and access customer support.',
      icon: SettingsIcon,
      color: 'from-slate-600 to-slate-500 text-slate-600',
      bgGlow: 'bg-slate-500/10',
      badge: 'Config',
      action: () => navigate('/settings')
    }
  ];

  // News bulletin board alerts tailored to unorganised labor in Tamil Nadu
  const safetyBulletin = [
    {
      id: 'bulletin-1',
      tag: 'Minimum Wage',
      text: 'Tamil Nadu Labour Dept announces updated minimum wage rules for unorganised manual sector workers.',
      date: 'Today'
    },
    {
      id: 'bulletin-2',
      tag: 'Helpline Support',
      text: 'Toll-free interstate worker hotline 155214 is active 24/7 for support, complaints, and rights guidance.',
      date: 'Active'
    },
    {
      id: 'bulletin-3',
      tag: 'Free Medical Camp',
      text: 'Free general health checkup camps organized in Tiruppur and Kanchipuram manufacturing hubs.',
      date: 'Weekly'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Worker Hero Banner Greeting & Quick Actions */}
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-800 to-sky-700 text-white p-6 md:p-8 rounded-[2rem] shadow-md shadow-blue-950/10 border border-blue-600"
        >
          {/* Decorative background vectors */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_55%)]"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-sky-400/10 rounded-full blur-3xl"></div>

          <div className="relative space-y-6">
            
            {/* Greeting & Basic Info Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 bg-white/15 px-3 py-1 rounded-full w-fit border border-white/20">
                  <Clock className="w-3.5 h-3.5 text-sky-200" />
                  <span className="text-[9px] uppercase tracking-widest font-extrabold text-white">
                    {getTimeBasedGreeting()}
                  </span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  {t('welcome')}, {profile?.name || user?.name || 'Worker'}
                </h1>
                
                <p className="text-xs text-sky-100 mt-1 max-w-xl font-medium">
                  ThunAI companion is here to assist your housing, healthcare, and financial security in Tamil Nadu.
                </p>
              </div>

              {/* Status Badge */}
              <div className="bg-white/15 px-4 py-2.5 rounded-2xl border border-white/20 flex items-center gap-2.5 self-stretch md:self-auto justify-center">
                <BadgeCheck className="w-5 h-5 text-emerald-300" />
                <div className="text-left">
                  <div className="text-[9px] text-sky-100 font-bold uppercase tracking-wider">ThunAI ID</div>
                  <div className="text-xs font-mono font-black text-white">THUNAI-ACTIVE</div>
                </div>
              </div>
            </div>

            {/* Profile Meta Info Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border-t border-white/15 pt-5 text-xs">
              <div className="flex items-center gap-2 bg-white/10 p-2.5 rounded-xl border border-white/10">
                <Briefcase className="w-4 h-4 text-sky-200 shrink-0" />
                <div>
                  <div className="text-[8px] uppercase font-bold text-sky-200">Occupation</div>
                  <div className="font-extrabold truncate max-w-[120px] text-white">{profile?.occupation || 'Construction'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/10 p-2.5 rounded-xl border border-white/10">
                <Languages className="w-4 h-4 text-sky-200 shrink-0" />
                <div>
                  <div className="text-[8px] uppercase font-bold text-sky-200">Language</div>
                  <div className="font-extrabold text-white">{getLanguageLabel(profile?.preferredLanguage || language)}</div>
                </div>
              </div>

              <div className="col-span-2 md:col-span-1 flex items-center gap-2 bg-white/10 p-2.5 rounded-xl border border-white/10">
                <Shield className="w-4 h-4 text-emerald-300 shrink-0" />
                <div>
                  <div className="text-[8px] uppercase font-bold text-sky-200">Identity Status</div>
                  <div className="font-extrabold text-emerald-300">Verified Worker</div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Quick Action Buttons (4 Buttons Grid) */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Quick Button 1: Benefits */}
            <button
              onClick={() => navigate('/benefits-discovery')}
              className="bg-white border border-sky-150 hover:border-blue-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer shadow-xs active:scale-95 group"
            >
              <div className="p-3 bg-sky-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all border border-sky-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-blue-950">Welfare Benefits</span>
            </button>

            {/* Quick Button 2: Documents */}
            <button
              onClick={() => navigate('/documents')}
              className="bg-white border border-sky-150 hover:border-blue-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer shadow-xs active:scale-95 group"
            >
              <div className="p-3 bg-sky-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all border border-sky-100">
                <FolderLock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-blue-950">My Documents</span>
            </button>

            {/* Quick Button 3: Voice Assistant */}
            <button
              onClick={() => navigate('/voice-assistant')}
              className="bg-white border border-sky-150 hover:border-blue-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer shadow-xs active:scale-95 group"
            >
              <div className="p-3 bg-sky-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all border border-sky-100">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-blue-950">Voice Assistant</span>
            </button>

            {/* Quick Button 4: Emergency Call */}
            <a
              href="tel:155214"
              className="bg-red-50/60 border border-red-200/80 hover:border-red-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer shadow-xs active:scale-95 group"
            >
              <div className="p-3 bg-red-100 text-red-700 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all">
                <PhoneCall className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-red-700">Emergency (155214)</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Cards (Bento grid style with large, accessible cards) */}
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-4">
          Main Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {menuCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={card.action}
                className="w-full text-left bg-white border border-sky-150 rounded-3xl p-5 flex items-start gap-4 cursor-pointer hover:border-blue-400 shadow-xs transition-all duration-200"
              >
                {/* Visual Icon Box */}
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-150 text-blue-700 shadow-2xs shrink-0">
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>

                {/* Card Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-extrabold text-blue-950 text-base truncate">
                      {card.title}
                    </h4>
                    <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 bg-sky-50 text-blue-700 rounded-full border border-sky-200">
                      {card.badge}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                    {card.subtitle}
                  </div>
                  <p className="text-xs text-slate-600 mt-2 font-medium line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 3. Safety Bulletin & Quick Emergency Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Tamil Nadu Labor Safety News Board */}
        <div className="lg:col-span-8 bg-white border border-sky-150 rounded-3xl p-6 shadow-xs">
          <h4 className="font-extrabold text-sm text-blue-950 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
            TN Labor Bulletin Board
          </h4>
          
          <div className="space-y-3">
            {safetyBulletin.map((item) => (
              <div 
                key={item.id} 
                className="flex items-start gap-3.5 p-3.5 rounded-2xl hover:bg-sky-50/70 border border-sky-100 transition-all duration-150"
              >
                <div className="bg-sky-50 text-blue-800 border border-sky-200 px-2.5 py-1 text-[10px] font-bold rounded-lg tracking-wider uppercase shrink-0">
                  {item.tag}
                </div>
                <div className="flex-1 text-xs font-semibold text-slate-700 leading-relaxed">
                  {item.text}
                </div>
                <div className="text-[10px] text-slate-500 font-bold shrink-0">
                  {item.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Assistance Call Box */}
        <div className="lg:col-span-4 bg-red-50/70 border border-red-200 rounded-3xl p-6 flex flex-col justify-between gap-4 shadow-xs">
          <div>
            <h4 className="font-bold text-red-800 flex items-center gap-2 text-sm uppercase tracking-wider">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
              Need Urgent Help?
            </h4>
            <p className="text-xs text-slate-700 mt-2 font-medium leading-relaxed">
              If you have any issues with salary, housing, work safety, or health issues in Tamil Nadu, tap to connect with official helplines instantly.
            </p>
          </div>
          
          <a
            href="tel:155214"
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-sm active:scale-[0.98] transition-all"
          >
            <PhoneCall className="w-4.5 h-4.5" />
            Call Labor Helpline (155214)
          </a>
        </div>

      </div>

    </div>
  );
}
