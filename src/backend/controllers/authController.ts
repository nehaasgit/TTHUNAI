import { Request, Response } from 'express';
import { Database } from '../utils/db.js';
import { User, Language } from '../../shared/types.js';
import { verifyIdToken } from '../utils/firebaseAdmin.js';

// Simple helper to generate a unique random ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// Mock list of active Tamil Nadu Government schemes for interstate workers
const TN_SCHEMES = [
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
    benefit: 'Cashless medical treatment up to ₹5,000,000 per year per family for over 1,000 procedures.',
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

export const sendOTP = (req: Request, res: Response) => {
  // In Firebase Phone Authentication, sending SMS OTP is initiated from the client side directly
  res.status(200).json({ 
    message: 'Firebase Phone Auth is active. SMS sending is managed client-side.'
  });
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ error: 'Firebase idToken is required' });
    return;
  }

  try {
    const decoded = await verifyIdToken(idToken);
    if (!decoded) {
      res.status(400).json({ error: 'Invalid or expired Firebase verification token' });
      return;
    }

    const { uid, phoneNumber } = decoded;

    // Search for existing user by id/firebaseUID or phoneNumber
    const users = Database.getUsers();
    let user = users.find(u => u.id === uid || u.firebaseUID === uid);

    if (!user && phoneNumber) {
      const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
      user = users.find(u => {
        const uPhone = u.phoneNumber.replace(/\D/g, '').slice(-10);
        return uPhone === cleanPhone;
      });

      if (user) {
        // Associate pre-existing user profile with this Firebase login
        Database.updateUser(user.id, {
          firebaseUID: uid,
          authenticationProvider: 'phone'
        });
        // Retrieve updated user
        user = Database.findUserById(user.id) || user;
      }
    }

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = {
        id: uid,
        phoneNumber: phoneNumber || '',
        firebaseUID: uid,
        authenticationProvider: 'phone',
        profileSetupCompleted: false,
      };
      Database.createUser(user);
    } else {
      isNewUser = !user.profileSetupCompleted;
    }

    res.status(200).json({
      message: 'Authentication successful',
      token: idToken,
      user,
      isNewUser
    });
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

export const getProfile = (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const user = Database.findUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User profile not found in database' });
    return;
  }

  res.status(200).json({ user });
};

export const setupProfile = (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { name, age, stateOfOrigin, nativeLanguage, currentDistrictInTN, industry } = req.body;

  if (!name || !stateOfOrigin || !nativeLanguage || !currentDistrictInTN || !industry) {
    res.status(400).json({ error: 'Please fill in all required profile setup fields' });
    return;
  }

  const updatedUser = Database.updateUser(req.user.id, {
    name,
    age: Number(age) || undefined,
    stateOfOrigin,
    nativeLanguage: nativeLanguage as Language,
    currentDistrictInTN,
    industry,
    dateOfRegistration: new Date().toISOString().split('T')[0],
    profileSetupCompleted: true,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
  });

  if (!updatedUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.status(200).json({
    message: 'Profile completed successfully',
    user: updatedUser
  });
};

export const updateProfile = (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const updates = req.body;
  const updatedUser = Database.updateUser(req.user.id, updates);

  if (!updatedUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.status(200).json({
    message: 'Profile updated successfully',
    user: updatedUser
  });
};

export const getSchemes = (req: Request, res: Response) => {
  // Return localized schemes
  res.status(200).json({ schemes: TN_SCHEMES });
};
