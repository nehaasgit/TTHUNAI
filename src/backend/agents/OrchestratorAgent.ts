import { DocumentAgent } from './DocumentAgent.js';
import { ProfileAgent } from './ProfileAgent.js';
import { EligibilityAgent } from './EligibilityAgent.js';
import { RecommendationAgent } from './RecommendationAgent.js';
import { VoiceAgent } from './VoiceAgent.js';
import { AgentContext, ExecutionTrace, TraceLog } from './types.js';

export interface OrchestratorInput {
  userId: string;
  uploadedFileUrl?: string;
  documentTypeHint?: string;
  profileFields?: any;
  voiceTranscript?: string;
  voiceLanguage?: 'en' | 'ta' | 'hi';
  ocrOnly?: boolean;
}

export class OrchestratorAgent {
  name = 'AI Orchestrator Agent';
  
  private documentAgent = new DocumentAgent();
  private profileAgent = new ProfileAgent();
  private eligibilityAgent = new EligibilityAgent();
  private recommendationAgent = new RecommendationAgent();
  private voiceAgent = new VoiceAgent();

  /**
   * Run the multi-agent system intelligently based on the query inputs.
   */
  async runPipeline(input: OrchestratorInput): Promise<{
    success: boolean;
    overallConfidence: number;
    executionTrace: ExecutionTrace;
    data: any;
  }> {
    const startTime = Date.now();
    const traceLogs: TraceLog[] = [];
    const context: AgentContext = {
      userId: input.userId,
      uploadedFileUrl: input.uploadedFileUrl,
      documentTypeHint: input.documentTypeHint,
      voiceTranscript: input.voiceTranscript,
      voiceLanguage: input.voiceLanguage,
      cache: {},
    };

    let previousOutput: any = null;
    let confidenceSum = 0;
    let agentCount = 0;

    const addLogs = (logs: TraceLog[]) => {
      traceLogs.push(...logs);
    };

    const trackAgent = (confidence: number) => {
      confidenceSum += confidence;
      agentCount++;
    };

    try {
      // 1. Voice Interaction Agent (highest priority for voice assistant)
      if (context.voiceTranscript) {
        const result = await this.voiceAgent.execute(context, previousOutput);
        addLogs(result.logs);
        trackAgent(result.confidence);
        previousOutput = result.output;
      }

      // 2. Document Analysis Agent
      else if (context.uploadedFileUrl) {
        const docResult = await this.documentAgent.execute(context);
        addLogs(docResult.logs);
        trackAgent(docResult.confidence);
        previousOutput = docResult.output;

        // Automatically handoff to Profile Intelligence Agent after document OCR unless ocrOnly is true
        if (!input.ocrOnly && docResult.handoffTo === 'Profile Intelligence Agent' && docResult.output && !docResult.output.error) {
          const profileResult = await this.profileAgent.execute(context, docResult.output);
          addLogs(profileResult.logs);
          trackAgent(profileResult.confidence);
          previousOutput = profileResult.output;

          // Automatically handoff to Scheme Eligibility Agent
          if (profileResult.handoffTo === 'Scheme Eligibility Agent') {
            const eligibilityResult = await this.eligibilityAgent.execute(context, profileResult.output);
            addLogs(eligibilityResult.logs);
            trackAgent(eligibilityResult.confidence);
            previousOutput = eligibilityResult.output;

            // Automatically handoff to Recommendation Agent
            if (eligibilityResult.handoffTo === 'Recommendation Agent') {
              const recResult = await this.recommendationAgent.execute(context, eligibilityResult.output);
              addLogs(recResult.logs);
              trackAgent(recResult.confidence);
              previousOutput = recResult.output;
            }
          }
        }
      }

      // 3. Profile Synchronizer and Direct Eligibility Pipeline (e.g., during profile fields submit / sync or manual edit)
      else if (input.profileFields) {
        const docOutputWithProfileFields = {
          extractedFields: input.profileFields,
          documentType: input.documentTypeHint || 'Other'
        };

        const profileResult = await this.profileAgent.execute(context, docOutputWithProfileFields);
        addLogs(profileResult.logs);
        trackAgent(profileResult.confidence);
        previousOutput = profileResult.output;

        if (profileResult.handoffTo === 'Scheme Eligibility Agent') {
          const eligibilityResult = await this.eligibilityAgent.execute(context, profileResult.output);
          addLogs(eligibilityResult.logs);
          trackAgent(eligibilityResult.confidence);
          previousOutput = eligibilityResult.output;

          if (eligibilityResult.handoffTo === 'Recommendation Agent') {
            const recResult = await this.recommendationAgent.execute(context, eligibilityResult.output);
            addLogs(recResult.logs);
            trackAgent(recResult.confidence);
            previousOutput = recResult.output;
          }
        }
      }

      // 4. Default Eligibility & Recommendation check (e.g. from questionnaire direct submit or view)
      else {
        const eligibilityResult = await this.eligibilityAgent.execute(context, previousOutput);
        addLogs(eligibilityResult.logs);
        trackAgent(eligibilityResult.confidence);
        previousOutput = eligibilityResult.output;

        if (eligibilityResult.handoffTo === 'Recommendation Agent') {
          const recResult = await this.recommendationAgent.execute(context, eligibilityResult.output);
          addLogs(recResult.logs);
          trackAgent(recResult.confidence);
          previousOutput = recResult.output;
        }
      }

      // Calculate final blended confidence score (average)
      const overallConfidence = agentCount > 0 ? Number((confidenceSum / agentCount).toFixed(2)) : 1.0;
      
      const executionTrace: ExecutionTrace = {
        logs: traceLogs,
        overallConfidence,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
      };

      // Print trace summary to backend logs securely without disclosing sensitive internal prompts
      console.log(`\n=== MULTI-AGENT EXECUTION TRACE [Blended Confidence: ${overallConfidence}] ===`);
      traceLogs.forEach((log) => {
        console.log(`[${log.agentName}] [${log.status.toUpperCase()}] ${log.action} - Duration: ${log.durationMs}ms - Confidence: ${log.confidence}${log.handoffTo ? ` -> Handoff to: ${log.handoffTo}` : ''}`);
      });
      console.log(`======================================================================\n`);

      return {
        success: true,
        overallConfidence,
        executionTrace,
        data: {
          contextUser: context.user,
          contextProfile: context.userProfile,
          contextDocument: context.documentRecord,
          ...previousOutput,
        },
      };

    } catch (err: any) {
      console.error('[Orchestrator Agent] Execution failed:', err);
      
      const overallConfidence = 0.0;
      const executionTrace: ExecutionTrace = {
        logs: traceLogs,
        overallConfidence,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
      };

      return {
        success: false,
        overallConfidence,
        executionTrace,
        data: { error: err.message || err },
      };
    }
  }
}
