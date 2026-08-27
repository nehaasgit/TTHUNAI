import { Database } from '../utils/db.js';
import { AgentContext, TraceLog } from './types.js';

export class ProfileAgent {
  name = 'Profile Intelligence Agent';

  /**
   * Intelligently merges user profile data with document OCR extractions, completing missing information and detecting potential conflicts.
   */
  async execute(context: AgentContext, previousOutput?: any): Promise<{ output: any; confidence: number; logs: TraceLog[]; handoffTo?: string }> {
    const startTime = Date.now();
    const logs: TraceLog[] = [];
    
    logs.push({
      agentName: this.name,
      status: 'started',
      action: 'Profile merge, completion and inconsistency detection',
      timestamp: new Date().toISOString(),
      durationMs: 0,
      input: { userId: context.userId, previousOutput },
      output: null,
      confidence: 0,
    });

    try {
      const userId = context.userId;
      
      // Load current profile & user structures
      const currentProfile = Database.findProfileByUserId(userId);
      const currentUser = Database.findUserById(userId);

      const profileFields = previousOutput?.extractedFields || {};
      const documentType = previousOutput?.documentType || 'Unknown';

      // Setup unified profile data
      const mergedProfile: Record<string, any> = {
        name: profileFields['Name'] || currentProfile?.name || currentUser?.name || '',
        homeState: profileFields['State'] || profileFields['Home State'] || currentProfile?.homeState || currentUser?.stateOfOrigin || '',
        district: profileFields['District'] || currentProfile?.district || currentUser?.currentDistrictInTN || '',
        occupation: profileFields['Worker Category'] || profileFields['Occupation'] || currentProfile?.occupation || currentUser?.industry || '',
        phone: currentProfile?.phone || currentUser?.phoneNumber || '',
        preferredLanguage: currentProfile?.preferredLanguage || currentUser?.nativeLanguage || 'en',
      };

      // Extract age or DOB
      let age = currentProfile?.age || currentUser?.age || 30;
      if (profileFields['Age']) {
        const parsedAge = parseInt(profileFields['Age'], 10);
        if (!isNaN(parsedAge)) age = parsedAge;
      } else if (profileFields['DOB']) {
        // Simple age calculation from DOB if formatted as DD/MM/YYYY or YYYY-MM-DD
        const dobStr = profileFields['DOB'];
        const yearMatch = dobStr.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
          const birthYear = parseInt(yearMatch[0], 10);
          const currentYear = new Date().getFullYear();
          age = currentYear - birthYear;
        }
      }
      mergedProfile.age = age;

      // Detect contradictions/inconsistencies (intelligence requirement)
      const inconsistencies: string[] = [];
      if (profileFields['Name'] && currentProfile?.name && profileFields['Name'].toLowerCase().trim() !== currentProfile.name.toLowerCase().trim()) {
        inconsistencies.push(`Name mismatch: Document states "${profileFields['Name']}", but profile has "${currentProfile.name}".`);
      }
      if ((profileFields['State'] || profileFields['Home State']) && currentProfile?.homeState) {
        const docState = (profileFields['State'] || profileFields['Home State']).toLowerCase().trim();
        const profState = currentProfile.homeState.toLowerCase().trim();
        if (docState !== profState && !profState.includes(docState) && !docState.includes(profState)) {
          inconsistencies.push(`Home State mismatch: Document states "${profileFields['State'] || profileFields['Home State']}", but profile has "${currentProfile.homeState}".`);
        }
      }

      // Save/persist unified profile (as requested)
      const updatedProfile = Database.createOrUpdateProfile(userId, {
        name: mergedProfile.name,
        age: mergedProfile.age,
        homeState: mergedProfile.homeState,
        preferredLanguage: mergedProfile.preferredLanguage,
        district: mergedProfile.district,
        occupation: mergedProfile.occupation,
        phone: mergedProfile.phone
      });

      // Sync user table
      const updatedUser = Database.updateUser(userId, {
        name: updatedProfile.name,
        age: updatedProfile.age,
        stateOfOrigin: updatedProfile.homeState,
        nativeLanguage: updatedProfile.preferredLanguage,
        currentDistrictInTN: updatedProfile.district,
        industry: updatedProfile.occupation,
        profileSetupCompleted: true
      });

      // Also dynamically seed questionnaire responses based on updated profile fields so the rules engine matches perfectly
      let ageValue = '18_to_60';
      if (updatedProfile.age < 18) ageValue = 'under_18';
      if (updatedProfile.age > 60) ageValue = 'above_60';

      let sectorValue = 'other';
      const occLower = updatedProfile.occupation.toLowerCase();
      if (occLower.includes('construct') || occLower.includes('building')) sectorValue = 'construction';
      else if (occLower.includes('textile') || occLower.includes('garment') || occLower.includes('tailor') || occLower.includes('weaver')) sectorValue = 'textile';
      else if (occLower.includes('brick') || occLower.includes('kiln') || occLower.includes('potter')) sectorValue = 'brick_kiln';
      else if (occLower.includes('farm') || occLower.includes('crop') || occLower.includes('cultiv') || occLower.includes('agri')) sectorValue = 'agriculture';

      Database.clearUserResponses(userId);

      Database.createUserResponse({
        id: 'resp_' + Math.random().toString(36).substring(2, 9),
        userId,
        questionId: 'q_age_bracket',
        questionText: 'How old are you?',
        answer: ageValue,
        timestamp: new Date().toISOString()
      });

      Database.createUserResponse({
        id: 'resp_' + Math.random().toString(36).substring(2, 9),
        userId,
        questionId: 'q_work_sector',
        questionText: 'Which sector do you work in?',
        answer: sectorValue,
        timestamp: new Date().toISOString()
      });

      Database.createUserResponse({
        id: 'resp_' + Math.random().toString(36).substring(2, 9),
        userId,
        questionId: 'q_household_income',
        questionText: 'Is your monthly household income less than ₹10,000?',
        answer: 'yes',
        timestamp: new Date().toISOString()
      });

      Database.createUserResponse({
        id: 'resp_' + Math.random().toString(36).substring(2, 9),
        userId,
        questionId: 'q_active_registration',
        questionText: 'Are you registered with the Tamil Nadu Manual Workers Board?',
        answer: 'no',
        timestamp: new Date().toISOString()
      });

      context.user = updatedUser;
      context.userProfile = updatedProfile;

      const output = {
        profile: updatedProfile,
        user: updatedUser,
        inconsistencies,
        mergedFromDocument: Object.keys(profileFields).length > 0,
        documentType,
      };

      // Set high confidence if no inconsistencies, lower if there are major mismatches
      const confidence = inconsistencies.length === 0 ? 1.0 : Math.max(0.4, 1.0 - inconsistencies.length * 0.2);

      const durationMs = Date.now() - startTime;
      logs[0].status = 'completed';
      logs[0].output = output;
      logs[0].confidence = confidence;
      logs[0].durationMs = durationMs;
      logs[0].handoffTo = 'Scheme Eligibility Agent';

      return {
        output,
        confidence,
        logs,
        handoffTo: 'Scheme Eligibility Agent',
      };
    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      logs[0].status = 'failed';
      logs[0].output = { error: error.message || error };
      logs[0].durationMs = durationMs;

      return {
        output: { error: error.message || error },
        confidence: 0.0,
        logs,
      };
    }
  }
}
