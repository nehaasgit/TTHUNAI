import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext.js';
import { profileService } from '../services/profileService.js';
import ProfileCard from '../components/ProfileCard.js';
import { motion } from 'motion/react';
import { 
  User, 
  BadgeCheck, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Languages, 
  Download, 
  Share2, 
  Phone,
  QrCode,
  Sparkles,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { UserProfile } from '../../shared/types.js';

export default function Profile() {
  const { user, token, documents, t } = useApp();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!token) return;
      try {
        const data = await profileService.getProfile(token);
        if (data) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [token]);

  const handlePrintMock = () => {
    window.print();
  };

  const handleShareMock = () => {
    // Elegant copy to clipboard share simulation
    navigator.clipboard.writeText(window.location.href);
    alert('ThunAI Digital Card share link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <span className="text-xs font-bold uppercase tracking-widest">Loading Worker Profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* Description Header */}
      <div className="text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-2 justify-center md:justify-start">
            <UserCheck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            ThunAI Digital Identity
          </h2>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
            Secure digital identity card issued by ThunAI. Present this card or QR code for simple, instant welfare verification.
          </p>
        </div>

        <button
          onClick={() => navigate('/register')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/10 cursor-pointer transition-all active:scale-95"
        >
          Conversational Profile Setup
        </button>
      </div>

      {/* Dynamic Profile details component */}
      {profile ? (
        <ProfileCard profile={profile} onEditClick={() => navigate('/register')} />
      ) : (
        <div className="bg-sky-50/70 dark:bg-blue-950/20 border border-sky-200 dark:border-blue-900/35 rounded-2xl p-6 text-center space-y-4">
          <Sparkles className="w-10 h-10 text-blue-600 mx-auto animate-pulse" />
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-200">You have not completed your conversational profile!</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Let's answer 10 quick verbal questions to customize government benefits, E S I hospitals, and digital identification.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/10 cursor-pointer"
          >
            Start Setup Now
          </button>
        </div>
      )}

      {/* Official Printable Digital Card & QR Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Official ID Card Layout */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div 
            id="sahaaya-id-card-printable"
            className="w-full relative overflow-hidden bg-gradient-to-tr from-blue-900 via-blue-700 to-sky-600 text-white p-6 rounded-[2.5rem] shadow-xl shadow-blue-950/15 border border-sky-300/30 font-sans"
          >
            {/* Design accents */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]"></div>
            <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-sky-400/15 rounded-full blur-2xl"></div>

            {/* Logo/Header */}
            <div className="relative flex justify-between items-center border-b border-white/20 pb-4 mb-5">
              <div>
                <h3 className="text-xl font-black tracking-tight flex items-center gap-1">
                  ThunAI
                </h3>
                <div className="text-[9px] font-mono tracking-widest text-sky-200 uppercase font-bold">
                  Tamil Nadu Worker Companion
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold border border-white/20 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Worker
              </div>
            </div>

            {/* Main Content Layout */}
            <div className="relative grid grid-cols-12 gap-5">
              {/* Profile Avatar / Photo Box */}
              <div className="col-span-4 flex flex-col items-center gap-1.5">
                <div className="w-20 h-20 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden shadow-md backdrop-blur-sm shrink-0">
                  <img 
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || 'rajesh')}`} 
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-[8px] uppercase tracking-widest text-sky-200 font-extrabold text-center font-mono">
                  Verified Photo
                </div>
              </div>

              {/* Identity Details */}
              <div className="col-span-8 space-y-3">
                <div>
                  <div className="text-[8px] text-sky-200 uppercase tracking-widest font-black">Full Name / பெயர்</div>
                  <div className="text-sm font-extrabold tracking-tight text-white truncate">
                    {profile?.name || user?.name || 'Worker'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[8px] text-sky-200 uppercase tracking-widest font-black">Home State</div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {profile?.homeState || user?.stateOfOrigin || 'Not Specified'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] text-sky-200 uppercase tracking-widest font-black">Current District</div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {profile?.district || user?.currentDistrictInTN || 'Not Specified'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[8px] text-sky-200 uppercase tracking-widest font-black">Occupation</div>
                    <div className="text-xs font-bold text-white mt-0.5 truncate">
                      {profile?.occupation || user?.industry?.split(' (')[0] || 'Not Specified'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] text-sky-200 uppercase tracking-widest font-black">Language</div>
                    <div className="text-xs font-bold text-white mt-0.5 capitalize">
                      {profile?.preferredLanguage === 'ta' ? 'தமிழ்' : profile?.preferredLanguage === 'hi' ? 'हिन्दी' : 'English'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Digital Card Footer */}
            <div className="relative mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-sky-100 font-mono">
              <div className="flex flex-col">
                <span className="text-[8px] text-sky-200 uppercase tracking-wider font-semibold">Unique Registration ID</span>
                <span className="font-bold tracking-wider">{user?.id?.toUpperCase() || 'THUNAI-DEV'}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-sky-200 uppercase tracking-wider font-semibold">Join Date</span>
                <span className="font-bold">{user?.dateOfRegistration || '2026-07-09'}</span>
              </div>
            </div>
          </div>

          {/* Quick Operations toolbar */}
          <div className="flex gap-3 w-full mt-5 justify-center">
            <button
              onClick={handlePrintMock}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-300 hover:bg-sky-50 transition shadow-sm cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 text-blue-600" />
              Download Card
            </button>
            <button
              onClick={handleShareMock}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-300 hover:bg-sky-50 transition shadow-sm cursor-pointer active:scale-95"
            >
              <Share2 className="w-4 h-4 text-blue-600" />
              Share Link
            </button>
          </div>
        </div>

        {/* Verification QR & Badges Checklist (Right Column) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Verification QR Card */}
          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-5 flex flex-col items-center text-center shadow-sm shadow-blue-900/5">
            <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-500 dark:text-slate-500 mb-3">
              Instant Scan Code
            </h4>
            <div className="p-3 bg-sky-50/50 dark:bg-slate-950 border border-sky-100 dark:border-slate-800/80 rounded-2xl mb-3 relative overflow-hidden flex items-center justify-center">
              <QrCode className="w-32 h-32 text-slate-900 dark:text-slate-50" strokeWidth={1} />
            </div>
            <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
              Scan this code with any smartphone camera to securely verify your active ThunAI record against our persistent database.
            </p>
          </div>

          {/* Security details checklist */}
          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm shadow-blue-900/5">
            <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-500 dark:text-slate-500 mb-3">
              Welfare Checklist
            </h4>
            
            <div className="space-y-3">
              <div className="flex gap-2.5 items-center">
                <BadgeCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Phone Verification complete</span>
              </div>
              <div className="flex gap-2.5 items-center">
                <BadgeCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">ThunAI Digital Card Generated</span>
              </div>
              <div className="flex gap-2.5 items-center">
                {documents.length > 0 ? (
                  <BadgeCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-4.5 h-4.5 border-2 border-sky-200 dark:border-slate-800 rounded-full shrink-0"></div>
                )}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Secure Document Vault configured</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
