import { Database } from '../utils/db.js';
import { RecommendationEngine, PersonalizedRecommendation } from '../services/recommendationEngine.js';
import { AgentContext, TraceLog } from './types.js';

export const MOCK_SCHEMES = [
  {
    id: 'tn-scheme-1',
    name: 'Tamil Nadu Manual Workers Welfare Board Registration',
    nameTranslated: 'தமிழ்நாடு உடலுழைப்பு தொழிலாளர்கள் நல வாரியப் பதிவு',
    category: 'Social Security',
    benefit: 'Accidental insurance of ₹1 Lakh, maternity support of ₹6,000, and educational scholarships up to ₹8,000 for children.',
    eligibility: 'All manual/unorganised sector workers aged between 18 and 60 residing in Tamil Nadu.',
    description: 'An official board registration that grants unorganised interstate manual workers social security benefits, educational aid for children, and marriage assistance.',
    stepsToApply: [
      'Fill up Form A (Application Form) in Tamil/English.',
      'Attach copy of Aadhaar Card and Bank Passbook front page.',
      'Obtain employment certificate from a registered trade union or village administrative officer (VAO).',
      'Submit online on the Tamil Nadu Labour Department portal or visit the nearest Labour Facilitation Center.'
    ]
  },
  {
    id: 'tn-scheme-2',
    name: 'Chief Minister\'s Comprehensive Health Insurance Scheme (CMCHIS)',
    nameTranslated: 'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம்',
    category: 'Healthcare',
    benefit: 'Cashless medical treatment up to ₹500,000 per year per family for over 1,000 procedures.',
    eligibility: 'Families with an annual income below ₹120,000. Extended to migrant workers registered with the Labour Department.',
    description: 'Provides fully-funded health cover for inpatient hospitalisation in public and private empanelled hospitals across Tamil Nadu.',
    stepsToApply: [
      'Get income certificate from Tahsildar / local Revenue Officer.',
      'Take copy of smart ration card and identity proof.',
      'Visit the CMCHIS kiosk at the District Collectorate.',
      'Complete biometric scanning and collect the CMCHIS health card.'
    ]
  },
  {
    id: 'tn-scheme-3',
    name: 'Piped Water Scheme & Integrated Housing for Migrants',
    nameTranslated: 'மாநில புலம்பெயர் தொழிலாளர் தங்குமிட மேம்பாட்டுத் திட்டம்',
    category: 'Housing',
    benefit: 'Subsidised shared accommodation with clean drinking water and sanitation facilities near industrial hubs like Kanchipuram and Tiruppur.',
    eligibility: 'Interstate migrant workers employed in registered factories, brick kilns, or textile units in Tamil Nadu.',
    description: 'A special scheme by the Tamil Nadu government to build clean, low-cost transit housing and dormitories for migrant industrial labor.',
    stepsToApply: [
      'Provide proof of active employment in a Tamil Nadu industrial unit.',
      'Submit employer certificate verifying migrant status.',
      'Apply through the employer or directly at local Municipal Corporation office.'
    ]
  }
];

export class RecommendationAgent {
  name = 'Recommendation Agent';

  /**
   * Ranks eligible schemes, generates reasons, and computes relevance priorities.
   */
  async execute(context: AgentContext, previousOutput?: any): Promise<{ output: any; confidence: number; logs: TraceLog[]; handoffTo?: string }> {
    const startTime = Date.now();
    const logs: TraceLog[] = [];
    
    logs.push({
      agentName: this.name,
      status: 'started',
      action: 'Rank government schemes & generate explanations',
      timestamp: new Date().toISOString(),
      durationMs: 0,
      input: { eligibleSchemeIds: context.eligibleSchemeIds },
      output: null,
      confidence: 0,
    });

    try {
      const userId = context.userId;
      const user = context.user || Database.findUserById(userId);

      if (!user) {
        throw new Error('User not found.');
      }

      const eligibleSchemeIds = context.eligibleSchemeIds || previousOutput?.eligibility?.eligibleSchemeIds || [];
      
      // Calculate recommendations
      const recommendations = RecommendationEngine.getPersonalizedRecommendations(
        eligibleSchemeIds,
        MOCK_SCHEMES,
        { industry: user.industry, age: user.age }
      );

      context.recommendations = recommendations;

      // Calculate confidence as a function of matchScore
      let averageScore = 0;
      if (recommendations.length > 0) {
        const sum = recommendations.reduce((acc, rec) => acc + rec.matchScore, 0);
        averageScore = sum / recommendations.length;
      }
      const confidence = recommendations.length > 0 ? averageScore / 100 : 0.90;

      const output = {
        recommendations,
        totalEligible: eligibleSchemeIds.length,
        topPriorityCount: recommendations.filter(r => r.priority === 'High').length,
      };

      const durationMs = Date.now() - startTime;
      logs[0].status = 'completed';
      logs[0].output = output;
      logs[0].confidence = confidence;
      logs[0].durationMs = durationMs;
      
      // If voice transcript is in context, hand off to VoiceAgent, else complete pipeline
      const handoffTo = context.voiceTranscript ? 'Voice Interaction Agent' : undefined;
      if (handoffTo) {
        logs[0].handoffTo = handoffTo;
      }

      return {
        output,
        confidence,
        logs,
        handoffTo,
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
