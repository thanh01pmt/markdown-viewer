import type { CodingQuestion, TestCase } from '..';
import { executionService, initExecutionSystem } from '../lib/execution';
import { 
  APIKeyService, 
  GEMINI_API_KEY_SERVICE_NAME, 
  JUDGE0_PRIMARY_API_KEY_SERVICE_NAME, 
  JUDGE0_PRIMARY_API_URL_SERVICE_NAME,
  JUDGE0_FALLBACK_API_KEY_SERVICE_NAME,
  JUDGE0_FALLBACK_API_URL_SERVICE_NAME,
  PISTON_PRIMARY_API_URL_SERVICE_NAME
} from './APIKeyService';
import { CodeWrapper } from '../lib/execution/CodeWrapper';

export interface EvaluationResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: any;
  reasoning: string;
}

export class CodeEvaluationService {
  constructor() {
    this.ensureInitialized();
  }

  /**
   * Ensure execution system is initialized with latest keys.
   * Order of precedence: LocalStorage (User choice) > Environment Variables (System default)
   */
  private ensureInitialized() {
    if (typeof window === 'undefined') return;

    // Gemini
    const geminiKey = APIKeyService.getAPIKey(GEMINI_API_KEY_SERVICE_NAME) || 
                      process.env.NEXT_PUBLIC_GEMINI_API_KEY;
                      
    // Judge0 Primary (Self-hosted)
    const judge0PrimaryUrl = APIKeyService.getAPIKey(JUDGE0_PRIMARY_API_URL_SERVICE_NAME) || 
                             process.env.NEXT_PUBLIC_JUDGE0_PRIMARY_URL;
    const judge0PrimaryKey = APIKeyService.getAPIKey(JUDGE0_PRIMARY_API_KEY_SERVICE_NAME) || 
                             process.env.NEXT_PUBLIC_JUDGE0_PRIMARY_KEY;

    // Judge0 Fallback (RapidAPI)
    const judge0FallbackUrl = APIKeyService.getAPIKey(JUDGE0_FALLBACK_API_URL_SERVICE_NAME) || 
                              process.env.NEXT_PUBLIC_JUDGE0_FALLBACK_URL;
    const judge0FallbackKey = APIKeyService.getAPIKey(JUDGE0_FALLBACK_API_KEY_SERVICE_NAME) || 
                              process.env.NEXT_PUBLIC_JUDGE0_FALLBACK_KEY;

    // Piston Primary
    const pistonPrimaryUrl = APIKeyService.getAPIKey(PISTON_PRIMARY_API_URL_SERVICE_NAME) || 
                             process.env.NEXT_PUBLIC_PISTON_URL || 
                             '/api/piston';
    const pistonPrimaryKey = process.env.NEXT_PUBLIC_PISTON_KEY;

    initExecutionSystem({
      geminiKey: geminiKey || undefined,
      pistonPrimary: pistonPrimaryUrl ? {
        url: pistonPrimaryUrl,
        key: pistonPrimaryKey
      } : undefined,
      judge0Primary: judge0PrimaryUrl ? {
        url: judge0PrimaryUrl,
        key: judge0PrimaryKey || undefined
      } : undefined,
      judge0Fallback: judge0FallbackUrl ? {
        url: judge0FallbackUrl,
        key: judge0FallbackKey || undefined
      } : undefined
    });
  }

  private async evaluateSingleTestCase(
    question: CodingQuestion,
    userCode: string,
    testCase: TestCase
  ): Promise<EvaluationResult> {
    try {
      // 1. Wrap the code with boilerplate (like main function) if needed
      const wrappedCode = CodeWrapper.wrap(userCode, question.codingLanguage, {
        functionSignature: question.functionSignature,
        testCaseInput: testCase.input
      });

      // 2. Execute the code
      const result = await executionService.execute(
        wrappedCode, 
        question.codingLanguage, 
        Array.isArray(testCase.input) ? testCase.input.join('\n') : String(testCase.input || '')
      );

      // 2. Comparison logic
      const actual = String(result.stdout || '').trim();
      const expected = String(testCase.expectedOutput || '').trim();
      
      const statusPassed = result.exitCode === 0;
      const outputMatches = actual === expected;
      const passed = statusPassed && outputMatches;

      let reasoning = '';
      if (passed) {
        reasoning = 'Test case passed successfully.';
      } else if (!statusPassed) {
        reasoning = result.stderr || result.message || 'Execution failed with non-zero exit code.';
      } else {
        reasoning = `Output mismatch. Expected: "${expected}", Actual: "${actual}"`;
      }

      return {
        testCaseId: testCase.id,
        actualOutput: actual || (result.stderr ? `Error: ${result.stderr}` : 'No output'),
        passed,
        reasoning
      };
    } catch (error) {
      return {
        testCaseId: testCase.id,
        passed: false,
        actualOutput: 'Technical Error',
        reasoning: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async evaluateAllTestCases(
    question: CodingQuestion,
    userCode: string
  ): Promise<EvaluationResult[]> {
    this.ensureInitialized();
    const results: EvaluationResult[] = [];
    for (const testCase of question.testCases) {
      const result = await this.evaluateSingleTestCase(question, userCode, testCase);
      results.push(result);
    }
    return results;
  }

  public async evaluatePublicTestCases(
    question: CodingQuestion,
    userCode: string
  ): Promise<EvaluationResult[]> {
    this.ensureInitialized();
    const publicTestCases = question.testCases.filter(tc => tc.isPublic);
    const results: EvaluationResult[] = [];
    for (const testCase of publicTestCases) {
      const result = await this.evaluateSingleTestCase(question, userCode, testCase);
      results.push(result);
    }
    return results;
  }
}