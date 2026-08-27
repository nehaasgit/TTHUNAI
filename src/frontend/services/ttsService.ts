import { Language } from '../../shared/types.js';

export const ttsService = {
  /**
   * Reads a given text aloud in the preferred language.
   */
  speak(text: string, language: Language): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.warn('[TTS] Speech synthesis not supported in this browser.');
        resolve(false);
        return;
      }

      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Clean HTML tags if any exist in text
        const cleanText = text.replace(/<[^>]*>/g, '').trim();
        if (!cleanText) {
          resolve(false);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Select matching voice locale
        let langCode = 'en-US';
        if (language === 'ta') {
          langCode = 'ta-IN';
        } else if (language === 'hi') {
          langCode = 'hi-IN';
        }
        utterance.lang = langCode;

        // Ensure rate/pitch is comfortable for workers
        utterance.rate = 0.95; // Slightly slower for absolute clarity
        utterance.pitch = 1.0;

        // Find an appropriate system voice matching langCode
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang === langCode || v.lang.startsWith(langCode));
        if (voice) {
          utterance.voice = voice;
        }

        utterance.onend = () => {
          resolve(true);
        };

        utterance.onerror = (e) => {
          console.warn('[TTS] Utterance error:', e);
          resolve(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[TTS] Synthesis execution error:', err);
        resolve(false);
      }
    });
  },

  /**
   * Stop any current speech playback.
   */
  stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
};
