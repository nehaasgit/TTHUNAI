import { Request, Response } from 'express';
import { Database } from '../utils/db.js';
import { AgentManager } from '../agents/AgentManager.js';

/**
 * GET PROFILE api controller
 * Fetch profile matching the verified token user ID.
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = Database.findProfileByUserId(userId);
    res.json({ success: true, profile: profile || null });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * CREATE PROFILE api controller
 * Create or overwrite profile fields and sync with core User DB schema.
 */
export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profileData = req.body;
    const profile = Database.createOrUpdateProfile(userId, {
      ...profileData,
      phone: req.user?.phoneNumber || profileData.phone || ''
    });

    // Sync with main User database to make benefits & dashboard seamlessly reflect changes
    Database.updateUser(userId, {
      name: profile.name,
      age: profile.age,
      stateOfOrigin: profile.homeState,
      nativeLanguage: profile.preferredLanguage,
      preferredLanguage: profile.preferredLanguage,
      voiceLanguage: profile.voiceLanguage || profile.preferredLanguage,
      lastLanguageChanged: profile.lastLanguageChanged,
      textSize: profile.textSize,
      highContrastMode: profile.highContrastMode,
      currentDistrictInTN: profile.district,
      industry: profile.occupation,
      profileSetupCompleted: true
    });

    res.status(201).json({ success: true, profile });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * UPDATE PROFILE api controller
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profileData = req.body;
    const profile = Database.createOrUpdateProfile(userId, profileData);

    // Sync with main User database
    Database.updateUser(userId, {
      name: profile.name,
      age: profile.age,
      stateOfOrigin: profile.homeState,
      nativeLanguage: profile.preferredLanguage,
      preferredLanguage: profile.preferredLanguage,
      voiceLanguage: profile.voiceLanguage || profile.preferredLanguage,
      lastLanguageChanged: profile.lastLanguageChanged,
      textSize: profile.textSize,
      highContrastMode: profile.highContrastMode,
      currentDistrictInTN: profile.district,
      industry: profile.occupation,
      profileSetupCompleted: true
    });

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * VOICE COMMAND api controller
 * Matches raw spoken transcript against keywords with a scalable modular architecture.
 * Ready for future Gemini API LLM parsing / Speech-to-Text translation integration.
 */
export const handleVoiceCommand = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { transcript, language } = req.body;
    if (!transcript) {
      res.status(400).json({ error: 'Transcript query is required' });
      return;
    }

    const agentResult = await AgentManager.processRequest({
      userId,
      voiceTranscript: transcript,
      voiceLanguage: language || 'en'
    });

    if (!agentResult.success) {
      res.status(500).json({ error: agentResult.data.error || 'Voice Agent execution failed.' });
      return;
    }

    const voiceData = agentResult.data;

    res.json({
      success: true,
      historyItem: voiceData.historyItem,
      matchedCommand: voiceData.matchedCommand,
      targetRoute: voiceData.targetRoute,
      responseSpeechTextEn: voiceData.responseSpeechTextEn,
      responseSpeechTextTa: voiceData.responseSpeechTextTa,
      responseSpeechTextHi: voiceData.responseSpeechTextHi,
      responseSpeechText: voiceData.responseSpeechText,
      executionTrace: agentResult.executionTrace,
      overallConfidence: agentResult.overallConfidence
    });
  } catch (error) {
    console.error('Error handling voice command via multi-agent orchestrator:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET VOICE HISTORY api controller
 */
export const getVoiceHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const history = Database.getVoiceHistoryByUserId(userId);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error getting voice history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
