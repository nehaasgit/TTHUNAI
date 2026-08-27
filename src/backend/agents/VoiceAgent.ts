import { Database } from '../utils/db.js';
import { AgentContext, TraceLog } from './types.js';

export class VoiceAgent {
  name = 'Voice Interaction Agent';

  /**
   * Processes voice inputs, maps to specific routes and commands, and generates localized TTS replies.
   */
  async execute(context: AgentContext, previousOutput?: any): Promise<{ output: any; confidence: number; logs: TraceLog[]; handoffTo?: string }> {
    const startTime = Date.now();
    const logs: TraceLog[] = [];
    
    logs.push({
      agentName: this.name,
      status: 'started',
      action: 'Voice query translation and mapping',
      timestamp: new Date().toISOString(),
      durationMs: 0,
      input: { transcript: context.voiceTranscript, language: context.voiceLanguage },
      output: null,
      confidence: 0,
    });

    if (!context.voiceTranscript) {
      const errorMsg = 'No voice transcript provided.';
      const durationMs = Date.now() - startTime;
      logs[0].status = 'failed';
      logs[0].output = { error: errorMsg };
      logs[0].durationMs = durationMs;

      return {
        output: { error: errorMsg },
        confidence: 0.0,
        logs,
      };
    }

    try {
      const userId = context.userId;
      const transcript = context.voiceTranscript;
      const language = context.voiceLanguage || 'en';

      // Match voice commands
      const commands = Database.getVoiceCommands();
      const query = transcript.toLowerCase();
      
      let matchedCommand = 'Unknown';
      let targetRoute = '/dashboard';
      
      let responseSpeechTextEn = `I heard you say: "${transcript}". I couldn't understand that command. Try speaking like 'benefits', 'documents', or 'profile'.`;
      let responseSpeechTextTa = `நீங்கள் கூறியது: "${transcript}". எங்களால் அந்த கட்டளையைப் புரிந்து கொள்ள முடியவில்லை. 'திட்டங்கள்', 'ஆவணங்கள்' அல்லது 'விவரங்கள்' என்று பேசவும்.`;
      let responseSpeechTextHi = `मैंने सुना: "${transcript}"। मुझे वह कमांड समझ नहीं आई। कृपया बोलें: 'लाभ', 'दस्तावेज़', या 'प्रोफ़ाइल'।`;

      for (const cmd of commands) {
        const match = cmd.keywords.some((keyword: string) => query.includes(keyword.toLowerCase()));
        if (match) {
          matchedCommand = cmd.commandName;
          targetRoute = cmd.targetRoute;
          
          if (cmd.commandName === 'Show my benefits') {
            responseSpeechTextEn = "Finding your government benefits matching cards.";
            responseSpeechTextTa = "உங்களுக்குப் பொருந்தும் அரசு நல வாரிய உதவித்தொகைகளைக் கண்டறிகிறேன்.";
            responseSpeechTextHi = "आपकी योग्य सरकारी कल्याण योजनाओं की खोज की जा रही है।";
          } else if (cmd.commandName === 'Open my documents') {
            responseSpeechTextEn = "Opening your secure documents vault.";
            responseSpeechTextTa = "உங்கள் ஆவணக் காப்பகத்தைத் திறக்கிறேன்.";
            responseSpeechTextHi = "आपका सुरक्षित दस्तावेज वॉल्ट खोला जा रहा है।";
          } else if (cmd.commandName === 'Nearest hospital') {
            responseSpeechTextEn = "Searching nearest E S I Hospital and government welfare clinic.";
            responseSpeechTextTa = "அருகிலுள்ள தொழிலாளர் நல அரசு மருத்துவமனையைத் தேடுகிறேன்.";
            responseSpeechTextHi = "निकटतम सरकारी कल्याण अस्पताल की खोज की जा रही है।";
          } else if (cmd.commandName === 'Translate') {
            responseSpeechTextEn = "Opening language translation and settings page.";
            responseSpeechTextTa = "மொழி அமைப்புகள் பக்கத்தைத் திறக்கிறேன்.";
            responseSpeechTextHi = "भाषा अनुवाद सेटिंग्स पेज को खोला जा रहा है।";
          } else if (cmd.commandName === 'My profile') {
            responseSpeechTextEn = "Displaying your ThunAI worker identity profile card.";
            responseSpeechTextTa = "உங்கள் துன் அடையாள அட்டை சுயவிவரத்தைக் காட்டுகிறேன்.";
            responseSpeechTextHi = "आपका थुन श्रमिक पहचान पत्र दिखाया जा रहा है।";
          } else if (cmd.commandName === 'Emergency help') {
            responseSpeechTextEn = "Dialing official emergency support helpline.";
            responseSpeechTextTa = "புலம்பெயர் தொழிலாளர்கள் அவசர உதவி எண்ணை அழைக்கிறேன்.";
            responseSpeechTextHi = "प्रवासी श्रमिक आपातकालीन हेल्पलाइन नंबर डायल किया जा रहा है।";
          } else if (cmd.commandName === 'Salary') {
            responseSpeechTextEn = "Opening your work logs and salary summary tracker.";
            responseSpeechTextTa = "உங்கள் வேலை நேரம் மற்றும் சம்பளக் கணக்கு பதிவேட்டைத் திறக்கிறேன்.";
            responseSpeechTextHi = "आपके वेतन और कार्य समय का सारांश खोला जा रहा है।";
          } else if (cmd.commandName === 'Complaint') {
            responseSpeechTextEn = "Connecting you to the legal cell and labor complaints portal.";
            responseSpeechTextTa = "தொழிலாளர் நலப் புகார் மற்றும் சட்ட உதவி மையத்துடன் இணைக்கிறேன்.";
            responseSpeechTextHi = "श्रम शिकायत एवं कानूनी सहायता पोर्टल से आपको जोड़ा जा रहा है।";
          } else if (cmd.commandName === 'Home') {
            responseSpeechTextEn = "Navigating to home dashboard screen.";
            responseSpeechTextTa = "முகப்பு பக்கத்திற்குச் செல்கிறேன்.";
            responseSpeechTextHi = "मुख्य डैशबोर्ड पर वापस जा रहे हैं।";
          }
          break;
        }
      }

      const responseSpeechText = language === 'ta' ? responseSpeechTextTa : language === 'hi' ? responseSpeechTextHi : responseSpeechTextEn;

      // Log to voice command history using existing DB method
      const historyItem = Database.createVoiceHistory(userId, {
        transcript,
        detectedCommand: matchedCommand,
        responseLanguage: language,
        responseSpeechText
      });

      const voiceResult = {
        matchedCommand,
        targetRoute,
        responseSpeechText,
        historyItem,
      };

      context.voiceResult = voiceResult;

      const output = {
        matchedCommand,
        targetRoute,
        responseSpeechText,
        historyItem,
        responseSpeechTextEn,
        responseSpeechTextTa,
        responseSpeechTextHi
      };

      const confidence = matchedCommand !== 'Unknown' ? 1.0 : 0.50;

      const durationMs = Date.now() - startTime;
      logs[0].status = 'completed';
      logs[0].output = output;
      logs[0].confidence = confidence;
      logs[0].durationMs = durationMs;

      return {
        output,
        confidence,
        logs,
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
