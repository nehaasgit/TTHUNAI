export type Language = 'en' | 'ta' | 'hi';

export interface User {
  id: string; // Firebase UID or generated phone-auth ID
  phoneNumber: string;
  name?: string;
  age?: number;
  stateOfOrigin?: string;
  nativeLanguage?: Language;
  currentDistrictInTN?: string;
  industry?: string;
  dateOfRegistration?: string;
  profileSetupCompleted: boolean;
  avatarUrl?: string;
  firebaseUID?: string;
  authenticationProvider?: string;
  preferredLanguage?: Language;
  voiceLanguage?: Language;
  lastLanguageChanged?: string;
  textSize?: 'normal' | 'large' | 'extra-large';
  highContrastMode?: boolean;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  nameTranslated: string;
  category: string;
  benefit: string;
  eligibility: string;
  description: string;
  stepsToApply: string[];
}

export interface DocumentRecord {
  id: string;
  userId: string;
  name: string;
  type: 'Aadhaar' | 'Ration Card' | 'Voter ID' | 'Labour Card' | 'Bank Passbook' | 'Other';
  fileUrl: string;
  uploadedAt: string;
  verified: boolean;
  
  // Extended fields for Phase 5:
  ocrStatus?: 'idle' | 'processing' | 'completed' | 'failed';
  documentType?: string;
  extractedFields?: Record<string, string>;
  confidenceScore?: Record<string, number>;
  profileSynced?: boolean;
  benefitsUpdated?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface UserResponse {
  id: string;
  userId: string;
  questionId: string;
  questionText: string;
  answer: string;
  timestamp: string;
}

export interface UserEligibility {
  id: string;
  userId: string;
  eligibleSchemeIds: string[];
  lastCalculated: string;
}

export interface SavedScheme {
  id: string;
  userId: string;
  schemeId: string;
  savedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  preferredLanguage: Language;
  voiceLanguage?: Language;
  lastLanguageChanged?: string;
  textSize?: 'normal' | 'large' | 'extra-large';
  highContrastMode?: boolean;
  homeState: string;
  occupation: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  maritalStatus: 'married' | 'single';
  children: 'yes' | 'no';
  documents: string[]; // List of document types like ['Aadhaar', 'PAN', 'Labour Card', 'Bank Account', 'Ration Card', 'Voter ID']
  district: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceHistory {
  id: string;
  userId: string;
  transcript: string;
  detectedCommand: string;
  responseLanguage: Language;
  responseSpeechText: string;
  timestamp: string;
}

export interface VoiceCommand {
  id: string;
  commandName: string;
  keywords: string[];
  targetRoute: string;
  isActive: boolean;
}

