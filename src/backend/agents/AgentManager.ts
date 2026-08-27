import { OrchestratorAgent, OrchestratorInput } from './OrchestratorAgent.js';

export class AgentManager {
  private static orchestrator = new OrchestratorAgent();

  /**
   * Process any user request through the unified multi-agent orchestrator.
   */
  static async processRequest(input: OrchestratorInput) {
    return this.orchestrator.runPipeline(input);
  }
}
export type { OrchestratorInput };
export * from './types.js';
