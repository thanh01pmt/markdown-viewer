import { IExecutionProvider, ExecutionResult } from '../IExecutionProvider';
import { GoogleGenerativeAI } from "@google/generative-ai";

export class AIProvider implements IExecutionProvider {
  public readonly id = 'ai';
  public readonly name = 'Gemini AI';
  private client: GoogleGenerativeAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new GoogleGenerativeAI(apiKey);
    }
  }

  public async isAvailable(): Promise<boolean> {
    return !!this.client;
  }

  public async execute(code: string, language: string, stdin?: string): Promise<ExecutionResult> {
    if (!this.client) {
      return {
        stdout: '',
        stderr: 'AI provider is not configured (missing API Key).',
        exitCode: 1,
        message: 'MISSING_API_KEY'
      };
    }

    try {
      const model = this.client.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
        }
      });
      
      const prompt = `
          You are a code execution engine. Execute the following ${language} code and return the result in JSON format.
          
          CODE:
          ${code}
          
          STDIN:
          ${stdin || '(none)'}
          
          EXPECTED JSON FORMAT:
          {
            "stdout": "string",
            "stderr": "string",
            "exitCode": number,
            "explanation": "brief explanation of what the code did"
          }
        `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = JSON.parse(text || '{}');

      return {
        stdout: parsed.stdout || '',
        stderr: parsed.stderr || '',
        exitCode: typeof parsed.exitCode === 'number' ? parsed.exitCode : 0,
        message: parsed.explanation
      };
    } catch (error) {
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
        message: 'AI_EXECUTION_FAILED'
      };
    }
  }

  public getPriority(language: string): number {
    // AI is fallback, so low priority.
    return 1;
  }

  public getSupportedLanguages(): string[] {
    // AI can interpret almost anything.
    return ['javascript', 'python', 'lua', 'cpp', 'java', 'c', 'csharp', 'ruby', 'go', 'php'];
  }
}
