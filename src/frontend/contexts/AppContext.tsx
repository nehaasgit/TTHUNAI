import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Language, DocumentRecord, GovernmentScheme } from '../../shared/types.js';
import { translations } from '../utils/translations.js';
import i18n from '../i18n.js';

const safeBtoa = (str: string) => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return btoa(str);
  }
};

const createMockJWT = (phoneNumber: string) => {
  try {
    const header = safeBtoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = safeBtoa(JSON.stringify({
      sub: "user_" + phoneNumber.replace(/\D/g, ''),
      uid: "user_" + phoneNumber.replace(/\D/g, ''),
      phone_number: phoneNumber,
      exp: Math.floor(Date.now() / 1000) + 86400 * 30 // 30-day session
    }));
    const signature = "demo_signature";
    return `${header}.${payload}.${signature}`;
  } catch (e) {
    return `demo_token_for_${phoneNumber}`;
  }
};

interface AppContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  voiceLanguage: Language;
  setVoiceLanguage: (lang: Language) => void;
  textSize: 'normal' | 'large' | 'extra-large';
  setTextSize: (size: 'normal' | 'large' | 'extra-large') => void;
  highContrastMode: boolean;
  setHighContrastMode: (enabled: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  sendOtp: (phoneNumber: string) => Promise<{ success: boolean; debugCode?: string; error?: string }>;
  verifyOtp: (phoneNumber: string, code: string) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  setupProfile: (profileData: {
    name: string;
    age: number;
    stateOfOrigin: string;
    nativeLanguage: Language;
    currentDistrictInTN: string;
    industry: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  logout: () => void;
  t: (key: string) => string;
  documents: DocumentRecord[];
  fetchDocuments: () => Promise<void>;
  uploadDocument: (name: string, type: string, fileUrl?: string) => Promise<boolean>;
  deleteDocument: (docId: string) => Promise<boolean>;
  verifyDocument: (docId: string) => Promise<boolean>;
  syncDocumentProfile: (docId: string, profileFields: any) => Promise<{ success: boolean; recommendations?: any; error?: string }>;
  schemes: GovernmentScheme[];
  fetchSchemes: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [voiceLanguage, setVoiceLanguageState] = useState<Language>('en');
  const [textSize, setTextSizeState] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [highContrastMode, setHighContrastModeState] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);

  // Apply dark mode CSS class to html element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Apply accessibility text size overrides to HTML root element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('text-size-large', 'text-size-xl');
    if (textSize === 'large') {
      root.classList.add('text-size-large');
    } else if (textSize === 'extra-large') {
      root.classList.add('text-size-xl');
    }
  }, [textSize]);

  // Apply high contrast override to HTML root element
  useEffect(() => {
    const root = window.document.documentElement;
    if (highContrastMode) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [highContrastMode]);

  // Load initial settings and listen to Firebase Auth changes
  useEffect(() => {
    const savedLanguage = localStorage.getItem('sahaaya_language') as Language;
    if (savedLanguage) setLanguageState(savedLanguage);

    const savedVoiceLanguage = localStorage.getItem('sahaaya_voice_language') as Language;
    if (savedVoiceLanguage) setVoiceLanguageState(savedVoiceLanguage);

    const savedTextSize = localStorage.getItem('sahaaya_text_size') as 'normal' | 'large' | 'extra-large';
    if (savedTextSize) setTextSizeState(savedTextSize);

    const savedHighContrast = localStorage.getItem('sahaaya_high_contrast') === 'true';
    if (savedHighContrast) setHighContrastModeState(savedHighContrast);

    const savedTheme = localStorage.getItem('sahaaya_theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);

    const savedToken = localStorage.getItem('sahaaya_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sahaaya_language', lang);
    i18n.changeLanguage(lang);
    
    if (token && user) {
      updateProfile({
        preferredLanguage: lang,
        nativeLanguage: lang,
        voiceLanguage: lang,
        lastLanguageChanged: new Date().toISOString()
      }).catch(err => console.warn('Failed to sync language update with backend', err));
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('sahaaya_theme', nextTheme);
  };

  const setVoiceLanguage = (lang: Language) => {
    setVoiceLanguageState(lang);
    localStorage.setItem('sahaaya_voice_language', lang);
    if (token && user) {
      updateProfile({
        voiceLanguage: lang
      }).catch(err => console.warn('Failed to sync voice language update', err));
    }
  };

  const setTextSize = (size: 'normal' | 'large' | 'extra-large') => {
    setTextSizeState(size);
    localStorage.setItem('sahaaya_text_size', size);
    if (token && user) {
      updateProfile({
        textSize: size
      }).catch(err => console.warn('Failed to sync text size update', err));
    }
  };

  const setHighContrastMode = (enabled: boolean) => {
    setHighContrastModeState(enabled);
    localStorage.setItem('sahaaya_high_contrast', String(enabled));
    if (token && user) {
      updateProfile({
        highContrastMode: enabled
      }).catch(err => console.warn('Failed to sync high contrast update', err));
    }
  };

  const t = (key: string): string => {
    return i18n.t(key) || key;
  };

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Pre-fetch basic workspace records once logged in
        await Promise.all([fetchDocumentsInternal(authToken), fetchSchemesInternal(authToken)]);
      } else {
        // Stale or invalid token
        logout();
      }
    } catch (e) {
      console.error('Failed to fetch user profile:', e);
    } finally {
      setLoading(false);
    }
  };

  // Static Demo OTP send
  const sendOtp = async (phoneNumber: string): Promise<{ success: boolean; debugCode?: string; error?: string }> => {
    const cleanDigits = phoneNumber.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }

    // Static Demo OTP: 123456
    return { success: true, debugCode: '123456' };
  };

  // Static Demo OTP verification
  const verifyOtp = async (phoneNumber: string, code: string): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> => {
    const cleanOtp = code.replace(/\D/g, '');

    if (cleanOtp.length !== 6) {
      return { success: false, error: 'Please enter the 6-digit OTP.' };
    }

    if (cleanOtp !== '123456') {
      return { success: false, error: 'Invalid OTP. Please try again.' };
    }

    try {
      const cleanDigits = phoneNumber.replace(/\D/g, '').slice(-10);
      const formattedPhoneNumber = '+91' + cleanDigits;
      const idToken = createMockJWT(formattedPhoneNumber);

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('sahaaya_token', data.token);

        if (data.user.profileSetupCompleted) {
          await Promise.all([fetchDocumentsInternal(data.token), fetchSchemesInternal(data.token)]);
        }

        return { success: true, isNewUser: data.isNewUser };
      } else {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error || 'Failed to authenticate session with backend.' };
      }
    } catch (e: any) {
      console.error('Failed to verify OTP:', e);
      return { 
        success: false, 
        error: e?.message || 'Authentication failed. Please try again.' 
      };
    }
  };

  const setupProfile = async (profileData: {
    name: string;
    age: number;
    stateOfOrigin: string;
    nativeLanguage: Language;
    currentDistrictInTN: string;
    industry: string;
  }) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/auth/setup-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        // Set context language to the user's selected native language as a helpful quality detail!
        if (profileData.nativeLanguage) {
          setLanguage(profileData.nativeLanguage);
        }
        await Promise.all([fetchDocumentsInternal(token), fetchSchemesInternal(token)]);
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Profile creation failed' };
      }
    } catch (e) {
      return { success: false, error: 'Network connection lost.' };
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setDocuments([]);
    setSchemes([]);
    localStorage.removeItem('sahaaya_token');
  };


  // Documents internal
  const fetchDocumentsInternal = async (authToken: string) => {
    try {
      const res = await fetch('/api/documents', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
      }
    } catch (e) {
      console.error('Error fetching documents:', e);
    }
  };

  const fetchDocuments = async () => {
    if (token) await fetchDocumentsInternal(token);
  };

  const uploadDocument = async (name: string, type: string, fileUrl?: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, type, fileUrl })
      });
      if (res.ok) {
        await fetchDocumentsInternal(token);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteDocument = async (docId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchDocumentsInternal(token);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const verifyDocument = async (docId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/documents/${docId}/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchDocumentsInternal(token);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const syncDocumentProfile = async (docId: string, profileFields: any): Promise<{ success: boolean; recommendations?: any; error?: string }> => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`/api/documents/${docId}/sync-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profileFields })
      });
      if (res.ok) {
        const data = await res.json();
        // Update user state so UI updates
        setUser(data.user);
        // Refresh documents and matching schemes/benefits automatically without manual intervention
        await Promise.all([
          fetchDocumentsInternal(token),
          fetchSchemesInternal(token)
        ]);
        return { success: true, recommendations: data.recommendations };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Profile sync failed' };
      }
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Network error' };
    }
  };

  // Schemes internal
  const fetchSchemesInternal = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/schemes', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSchemes(data.schemes);
      }
    } catch (e) {
      console.error('Error fetching schemes:', e);
    }
  };

  const fetchSchemes = async () => {
    if (token) await fetchSchemesInternal(token);
  };

  const isAuthenticated = !!token && !!user && user.profileSetupCompleted;

  return (
    <AppContext.Provider
      value={{
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
        token,
        isAuthenticated,
        loading,
        sendOtp,
        verifyOtp,
        setupProfile,
        updateProfile,
        logout,
        t,
        documents,
        fetchDocuments,
        uploadDocument,
        deleteDocument,
        verifyDocument,
        syncDocumentProfile,
        schemes,
        fetchSchemes
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
