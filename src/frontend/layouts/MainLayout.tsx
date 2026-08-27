import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext.js';
import { Language } from '../../shared/types.js';
import { 
  LayoutDashboard, 
  BookOpenCheck, 
  FolderLock, 
  User as UserIcon, 
  Settings as SettingsIcon, 
  LogOut, 
  Sun, 
  Moon, 
  Sparkles,
  Handshake
} from 'lucide-react';
import VoiceAssistant from '../components/VoiceAssistant.js';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, theme, toggleTheme, user, logout, t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/select-language');
  };

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/schemes', label: t('schemes'), icon: BookOpenCheck },
    { path: '/documents', label: t('documents'), icon: FolderLock },
    { path: '/profile', label: t('profile'), icon: UserIcon },
    { path: '/settings', label: t('settings'), icon: SettingsIcon }
  ];

  const getPageTitle = () => {
    const item = navItems.find(i => location.pathname === i.path);
    return item ? item.label : 'ThunAI';
  };

  return (
    <div className="min-h-screen bg-[#f0f6fc] text-slate-900 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-sky-150 shrink-0 shadow-xs">
        <div className="p-6 border-b border-sky-100 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-sm">
            <Handshake className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-blue-950 tracking-tight">
              {t('app_name')}
            </h1>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
              {t('active_worker')}
            </p>
          </div>
        </div>

        {/* Worker Summary Widget */}
        {user && (
          <div className="p-3.5 mx-4 my-4 bg-sky-50/70 rounded-2xl border border-sky-200/70 flex items-center gap-3 shadow-2xs">
            <img 
              src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name || 'avatar')}`} 
              alt="Avatar" 
              className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200"
            />
            <div className="truncate">
              <div className="font-bold text-xs truncate text-blue-950">{user.name}</div>
              <div className="text-[10px] font-mono text-slate-500 font-semibold">{user.phoneNumber}</div>
            </div>
          </div>
        )}

        {/* Desktop Nav List */}
        <nav className="flex-1 px-4 space-y-1.5 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-150
                  ${isActive 
                    ? 'bg-sky-100 text-blue-800 border border-sky-200/80 shadow-xs' 
                    : 'text-slate-600 hover:bg-sky-50 hover:text-blue-900 border border-transparent'}
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Operations */}
        <div className="p-4 border-t border-sky-100 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-sky-50 hover:text-blue-950 transition-colors"
          >
            <span className="flex items-center gap-2">
              {theme === 'light' ? <Moon className="w-4 h-4 text-blue-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
              Theme
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {theme}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-bold text-sm cursor-pointer transition-colors"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content viewport */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden pb-20 md:pb-0 bg-[#f0f6fc]">
        
        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-sky-150 flex items-center justify-between px-6 shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile-only logo mark */}
            <div className="md:hidden p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Handshake className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-base md:text-lg font-black text-blue-950 tracking-tight">
              {getPageTitle()}
            </h2>
          </div>

          {/* Quick Header Widgets */}
          <div className="flex items-center gap-3">
            
            {/* Language Switcher pill */}
            <div className="flex bg-sky-50 rounded-xl p-1 border border-sky-200/80 shadow-2xs">
              {(['ta', 'hi', 'en'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg uppercase transition-all duration-150 ${
                    language === lang
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-blue-900'
                  }`}
                >
                  {lang === 'ta' ? 'தமிழ்' : lang === 'hi' ? 'हिन्दी' : 'En'}
                </button>
              ))}
            </div>

            {/* Quick Dark Mode toggle for mobile */}
            <button
              onClick={toggleTheme}
              className="md:hidden p-2 hover:bg-sky-50 rounded-xl text-slate-600"
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5 text-blue-600" /> : <Sun className="w-4.5 h-4.5 text-amber-500" />}
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f0f6fc]">
          {children}
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/98 backdrop-blur-md border-t border-sky-150 px-2 py-1.5 z-40 flex justify-around items-center shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150
                ${isActive 
                  ? 'text-blue-700 font-black bg-sky-50' 
                  : 'text-slate-500 hover:text-blue-800 font-medium'}
              `}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[9px] uppercase tracking-wider">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Floating Companion AI */}
      <VoiceAssistant />

    </div>
  );
}
