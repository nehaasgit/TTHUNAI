import fs from 'fs';
import path from 'path';
import { User, DocumentRecord, UserResponse, UserEligibility, SavedScheme, UserProfile, VoiceHistory, VoiceCommand } from '../../shared/types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json');
const ELIGIBILITY_FILE = path.join(DATA_DIR, 'eligibility.json');
const SAVED_SCHEMES_FILE = path.join(DATA_DIR, 'saved_schemes.json');
const USER_PROFILES_FILE = path.join(DATA_DIR, 'user_profiles.json');
const VOICE_HISTORY_FILE = path.join(DATA_DIR, 'voice_history.json');
const VOICE_COMMANDS_FILE = path.join(DATA_DIR, 'voice_commands.json');

// Ensure data directory and files exist
function ensureDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(DOCUMENTS_FILE)) {
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(RESPONSES_FILE)) {
    fs.writeFileSync(RESPONSES_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(ELIGIBILITY_FILE)) {
    fs.writeFileSync(ELIGIBILITY_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(SAVED_SCHEMES_FILE)) {
    fs.writeFileSync(SAVED_SCHEMES_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(USER_PROFILES_FILE)) {
    fs.writeFileSync(USER_PROFILES_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(VOICE_HISTORY_FILE)) {
    fs.writeFileSync(VOICE_HISTORY_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(VOICE_COMMANDS_FILE)) {
    // Seed default voice commands
    const defaultCommands: VoiceCommand[] = [
      { id: 'vc_1', commandName: 'Show my benefits', keywords: ['benefit', 'benefits', 'scheme', 'schemes', 'eligibility', 'eligible', 'money', 'help', 'rights', 'திட்டங்கள்', 'योजनाएं'], targetRoute: '/benefits-discovery', isActive: true },
      { id: 'vc_2', commandName: 'Open my documents', keywords: ['document', 'documents', 'aadhaar', 'ration', 'card', 'upload', 'vault', 'pdf', 'id', 'பெட்டகம்', 'वॉल्ट'], targetRoute: '/documents', isActive: true },
      { id: 'vc_3', commandName: 'Nearest hospital', keywords: ['hospital', 'doctor', 'medical', 'clinic', 'health', 'sick', 'injury'], targetRoute: '/dashboard', isActive: true },
      { id: 'vc_4', commandName: 'Translate', keywords: ['translate', 'language', 'speak', 'hindi', 'tamil', 'english', 'talk', 'setting', 'settings', 'அமைப்புகள்', 'सेटिंग्स'], targetRoute: '/settings', isActive: true },
      { id: 'vc_5', commandName: 'My profile', keywords: ['profile', 'name', 'details', 'card', 'id card', 'identity', 'me', 'info', 'சுயவிவரம்', 'प्रोफाइल'], targetRoute: '/profile', isActive: true },
      { id: 'vc_6', commandName: 'Emergency help', keywords: ['emergency', 'police', 'ambulance', 'fire', 'danger', 'sos', 'help me', 'accident'], targetRoute: '/dashboard', isActive: true },
      { id: 'vc_7', commandName: 'Salary', keywords: ['salary', 'pay', 'wage', 'wages', 'money', 'earn', 'hours', 'employer'], targetRoute: '/dashboard', isActive: true },
      { id: 'vc_8', commandName: 'Complaint', keywords: ['complaint', 'police', 'abuse', 'cheat', 'fight', 'owner', 'law', 'legal'], targetRoute: '/dashboard', isActive: true },
      { id: 'vc_9', commandName: 'Home', keywords: ['home', 'dashboard', 'முகப்பு', 'होम'], targetRoute: '/dashboard', isActive: true }
    ];
    fs.writeFileSync(VOICE_COMMANDS_FILE, JSON.stringify(defaultCommands, null, 2), 'utf-8');
  } else {
    // Force rewrite default voice commands to ensure latest Tamil/Hindi keywords are loaded
    const defaultCommands: VoiceCommand[] = [
      { id: 'vc_1', commandName: 'Show my benefits', keywords: ['benefit', 'benefits', 'scheme', 'schemes', 'eligibility', 'eligible', 'money', 'help', 'rights', 'திட்டங்கள்', 'योजनाएं'], targetRoute: '/benefits-discovery', isActive: true },
      { id: 'vc_2', commandName: 'Open my documents', keywords: ['document', 'documents', 'aadhaar', 'ration', 'card', 'upload', 'vault', 'pdf', 'id', 'பெட்டகம்', 'वॉल्ट'], targetRoute: '/documents', isActive: true },
      { id: 'vc_3', commandName: 'Nearest hospital', keywords: ['hospital', 'doctor', 'medical', 'clinic', 'health', 'sick', 'injury'], targetRoute: '/dashboard', isActive: true },
      { id: 'vc_4', commandName: 'Translate', keywords: ['translate', 'language', 'speak', 'hindi', 'tamil', 'english', 'talk', 'setting', 'settings', 'அமைப்புகள்', 'सेटिंग्स'], targetRoute: '/settings', isActive: true },
      { id: 'vc_5', commandName: 'My profile', keywords: ['profile', 'name', 'details', 'card', 'id card', 'identity', 'me', 'info', 'சுயவிவரம்', 'प्रोफाइल'], targetRoute: '/profile', isActive: true },
      { id: 'vc_6', commandName: 'Emergency help', keywords: ['emergency', 'police', 'ambulance', 'fire', 'danger', 'sos', 'help me', 'accident'], targetRoute: '/dashboard', isActive: true },
      { id: 'vc_7', commandName: 'Salary', keywords: ['salary', 'pay', 'wage', 'wages', 'money', 'earn', 'hours', 'employer'], targetRoute: '/dashboard', isActive: true },
      { id: 'vc_8', commandName: 'Complaint', keywords: ['complaint', 'police', 'abuse', 'cheat', 'fight', 'owner', 'law', 'legal'], targetRoute: '/dashboard', isActive: true },
      { id: 'vc_9', commandName: 'Home', keywords: ['home', 'dashboard', 'முகப்பு', 'होम'], targetRoute: '/dashboard', isActive: true }
    ];
    fs.writeFileSync(VOICE_COMMANDS_FILE, JSON.stringify(defaultCommands, null, 2), 'utf-8');
  }
}

export class Database {
  static getUsers(): User[] {
    ensureDatabase();
    try {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(content) as User[];
    } catch (e) {
      console.error('Error reading users database', e);
      return [];
    }
  }

  static saveUsers(users: User[]): void {
    ensureDatabase();
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing users database', e);
    }
  }

  static findUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  static findUserByPhoneNumber(phoneNumber: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.phoneNumber === phoneNumber) || null;
  }

  static createUser(user: User): User {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
    return user;
  }

  static updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    return users[index];
  }

  static getDocuments(): DocumentRecord[] {
    ensureDatabase();
    try {
      const content = fs.readFileSync(DOCUMENTS_FILE, 'utf-8');
      return JSON.parse(content) as DocumentRecord[];
    } catch (e) {
      console.error('Error reading documents database', e);
      return [];
    }
  }

  static saveDocuments(docs: DocumentRecord[]): void {
    ensureDatabase();
    try {
      fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(docs, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing documents database', e);
    }
  }

  static findDocumentsByUserId(userId: string): DocumentRecord[] {
    const docs = this.getDocuments();
    return docs.filter(d => d.userId === userId);
  }

  static createDocument(doc: DocumentRecord): DocumentRecord {
    const docs = this.getDocuments();
    docs.push(doc);
    this.saveDocuments(docs);
    return doc;
  }

  static deleteDocument(docId: string, userId: string): boolean {
    const docs = this.getDocuments();
    const filtered = docs.filter(d => !(d.id === docId && d.userId === userId));
    if (filtered.length === docs.length) return false;
    this.saveDocuments(filtered);
    return true;
  }

  // --- USER RESPONSES (FOR DISCOVERY QUESTIONNAIRE FLOW) ---
  static getResponses(): UserResponse[] {
    ensureDatabase();
    try {
      const content = fs.readFileSync(RESPONSES_FILE, 'utf-8');
      return JSON.parse(content) as UserResponse[];
    } catch (e) {
      console.error('Error reading responses database', e);
      return [];
    }
  }

  static saveResponses(resps: UserResponse[]): void {
    ensureDatabase();
    try {
      fs.writeFileSync(RESPONSES_FILE, JSON.stringify(resps, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing responses database', e);
    }
  }

  static getUserResponses(userId: string): UserResponse[] {
    const resps = this.getResponses();
    return resps.filter(r => r.userId === userId);
  }

  static createUserResponse(resp: UserResponse): UserResponse {
    const resps = this.getResponses();
    resps.push(resp);
    this.saveResponses(resps);
    return resp;
  }

  static clearUserResponses(userId: string): void {
    const resps = this.getResponses();
    const filtered = resps.filter(r => r.userId !== userId);
    this.saveResponses(filtered);
  }

  // --- USER ELIGIBILITY PROFILES ---
  static getEligibilities(): UserEligibility[] {
    ensureDatabase();
    try {
      const content = fs.readFileSync(ELIGIBILITY_FILE, 'utf-8');
      return JSON.parse(content) as UserEligibility[];
    } catch (e) {
      console.error('Error reading eligibility database', e);
      return [];
    }
  }

  static saveEligibilities(eligs: UserEligibility[]): void {
    ensureDatabase();
    try {
      fs.writeFileSync(ELIGIBILITY_FILE, JSON.stringify(eligs, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing eligibility database', e);
    }
  }

  static getUserEligibility(userId: string): UserEligibility | null {
    const eligs = this.getEligibilities();
    return eligs.find(e => e.userId === userId) || null;
  }

  static saveUserEligibility(elig: UserEligibility): UserEligibility {
    const eligs = this.getEligibilities();
    const idx = eligs.findIndex(e => e.userId === elig.userId);
    if (idx !== -1) {
      eligs[idx] = elig;
    } else {
      eligs.push(elig);
    }
    this.saveEligibilities(eligs);
    return elig;
  }

  // --- SAVED / BOOKMARKED SCHEMES ---
  static getSavedSchemes(): SavedScheme[] {
    ensureDatabase();
    try {
      const content = fs.readFileSync(SAVED_SCHEMES_FILE, 'utf-8');
      return JSON.parse(content) as SavedScheme[];
    } catch (e) {
      console.error('Error reading saved schemes database', e);
      return [];
    }
  }

  static saveSavedSchemes(savs: SavedScheme[]): void {
    ensureDatabase();
    try {
      fs.writeFileSync(SAVED_SCHEMES_FILE, JSON.stringify(savs, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing saved schemes database', e);
    }
  }

  static getSavedSchemesByUserId(userId: string): SavedScheme[] {
    const savs = this.getSavedSchemes();
    return savs.filter(s => s.userId === userId);
  }

  static createSavedScheme(userId: string, schemeId: string): SavedScheme {
    const savs = this.getSavedSchemes();
    
    // Check if already exists to prevent duplicates
    const existing = savs.find(s => s.userId === userId && s.schemeId === schemeId);
    if (existing) return existing;

    const newSaved: SavedScheme = {
      id: 'saved_' + Math.random().toString(36).substring(2, 9),
      userId,
      schemeId,
      savedAt: new Date().toISOString()
    };
    savs.push(newSaved);
    this.saveSavedSchemes(savs);
    return newSaved;
  }

  static deleteSavedScheme(userId: string, schemeId: string): boolean {
    const savs = this.getSavedSchemes();
    const filtered = savs.filter(s => !(s.userId === userId && s.schemeId === schemeId));
    if (filtered.length === savs.length) return false;
    this.saveSavedSchemes(filtered);
    return true;
  }

  // --- USER PROFILES ---
  static getUserProfiles(): UserProfile[] {
    ensureDatabase();
    try {
      const content = fs.readFileSync(USER_PROFILES_FILE, 'utf-8');
      return JSON.parse(content) as UserProfile[];
    } catch (e) {
      console.error('Error reading user profiles database', e);
      return [];
    }
  }

  static saveUserProfiles(profiles: UserProfile[]): void {
    ensureDatabase();
    try {
      fs.writeFileSync(USER_PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing user profiles database', e);
    }
  }

  static findProfileByUserId(userId: string): UserProfile | null {
    const profiles = this.getUserProfiles();
    return profiles.find(p => p.userId === userId) || null;
  }

  static createOrUpdateProfile(userId: string, profileData: Partial<UserProfile>): UserProfile {
    const profiles = this.getUserProfiles();
    const index = profiles.findIndex(p => p.userId === userId);
    const now = new Date().toISOString();

    if (index !== -1) {
      profiles[index] = {
        ...profiles[index],
        ...profileData,
        updatedAt: now
      } as UserProfile;
      this.saveUserProfiles(profiles);
      return profiles[index];
    } else {
      const newProfile: UserProfile = {
        id: 'prof_' + Math.random().toString(36).substring(2, 9),
        userId,
        name: profileData.name || '',
        phone: profileData.phone || '',
        preferredLanguage: profileData.preferredLanguage || 'en',
        homeState: profileData.homeState || '',
        occupation: profileData.occupation || '',
        gender: profileData.gender || 'male',
        age: profileData.age || 0,
        maritalStatus: profileData.maritalStatus || 'single',
        children: profileData.children || 'no',
        documents: profileData.documents || [],
        district: profileData.district || '',
        createdAt: now,
        updatedAt: now
      };
      profiles.push(newProfile);
      this.saveUserProfiles(profiles);
      return newProfile;
    }
  }

  // --- VOICE HISTORY ---
  static getVoiceHistory(): VoiceHistory[] {
    ensureDatabase();
    try {
      const content = fs.readFileSync(VOICE_HISTORY_FILE, 'utf-8');
      return JSON.parse(content) as VoiceHistory[];
    } catch (e) {
      console.error('Error reading voice history database', e);
      return [];
    }
  }

  static saveVoiceHistory(history: VoiceHistory[]): void {
    ensureDatabase();
    try {
      fs.writeFileSync(VOICE_HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing voice history database', e);
    }
  }

  static createVoiceHistory(userId: string, item: Omit<VoiceHistory, 'id' | 'timestamp' | 'userId'>): VoiceHistory {
    const history = this.getVoiceHistory();
    const newItem: VoiceHistory = {
      ...item,
      id: 'vh_' + Math.random().toString(36).substring(2, 9),
      userId,
      timestamp: new Date().toISOString()
    };
    history.push(newItem);
    this.saveVoiceHistory(history);
    return newItem;
  }

  static getVoiceHistoryByUserId(userId: string): VoiceHistory[] {
    const history = this.getVoiceHistory();
    return history.filter(h => h.userId === userId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  // --- VOICE COMMANDS ---
  static getVoiceCommands(): VoiceCommand[] {
    ensureDatabase();
    try {
      const content = fs.readFileSync(VOICE_COMMANDS_FILE, 'utf-8');
      return JSON.parse(content) as VoiceCommand[];
    } catch (e) {
      console.error('Error reading voice commands database', e);
      return [];
    }
  }
}
