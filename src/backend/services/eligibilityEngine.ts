// Eligibility Engine for ThunAI Welfare Schemes
// Determines eligibility profiles and sets up questionnaire flows.

export interface QuestionNode {
  id: string;
  textEn: string;
  textTa: string;
  textHi: string;
  audioEn?: string;
  audioTa?: string;
  audioHi?: string;
  options: Array<{
    value: string;
    labelEn: string;
    labelTa: string;
    labelHi: string;
    icon?: string;
  }>;
}

export const DISCOVERY_QUESTIONS: QuestionNode[] = [
  {
    id: 'q_age_bracket',
    textEn: "How old are you?",
    textTa: "உங்கள் வயது என்ன?",
    textHi: "आपकी उम्र कितनी है?",
    options: [
      { value: 'under_18', labelEn: "Under 18 years", labelTa: "18 வயதிற்குட்பட்டவர்", labelHi: "18 साल से कम" },
      { value: '18_to_60', labelEn: "Between 18 and 60", labelTa: "18 முதல் 60 வரை", labelHi: "18 से 60 के बीच" },
      { value: 'above_60', labelEn: "Above 60 years", labelTa: "60 வயதிற்கு மேற்பட்டவர்", labelHi: "60 साल से ऊपर" }
    ]
  },
  {
    id: 'q_work_sector',
    textEn: "Which sector do you work in?",
    textTa: "நீங்கள் எந்தத் துறையில் வேலை செய்கிறீர்கள்?",
    textHi: "आप किस क्षेत्र में काम करते हैं?",
    options: [
      { value: 'construction', labelEn: "Construction / Building", labelTa: "கட்டிட வேலை", labelHi: "निर्माण / भवन" },
      { value: 'textile', labelEn: "Textiles / Garments", labelTa: "ஜவுளி / ஆடை தயாரிப்பு", labelHi: "कपड़ा / गारमेंट्स" },
      { value: 'brick_kiln', labelEn: "Brick Kiln / Pottery", labelTa: "செங்கல் சூளை", labelHi: "ईंट भट्ठा / मिट्टी के बर्तन" },
      { value: 'agriculture', labelEn: "Agriculture / Manual Labor", labelTa: "விவசாயம் / கூலி வேலை", labelHi: "कृषि / शारीरिक श्रम" },
      { value: 'other', labelEn: "Other / Unlisted Sector", labelTa: "இதர வேலைகள்", labelHi: "अन्य / गैर-सूचीबद्ध" }
    ]
  },
  {
    id: 'q_household_income',
    textEn: "Is your monthly household income less than ₹10,000?",
    textTa: "உங்கள் குடும்ப மாத வருமானம் ₹10,000-க்குக் குறைவாக உள்ளதா?",
    textHi: "क्या आपकी मासिक पारिवारिक आय ₹10,000 से कम है?",
    options: [
      { value: 'yes', labelEn: "Yes, less than ₹10k", labelTa: "ஆம், ₹10,000-க்கும் குறைவு", labelHi: "हां, ₹10 हजार से कम" },
      { value: 'no', labelEn: "No, more than ₹10k", labelTa: "இல்லை, ₹10,000-க்கு மேல்", labelHi: "नहीं, ₹10 हजार से अधिक" }
    ]
  },
  {
    id: 'q_active_registration',
    textEn: "Are you registered with the Tamil Nadu Manual Workers Board?",
    textTa: "நீங்கள் தமிழ்நாடு உடலுழைப்பு தொழிலாளர் வாரியத்தில் பதிவு செய்துள்ளீர்களா?",
    textHi: "क्या आप तमिलनाडु मैनुअल वर्कर्स बोर्ड में पंजीकृत हैं?",
    options: [
      { value: 'yes', labelEn: "Yes, already registered", labelTa: "ஆம், ஏற்கனவே பதிவு செய்துள்ளேன்", labelHi: "हां, पहले से पंजीकृत हैं" },
      { value: 'no', labelEn: "No, not registered", labelTa: "இல்லை, பதிவு செய்யவில்லை", labelHi: "नहीं, पंजीकृत नहीं हैं" }
    ]
  }
];

export class EligibilityEngine {
  /**
   * Deterministic evaluation of scheme eligibility based on user questionnaire answers
   */
  static evaluateEligibility(answers: Record<string, string>): string[] {
    const eligibleSchemeIds: string[] = [];

    // Rule 1: Manual Workers Welfare Board Registration (tn-scheme-1)
    // Criteria: Age must be 18 to 60. Not registered yet.
    const ageBracket = answers['q_age_bracket'];
    const isRegistered = answers['q_active_registration'];
    if (ageBracket === '18_to_60' && isRegistered === 'no') {
      eligibleSchemeIds.push('tn-scheme-1');
    }

    // Rule 2: Chief Minister's Comprehensive Health Insurance Scheme (tn-scheme-2)
    // Criteria: Household income less than ₹10k.
    const lowIncome = answers['q_household_income'];
    if (lowIncome === 'yes') {
      eligibleSchemeIds.push('tn-scheme-2');
    }

    // Rule 3: Piped Water Scheme & Integrated Housing (tn-scheme-3)
    // Criteria: Working in Textile, Construction, or Brick Kiln sectors
    const sector = answers['q_work_sector'];
    if (sector === 'textile' || sector === 'construction' || sector === 'brick_kiln') {
      eligibleSchemeIds.push('tn-scheme-3');
    }

    return eligibleSchemeIds;
  }
}
