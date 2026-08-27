import { Request, Response } from 'express';
import { Database } from '../utils/db.js';
import { DocumentRecord, Language } from '../../shared/types.js';
import { OCRService } from '../services/ocrService.js';
import { EligibilityEngine } from '../services/eligibilityEngine.js';
import { RecommendationEngine } from '../services/recommendationEngine.js';
import { analyzeEligibilityWithAI } from '../services/geminiService.js';
import { AgentManager } from '../agents/AgentManager.js';

const generateId = () => Math.random().toString(36).substring(2, 11);

// Standard mock Tamil Nadu Government welfare schemes
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

export const listDocuments = (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const docs = Database.findDocumentsByUserId(req.user.id);
  res.status(200).json({ documents: docs });
};

export const uploadDocument = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { name, type, fileUrl } = req.body;

  if (!name || !type) {
    res.status(400).json({ error: 'Document name and type are required' });
    return;
  }

  const allowedTypes = ['Aadhaar', 'Ration Card', 'Voter ID', 'Labour Card', 'Bank Passbook', 'Other'];
  if (!allowedTypes.includes(type)) {
    res.status(400).json({ error: `Invalid document type. Must be one of: ${allowedTypes.join(', ')}` });
    return;
  }

  const defaultFileUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80`;
  const finalFileUrl = fileUrl || defaultFileUrl;

  try {
    // Run real OCR service with Multi-Agent Document Analysis Agent
    const agentResult = await AgentManager.processRequest({
      userId: req.user.id,
      uploadedFileUrl: finalFileUrl,
      documentTypeHint: type,
      ocrOnly: true
    });

    if (!agentResult.success) {
      res.status(422).json({
        error: agentResult.data.error || "OCR reading failed. Please ensure the document is clear and readable."
      });
      return;
    }

    const ocrResult = agentResult.data;

    const newDoc: DocumentRecord = {
      id: 'doc_' + generateId(),
      userId: req.user.id,
      name,
      type: type as any,
      fileUrl: finalFileUrl,
      uploadedAt: new Date().toISOString(),
      verified: true, // OCR verification completes immediately!
      ocrStatus: ocrResult.ocrStatus,
      documentType: ocrResult.documentType,
      extractedFields: ocrResult.extractedFields,
      confidenceScore: ocrResult.rawConfidenceScores,
      profileSynced: false,
      benefitsUpdated: false
    };

    Database.createDocument(newDoc);

    res.status(201).json({
      message: 'Document uploaded successfully to vault and processed by OCR.',
      document: newDoc,
      executionTrace: agentResult.executionTrace,
      overallConfidence: agentResult.overallConfidence
    });
  } catch (error: any) {
    console.error('Error uploading/processing document:', error);
    res.status(500).json({ error: 'Internal server error while processing OCR.' });
  }
};

export const deleteDocument = (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'Document ID is required' });
    return;
  }

  const deleted = Database.deleteDocument(id, req.user.id);

  if (!deleted) {
    res.status(404).json({ error: 'Document not found or access denied' });
    return;
  }

  res.status(200).json({ message: 'Document removed successfully' });
};

export const verifyDocument = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  const docs = Database.getDocuments();
  const index = docs.findIndex(d => d.id === id && d.userId === req.user.id);

  if (index === -1) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  try {
    const doc = docs[index];
    const agentResult = await AgentManager.processRequest({
      userId: req.user.id,
      uploadedFileUrl: doc.fileUrl,
      documentTypeHint: doc.type,
      ocrOnly: true
    });

    if (!agentResult.success) {
      res.status(422).json({
        error: agentResult.data.error || "OCR reading failed. Please ensure the document is clear and readable."
      });
      return;
    }

    const ocrResult = agentResult.data;

    docs[index].verified = true;
    docs[index].ocrStatus = ocrResult.ocrStatus;
    docs[index].documentType = ocrResult.documentType;
    docs[index].extractedFields = ocrResult.extractedFields;
    docs[index].confidenceScore = ocrResult.rawConfidenceScores;

    Database.saveDocuments(docs);

    res.status(200).json({
      message: 'OCR Verification complete.',
      document: docs[index],
      executionTrace: agentResult.executionTrace,
      overallConfidence: agentResult.overallConfidence
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({ error: 'Verification failed.' });
  }
};

/**
 * Sync Document extracted profile fields with User Profile and run Eligibility Engine (Module 4, 6, 8, 9)
 */
export const syncProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { id } = req.params;
  const { profileFields } = req.body;

  if (!id || !profileFields) {
    res.status(400).json({ error: 'Document ID and profileFields are required' });
    return;
  }

  const docs = Database.getDocuments();
  const docIndex = docs.findIndex(d => d.id === id && d.userId === req.user.id);

  if (docIndex === -1) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  try {
    const userId = req.user.id;

    const agentResult = await AgentManager.processRequest({
      userId,
      profileFields
    });

    if (!agentResult.success) {
      res.status(500).json({ error: agentResult.data.error || 'Multi-Agent profile sync failed.' });
      return;
    }

    const agentData = agentResult.data;

    // Update target document record states
    docs[docIndex].profileSynced = true;
    docs[docIndex].benefitsUpdated = true;
    Database.saveDocuments(docs);

    res.status(200).json({
      success: true,
      message: 'Profile synchronized and eligibility benefits updated successfully!',
      profile: agentData.profile,
      user: agentData.user,
      eligibility: agentData.eligibility,
      recommendations: agentData.recommendations,
      aiReasoning: agentData.aiReasoning,
      suggestedSteps: agentData.suggestedSteps,
      executionTrace: agentResult.executionTrace,
      overallConfidence: agentResult.overallConfidence
    });
  } catch (error) {
    console.error('Error synchronizing profile:', error);
    res.status(500).json({ error: 'Failed to synchronize profile fields.' });
  }
};

