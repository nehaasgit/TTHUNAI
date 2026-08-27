import { User, UserProfile, DocumentRecord, GovernmentScheme, VoiceHistory } from '../../shared/types.js';
import { PersonalizedRecommendation } from '../services/recommendationEngine.js';

export interface AgentContext {
  userId: string;
  user?: User;
  userProfile?: UserProfile;
  documentRecord?: DocumentRecord;
  uploadedFileUrl?: string;
  documentTypeHint?: string;
  questionnaireAnswers?: Record<string, string>;
  eligibleSchemeIds?: string[];
  allSchemes?: GovernmentScheme[];
  recommendations?: PersonalizedRecommendation[];
  voiceTranscript?: string;
  voiceLanguage?: 'en' | 'ta' | 'hi';
  voiceResult?: {
    matchedCommand: string;
    targetRoute: string;
    responseSpeechText: string;
    historyItem?: VoiceHistory;
  };
  
  // Cache for avoiding duplicates (performance requirement)
  cache: Record<string, any>;
}

export interface TraceLog {
  agentName: string;
  status: 'started' | 'completed' | 'failed';
  action: string;
  timestamp: string;
  durationMs: number;
  input: any;
  output: any;
  confidence: number;
  handoffTo?: string;
}

export interface ExecutionTrace {
  logs: TraceLog[];
  overallConfidence: number;
  startTime: string;
  endTime?: string;
}
