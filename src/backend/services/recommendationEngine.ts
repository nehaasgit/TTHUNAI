// Recommendation Engine for ThunAI government benefit programs.
// Provides customized descriptions, step priorities, and matches user's native language.

import { GovernmentScheme, Language } from '../../shared/types.js';

export interface PersonalizedRecommendation {
  scheme: GovernmentScheme;
  matchScore: number; // percentage (0-100)
  relevanceReasonEn: string;
  relevanceReasonTa: string;
  relevanceReasonHi: string;
  priority: 'High' | 'Medium' | 'Low';
}

export class RecommendationEngine {
  /**
   * Enrich eligible schemes with personalized match scores, priority ranks, and natural language matching.
   */
  static getPersonalizedRecommendations(
    eligibleSchemeIds: string[],
    allSchemes: GovernmentScheme[],
    userProfile: { industry?: string; age?: number }
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    for (const scheme of allSchemes) {
      if (!eligibleSchemeIds.includes(scheme.id)) continue;

      let score = 70; // Base score
      let priority: 'High' | 'Medium' | 'Low' = 'Medium';
      let reasonEn = "Matches your worker registration profile.";
      let reasonTa = "உங்கள் தொழிலாளர் பதிவு சுயவிவரத்துடன் பொருந்துகிறது.";
      let reasonHi = "आपके श्रमिक पंजीकरण प्रोफ़ाइल से मेल खाता है।";

      // Customize for scheme 1: Manual Worker Board
      if (scheme.id === 'tn-scheme-1') {
        if (userProfile.age && userProfile.age >= 18 && userProfile.age <= 50) {
          score = 95;
          priority = 'High';
          reasonEn = "Highly recommended social security protection for active manual workers.";
          reasonTa = "செயலில் உள்ள உடலுழைப்பு தொழிலாளர்களுக்கு மிகவும் பரிந்துரைக்கப்படும் சமூக பாதுகாப்பு திட்டம்.";
          reasonHi = "सक्रिय शारीरिक श्रमिकों के लिए अत्यधिक अनुशंसित सामाजिक सुरक्षा योजना।";
        } else {
          score = 80;
        }
      }

      // Customize for scheme 2: CMCHIS health scheme
      if (scheme.id === 'tn-scheme-2') {
        score = 90;
        priority = 'High';
        reasonEn = "Critical healthcare insurance providing cash-free private hospital treatment.";
        reasonTa = "இலவச தனியார் மருத்துவமனை சிகிச்சையை வழங்கும் மிக முக்கியமான மருத்துவக் காப்பீடு.";
        reasonHi = "कैशलेस निजी अस्पताल उपचार प्रदान करने वाला महत्वपूर्ण स्वास्थ्य बीमा।";
      }

      // Customize for scheme 3: Housing and Water
      if (scheme.id === 'tn-scheme-3') {
        const ind = (userProfile.industry || '').toLowerCase();
        if (ind.includes('textile') || ind.includes('garment') || ind.includes('factory')) {
          score = 95;
          priority = 'High';
          reasonEn = "Directly matches housing support guidelines for garment and industrial workers.";
          reasonTa = "ஆடை மற்றும் தொழில்துறை தொழிலாளர்களுக்கான வீட்டு வசதி திட்டத்துடன் நேரடியாக பொருந்துகிறது.";
          reasonHi = "कपड़ा और औद्योगिक श्रमिकों के लिए आवास सहायता दिशानिर्देशों से सीधे मेल खाता है।";
        } else {
          score = 75;
          priority = 'Medium';
          reasonEn = "Subsidized clean housing and piped water option for manual laborers.";
          reasonTa = "உடலுழைப்பு தொழிலாளர்களுக்கான மானிய விலையிலான தூய்மையான தங்குமிடம் மற்றும் குடிநீர் வசதி.";
          reasonHi = "शारीरिक श्रमिकों के लिए रियायती स्वच्छ आवास और पाइप जलापूर्ति विकल्प।";
        }
      }

      recommendations.push({
        scheme,
        matchScore: score,
        relevanceReasonEn: reasonEn,
        relevanceReasonTa: reasonTa,
        relevanceReasonHi: reasonHi,
        priority
      });
    }

    // Sort by match score descending
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  }
}
