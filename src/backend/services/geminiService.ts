import { GoogleGenAI } from "@google/genai";

// Initialize client lazily to avoid crashing if API key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.startsWith("AIzaSy") && apiKey !== "AIzaSyYourKeyHere") {
      aiClient = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return aiClient;
}

export interface EligibilityAnalysisResult {
  eligibleSchemeIds: string[];
  reasoning: string;
  suggestedSteps: string[];
}

/**
 * Perform server-side Gemini analysis of user answers to recommend government schemes.
 * Uses 'gemini-3.5-flash' for efficient, fast text classification and reasoning.
 */
export async function analyzeEligibilityWithAI(
  userProfile: {
    name?: string;
    age?: number;
    stateOfOrigin?: string;
    industry?: string;
    currentDistrictInTN?: string;
  },
  responses: Array<{ questionText: string; answer: string }>
): Promise<EligibilityAnalysisResult> {
  const ai = getAIClient();
  
  if (!ai) {
    console.log("[Gemini Service] GEMINI_API_KEY not found. Falling back to local rules engine.");
    return fallbackLocalAnalysis(userProfile, responses);
  }

  try {
    const prompt = `
You are ThunAI, an expert social worker assisting interstate migrant workers in Tamil Nadu, India.
Analyze the following worker's profile and questionnaire responses to determine which of the available welfare schemes they are eligible for.

WORKER PROFILE:
- Name: ${userProfile.name || 'N/A'}
- Age: ${userProfile.age || 'N/A'}
- Home State: ${userProfile.stateOfOrigin || 'N/A'}
- Industry Sector: ${userProfile.industry || 'N/A'}
- Current TN District: ${userProfile.currentDistrictInTN || 'N/A'}

QUESTIONNAIRE RESPONSES:
${responses.map((r, i) => `${i + 1}. Q: "${r.questionText}" -> A: "${r.answer}"`).join('\n')}

AVAILABLE SCHEMES:
1. tn-scheme-1: Tamil Nadu Manual Workers Welfare Board Registration (Eligible: manual/unorganised sector workers, age 18-60, residing/working in TN).
2. tn-scheme-2: Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS) (Eligible: unorganised sector / migrant workers in Tamil Nadu, household income below 1.2 Lakhs/year or manual sector worker).
3. tn-scheme-3: Piped Water Scheme & Integrated Housing for Migrants (Eligible: active factory, brick kiln, or textile workers in Tamil Nadu, especially in hubs like Tiruppur, Coimbatore, Kanchipuram, Chennai).

TASK:
Identify eligible schemes. Output a clean JSON object with the following structure:
{
  "eligibleSchemeIds": ["tn-scheme-1", "tn-scheme-2", "tn-scheme-3"], // array of eligible ids matching the available schemes
  "reasoning": "A short, extremely simple explanation in English, friendly and encouraging, explaining why they qualify.",
  "suggestedSteps": ["Step 1...", "Step 2..."] // 2 or 3 simple bullet points of next steps
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const data = JSON.parse(text) as EligibilityAnalysisResult;
    return data;

  } catch (error) {
    console.error("[Gemini Service] Error calling Gemini API:", error);
    return fallbackLocalAnalysis(userProfile, responses);
  }
}

function fallbackLocalAnalysis(
  userProfile: {
    age?: number;
    industry?: string;
    currentDistrictInTN?: string;
  },
  responses: Array<{ questionText: string; answer: string }>
): EligibilityAnalysisResult {
  const eligibleSchemeIds: string[] = [];
  const age = userProfile.age || 30;
  const industry = (userProfile.industry || '').toLowerCase();
  const district = (userProfile.currentDistrictInTN || '').toLowerCase();

  // Simple, deterministic local business rules for backup
  // Scheme 1: Manual worker registration
  if (age >= 18 && age <= 60) {
    eligibleSchemeIds.push('tn-scheme-1');
  }

  // Scheme 2: CMCHIS Health insurance
  const lowIncomeResponse = responses.find(r => r.questionText.toLowerCase().includes('income') || r.questionText.toLowerCase().includes('earn'));
  const isLowIncome = lowIncomeResponse ? !lowIncomeResponse.answer.toLowerCase().includes('high') : true;
  if (isLowIncome) {
    eligibleSchemeIds.push('tn-scheme-2');
  }

  // Scheme 3: Migrant Housing / Water
  const isIndustrial = industry.includes('textile') || industry.includes('factory') || industry.includes('construction') || industry.includes('brick') || industry.includes('manufactur');
  const inIndustrialHub = district.includes('tiruppur') || district.includes('coimbatore') || district.includes('kanchipuram') || district.includes('chennai');
  if (isIndustrial || inIndustrialHub) {
    eligibleSchemeIds.push('tn-scheme-3');
  }

  return {
    eligibleSchemeIds,
    reasoning: "Based on your work sector and residency in Tamil Nadu, you qualify for official worker benefits and health support programs.",
    suggestedSteps: [
      "Prepare your Aadhaar card and Ration card.",
      "Get a certificate from your employer or local union representative.",
      "Submit your application at the nearest Labour Facilitation Center."
    ]
  };
}
