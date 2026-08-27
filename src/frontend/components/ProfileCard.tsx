import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Languages, 
  FileText, 
  Heart, 
  Baby, 
  Calendar, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles,
  Phone
} from 'lucide-react';
import { UserProfile } from '../../shared/types.js';

interface ProfileCardProps {
  profile: UserProfile;
  onEditClick: () => void;
}

export default function ProfileCard({ profile, onEditClick }: ProfileCardProps) {
  const getLanguageLabel = (lang: string) => {
    if (lang === 'ta') return 'தமிழ் (Tamil)';
    if (lang === 'hi') return 'हिन्दी (Hindi)';
    return 'English';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 w-full"
    >
      {/* Visual Header / Welcome Card */}
      <div className="bg-blue-600 text-white rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar frame */}
          <div className="w-20 h-20 rounded-2xl bg-white/15 border border-white/25 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(profile.name || 'rajesh')}`}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-black tracking-tight truncate max-w-[250px]">
                {profile.name}
              </h2>
              <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-white/30 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-sky-200 rounded-full animate-pulse"></span>
                Verified Profile
              </span>
            </div>
            
            <p className="text-xs text-sky-100 font-semibold flex items-center justify-center sm:justify-start gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-sky-200" />
              <span>{profile.occupation} Sector</span>
            </p>
          </div>

          <button
            onClick={onEditClick}
            className="px-5 py-2.5 bg-white text-blue-700 hover:bg-sky-50 text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1 self-center active:scale-95 transition-all"
          >
            <span>Update Profile</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of details cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Core Personal details */}
        <div className="bg-white border border-sky-150 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-sky-100 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-black text-sm text-blue-950">Personal Details</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Age</span>
              <span className="font-bold text-blue-950">{profile.age} years</span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Gender</span>
              <span className="font-bold text-blue-950 capitalize">{profile.gender}</span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Preferred Language</span>
              <span className="font-bold text-blue-950 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-blue-600" />
                {getLanguageLabel(profile.preferredLanguage)}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Phone Number</span>
              <span className="font-bold text-blue-950 flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                {profile.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Work & Location */}
        <div className="bg-white border border-sky-150 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-sky-100 pb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="font-black text-sm text-blue-950">Work & Location</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Home State</span>
              <span className="font-bold text-blue-950">{profile.homeState}</span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Current District</span>
              <span className="font-bold text-blue-950">{profile.district} (Tamil Nadu)</span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Occupation Sector</span>
              <span className="font-bold text-blue-950">{profile.occupation}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Family status */}
        <div className="bg-white border border-sky-150 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-sky-100 pb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-blue-600" />
            <h3 className="font-black text-sm text-blue-950">Family & Household</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Marital Status</span>
              <span className="font-bold text-blue-950 capitalize">{profile.maritalStatus}</span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Children</span>
              <span className="font-bold text-blue-950 flex items-center gap-1 capitalize">
                <Baby className="w-3.5 h-3.5 text-blue-600" />
                {profile.children === 'yes' ? 'Has children' : 'No children'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Documents and identification checks */}
        <div className="bg-white border border-sky-150 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-sky-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-black text-sm text-blue-950">Registered Documents</h3>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {profile.documents && profile.documents.length > 0 ? (
              profile.documents.map((doc, idx) => (
                <span 
                  key={idx}
                  className="bg-sky-50 text-blue-800 border border-sky-200 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  {doc}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 font-medium italic">No active cards checked. Open onboarding to set up.</span>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
