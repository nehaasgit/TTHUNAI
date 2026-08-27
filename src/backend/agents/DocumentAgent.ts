import { OCRService } from '../services/ocrService.js';
import { AgentContext, TraceLog } from './types.js';

export class DocumentAgent {
  name = 'Document Analysis Agent';

  /**
   * Run OCR processing on the uploaded document or fetch from cache.
   */
  async execute(context: AgentContext): Promise<{ output: any; confidence: number; logs: TraceLog[]; handoffTo?: string }> {
    const startTime = Date.now();
    const logs: TraceLog[] = [];
    
    logs.push({
      agentName: this.name,
      status: 'started',
      action: 'Document Analysis and OCR extraction',
      timestamp: new Date().toISOString(),
      durationMs: 0,
      input: { fileUrl: context.uploadedFileUrl, typeHint: context.documentTypeHint },
      output: null,
      confidence: 0,
    });

    if (!context.uploadedFileUrl) {
      const errorMsg = 'No document URL provided for analysis.';
      const durationMs = Date.now() - startTime;
      logs[0].status = 'failed';
      logs[0].output = { error: errorMsg };
      logs[0].durationMs = durationMs;
      
      return {
        output: { error: errorMsg },
        confidence: 0.0,
        logs,
      };
    }

    try {
      const typeHint = context.documentTypeHint || 'Other';
      
      // Perform OCR
      let ocrResult;
      const cacheKey = `ocr_${context.uploadedFileUrl}_${typeHint}`;
      if (context.cache[cacheKey]) {
        ocrResult = context.cache[cacheKey];
        logs.push({
          agentName: this.name,
          status: 'completed',
          action: 'Retrieve OCR from cache',
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - startTime,
          input: { cacheKey },
          output: ocrResult,
          confidence: 1.0,
        });
      } else {
        ocrResult = await OCRService.process(context.uploadedFileUrl, typeHint);
        context.cache[cacheKey] = ocrResult;
      }

      if (!ocrResult.success) {
        const errorMsg = ocrResult.error || 'Failed to extract text from document';
        const durationMs = Date.now() - startTime;
        logs[0].status = 'failed';
        logs[0].output = { error: errorMsg };
        logs[0].durationMs = durationMs;

        return {
          output: { error: errorMsg },
          confidence: 0.1,
          logs,
        };
      }

      // Calculate confidence score (average of all fields in confidenceScore or default)
      let sum = 0;
      let count = 0;
      if (ocrResult.confidenceScore) {
        Object.values(ocrResult.confidenceScore).forEach((val) => {
          const num = Number(val);
          if (!isNaN(num)) {
            sum += num;
            count++;
          }
        });
      }
      const confidence = count > 0 ? (sum / count) / 100 : 0.85;

      // Extract details
      const extractedFields = ocrResult.extractedFields || {};
      const validatedFields: Record<string, string> = {};
      
      // Validate and clean extracted fields
      Object.entries(extractedFields).forEach(([key, val]) => {
        if (typeof val === 'string' && val.trim() !== '' && val !== 'Unknown') {
          validatedFields[key] = val.trim();
        }
      });

      const output = {
        documentType: ocrResult.documentType || typeHint,
        extractedFields: validatedFields,
        rawConfidenceScores: ocrResult.confidenceScore,
        ocrStatus: ocrResult.ocrStatus,
      };

      const durationMs = Date.now() - startTime;
      logs[0].status = 'completed';
      logs[0].output = output;
      logs[0].confidence = confidence;
      logs[0].durationMs = durationMs;
      logs[0].handoffTo = 'Profile Intelligence Agent';

      return {
        output,
        confidence,
        logs,
        handoffTo: 'Profile Intelligence Agent',
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
