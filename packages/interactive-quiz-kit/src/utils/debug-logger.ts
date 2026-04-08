// FILE: src/lib/interactive-quiz-kit/ai/flows/common/debug-logger.ts
// ================================================================================
// A centralized, reusable logger for all question generation flows.

//================================================================//
// EXPORTED INTERFACES & CONFIG
//================================================================//

export interface DebugConfig {
  logPrompts: boolean;
  logResponses: boolean;
  logValidation: boolean;
  logRetryDetails: boolean;
}

export const DEBUG_CONFIG: DebugConfig = {
  logPrompts: true,
  logResponses: true,
  logValidation: true,
  logRetryDetails: true,
};

export interface AttemptResult {
  success: boolean;
  duration: number;
  error?: string;
  promptLength: number;
  responseLength?: number;
  promptHash?: string;
}


//================================================================//
// EXPORTED DEBUG LOGGER CLASS
//================================================================//

export class DebugLogger {
  private static formatTimestamp(): string {
    return new Date().toISOString();
  }

  static logPrompt(attempt: number, prompt: string, inputContext: any): void {
    if (!DEBUG_CONFIG.logPrompts) return;
    console.log('\n' + '='.repeat(80));
    console.log(`[${this.formatTimestamp()}] 🔍 PROMPT DEBUG - Attempt ${attempt}`);
    console.log('='.repeat(80));
    console.log('Input Context:', JSON.stringify(inputContext, null, 2));
    console.log('\n' + '-'.repeat(40) + ' FULL PROMPT ' + '-'.repeat(40));
    console.log(prompt);
    console.log('-'.repeat(90));
    console.log('Prompt Length:', prompt.length, 'characters');
    console.log('='.repeat(80) + '\n');
  }

  static logResponse(attempt: number, rawResponse: string): void {
    if (!DEBUG_CONFIG.logResponses) return;
    console.log('\n' + '='.repeat(80));
    console.log(`[${this.formatTimestamp()}] 📝 AI RESPONSE - Attempt ${attempt}`);
    console.log('='.repeat(80));
    console.log('Raw Response Length:', rawResponse.length, 'characters');
    console.log('\n' + '-'.repeat(40) + ' FULL RESPONSE ' + '-'.repeat(39));
    console.log(rawResponse);
    console.log('-'.repeat(90));
    console.log('='.repeat(80) + '\n');
  }

  static logValidation(attempt: number, step: string, data: any): void {
    if (!DEBUG_CONFIG.logValidation) return;
    console.log(`[${this.formatTimestamp()}] ✅ VALIDATION - Attempt ${attempt} - ${step}`);
    console.log(JSON.stringify(data, null, 2));
    console.log('-'.repeat(50));
  }

  static logRetryInfo(attempt: number, error: Error, willRetry: boolean): void {
    if (!DEBUG_CONFIG.logRetryDetails) return;
    console.log('\n' + '='.repeat(80));
    console.log(`[${this.formatTimestamp()}] ⚠️  RETRY INFO - Attempt ${attempt}`);
    console.log('='.repeat(80));
    console.log('Error Type:', error.constructor.name);
    console.log('Error Message:', error.message);
    console.log('Will Retry:', willRetry);
    if (error.stack) {
      console.log('Stack Trace:', error.stack);
    }
    console.log('='.repeat(80) + '\n');
  }

  static logAttemptSummary(attemptResults: AttemptResult[]): void {
    console.log('\n' + '='.repeat(80));
    console.log(`[${this.formatTimestamp()}] 📊 ATTEMPT SUMMARY`);
    console.log('='.repeat(80));
    attemptResults.forEach((result, index) => {
      console.log(`Attempt ${index + 1}:`);
      console.log(`  Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      console.log(`  Duration: ${result.duration}ms`);
      console.log(`  Error: ${result.error || 'None'}`);
      console.log(`  Prompt Length: ${result.promptLength} chars`);
      console.log(`  Response Length: ${result.responseLength || 0} chars`);
      console.log('');
    });
    console.log('='.repeat(80) + '\n');
  }
}