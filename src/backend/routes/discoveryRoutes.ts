import { Router, Request, Response } from 'express';
import { Database } from '../utils/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { DISCOVERY_QUESTIONS, EligibilityEngine } from '../services/eligibilityEngine.js';
import { analyzeEligibilityWithAI } from '../services/geminiService.js';
import { RecommendationEngine } from '../services/recommendationEngine.js';
import { AgentManager } from '../agents/AgentManager.js';

const router = Router();

// Mock schemes list, same as in authController.ts to allow recommendation scoring
const MOCK_SCHEMES = [
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

// 1. Get questionnaire questions
router.get('/questions', authMiddleware, (req: Request, res: Response) => {
  res.json({ success: true, questions: DISCOVERY_QUESTIONS });
});

// 2. Submit a response to a single question
router.post('/submit-answer', authMiddleware, (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { questionId, questionText, answer } = req.body;

  if (!questionId || !questionText || !answer) {
    res.status(400).json({ error: 'Missing required parameters (questionId, questionText, answer)' });
    return;
  }

  const responseRecord = Database.createUserResponse({
    id: 'resp_' + Math.random().toString(36).substring(2, 9),
    userId: req.user.id,
    questionId,
    questionText,
    answer,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, response: responseRecord });
});

// 3. Clear responses
router.post('/clear-answers', authMiddleware, (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  Database.clearUserResponses(req.user.id);
  res.json({ success: true, message: 'All questionnaire answers cleared.' });
});

// 4. Trigger analysis & calculate eligibility
router.post('/analyze', authMiddleware, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userId = req.user.id;
  const user = Database.findUserById(userId);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  try {
    const agentResult = await AgentManager.processRequest({
      userId
    });

    if (!agentResult.success) {
      res.status(500).json({ error: agentResult.data.error || 'Multi-Agent analysis failed.' });
      return;
    }

    res.json({
      success: true,
      eligibility: agentResult.data.eligibility,
      recommendations: agentResult.data.recommendations,
      aiReasoning: agentResult.data.aiReasoning,
      suggestedSteps: agentResult.data.suggestedSteps,
      executionTrace: agentResult.executionTrace,
      overallConfidence: agentResult.overallConfidence
    });
  } catch (error: any) {
    console.error('Error in multi-agent analyze endpoint:', error);
    res.status(500).json({ error: 'Failed to run multi-agent analysis.' });
  }
});

// 5. Get current eligibility and personalized recommendations
router.get('/eligibility', authMiddleware, (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userId = req.user.id;
  const user = Database.findUserById(userId);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const eligibility = Database.getUserEligibility(userId);
  if (!eligibility) {
    res.json({ success: true, eligibility: null, recommendations: [] });
    return;
  }

  const recommendations = RecommendationEngine.getPersonalizedRecommendations(
    eligibility.eligibleSchemeIds,
    MOCK_SCHEMES,
    { industry: user.industry, age: user.age }
  );

  res.json({
    success: true,
    eligibility,
    recommendations
  });
});

// 6. Get saved schemes
router.get('/saved', authMiddleware, (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const saved = Database.getSavedSchemesByUserId(req.user.id);
  res.json({ success: true, saved });
});

// 7. Save a scheme
router.post('/save', authMiddleware, (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { schemeId } = req.body;
  if (!schemeId) {
    res.status(400).json({ error: 'schemeId is required' });
    return;
  }

  const saved = Database.createSavedScheme(req.user.id, schemeId);
  res.json({ success: true, saved });
});

// 8. Delete saved scheme
router.delete('/save/:schemeId', authMiddleware, (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { schemeId } = req.params;
  const success = Database.deleteSavedScheme(req.user.id, schemeId);
  res.json({ success, message: success ? 'Scheme removed from saved' : 'Failed or scheme not found' });
});

export default router;
