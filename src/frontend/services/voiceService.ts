import { VoiceHistory } from '../../shared/types.js';

export const voiceService = {
  /**
   * Process spoken voice transcript to match command and retrieve localized audio/text response
   */
  async processVoiceCommand(
    token: string, 
    transcript: string, 
    language: 'en' | 'ta' | 'hi'
  ): Promise<{ 
    success: boolean; 
    matchedCommand?: string; 
    targetRoute?: string; 
    responseSpeechText?: string; 
    historyItem?: VoiceHistory;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/profile/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transcript, language })
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to process voice command' };
      }
      return {
        success: true,
        matchedCommand: data.matchedCommand,
        targetRoute: data.targetRoute,
        responseSpeechText: data.responseSpeechText,
        historyItem: data.historyItem
      };
    } catch (error) {
      console.error('Error processing voice command:', error);
      return { success: false, error: 'Voice command processor offline' };
    }
  },

  /**
   * Fetch voice assistant conversation logging history
   */
  async getVoiceHistory(token: string): Promise<VoiceHistory[]> {
    try {
      const response = await fetch('/api/profile/voice/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('Error fetching voice history:', error);
      return [];
    }
  }
};
