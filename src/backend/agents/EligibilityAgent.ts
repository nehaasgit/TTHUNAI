import { Database } from '../utils/db.js';
import { EligibilityEngine } from '../services/eligibilityEngine.js';
import { analyzeEligibilityWithAI } from '../services/geminiService.js';
import { AgentContext, TraceLog } from './types.js';

export class EligibilityAgent {
  name = 'Scheme Eligibility Agent';

  /**
   * Evaluates eligibility using local deterministic business rules merged with Gemini AI insights.
   */
  async execute(context: AgentContext, previousOutput?: any): Promise<{ output: any; confidence: number; logs: TraceLog[]; handoffTo?: string }> {
    const startTime = Date.now();
    const logs: TraceLog[] = [];
    
    logs.push({
      agentName: this.name,
      status: 'started',
      action: 'Determine eligible government schemes',
      timestamp: new Date().toISOString(),
      durationMs: 0,
      input: { userId: context.userId },
      output: null,
      confidence: 0,
    });

    try {
      const userId = context.userId;
      const user = context.user || Database.findUserById(userId);

      if (!user) {
        throw new Error('User not found.');
      }

      // 1. Fetch user responses
      const responses = Database.getUserResponses(userId);
      const answersMap: Record<string, string> = {};
      responses.forEach(r => {
        answersMap[r.questionId] = r.answer;
      });

      // 2. Evaluate base deterministic eligibility rules
      const deterministicEligibleIds = EligibilityEngine.evaluateEligibility(answersMap);

      // 3. Trigger or retrieve Gemini AI evaluation
      let aiResult;
      const cacheKey = `eligibility_ai_${userId}_${JSON.stringify(answersMap)}`;
      if (context.cache[cacheKey]) {
        aiResult = context.cache[cacheKey];
        logs.push({
          agentName: this.name,
          status: 'completed',
          action: 'Retrieve AI Eligibility evaluation from cache',
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - startTime,
          input: { cacheKey },
          output: aiResult,
          confidence: 1.0,
        });
      } else {
        aiResult = await analyzeEligibilityWithAI(
          {
            name: user.name,
            age: user.age,
            stateOfOrigin: user.stateOfOrigin,
            industry: user.industry,
            currentDistrictInTN: user.currentDistrictInTN
          },
          responses.map(r => ({ questionText: r.questionText, answer: r.answer }))
        );
        context.cache[cacheKey] = aiResult;
      }

      // 4. Merge results
      const combinedEligibleIds = Array.from(new Set([
        ...deterministicEligibleIds,
        ...aiResult.eligibleSchemeIds
      ]));

      // 5. Persist eligibility record
      const eligibilityRecord = Database.saveUserEligibility({
        id: 'elig_' + Math.random().toString(36).substring(2, 9),
        userId,
        eligibleSchemeIds: combinedEligibleIds,
        lastCalculated: new Date().toISOString()
      });

      context.eligibleSchemeIds = combinedEligibleIds;

      const output = {
        eligibility: eligibilityRecord,
        deterministicSchemeIds: deterministicEligibleIds,
        aiSchemeIds: aiResult.eligibleSchemeIds,
        aiReasoning: aiResult.reasoning,
        suggestedSteps: aiResult.suggestedSteps
      };

      // Set high confidence if AI successfully analyzed, moderate if fell back
      const confidence = aiResult.reasoning ? 0.95 : 0.70;

      const durationMs = Date.now() - startTime;
      logs[0].status = 'completed';
      logs[0].output = output;
      logs[0].confidence = confidence;
      logs[0].durationMs = durationMs;
      logs[0].handoffTo = 'Recommendation Agent';

      return {
        output,
        confidence,
        logs,
        handoffTo: 'Recommendation Agent',
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
