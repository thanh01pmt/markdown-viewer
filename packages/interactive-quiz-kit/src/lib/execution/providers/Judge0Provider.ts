import { IExecutionProvider, ExecutionResult } from '../IExecutionProvider';

export class Judge0Provider implements IExecutionProvider {
  public readonly id: string;
  public readonly name: string;
  private apiUrl: string;
  private apiKey?: string;
  private customPriority?: number;

  private languageMap: Record<string, number> = {
    'python': 71,
    'javascript': 63,
    'typescript': 74,
    'c': 50,
    'cpp': 54,
    'csharp': 51,
    'java': 62,
    'lua': 64,
  };

  constructor(apiUrl: string, apiKey?: string, options?: { id?: string; name?: string; priority?: number }) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.id = options?.id || 'judge0';
    this.name = options?.name || 'Judge0 Professional';
    this.customPriority = options?.priority;
  }

  public async isAvailable(): Promise<boolean> {
    return !!this.apiUrl;
  }

  private toBase64(str: string): string {
    try {
      // Robust UTF-8 to Base64 (Browser compatible)
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => 
        String.fromCharCode(parseInt(p1, 16))
      ));
    } catch (e) {
      return btoa(str); // Fallback
    }
  }

  private fromBase64(str: string): string {
    if (!str) return '';
    try {
      // Robust Base64 to UTF-8 (Browser compatible)
      return decodeURIComponent(
        atob(str)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch (e) {
      return atob(str); // Fallback
    }
  }

  public async execute(code: string, language: string, stdin?: string): Promise<ExecutionResult> {
    const languageId = this.languageMap[language.toLowerCase()];
    if (!languageId) {
      return {
        stdout: '',
        stderr: `Language '${language}' is not supported by Judge0 provider yet.`,
        exitCode: 1,
        message: 'UNSUPPORTED_LANGUAGE'
      };
    }

    try {
      console.log(`[Judge0Provider] Calling ${this.name} at ${this.apiUrl}...`);
      const response = await fetch(`${this.apiUrl}/submissions?base64_encoded=true&wait=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && (this.apiUrl.includes('rapidapi.com') 
            ? { 
                'x-rapidapi-key': this.apiKey,
                'x-rapidapi-host': new URL(this.apiUrl).hostname
              } 
            : { 'X-Auth-Token': this.apiKey }))
        },
        body: JSON.stringify({
          source_code: this.toBase64(code),
          language_id: languageId,
          stdin: stdin ? this.toBase64(stdin) : undefined
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Judge0Provider] ${this.name} HTTP Error ${response.status}:`, errorText);
        throw new Error(`PROVIDER_HTTP_ERROR: ${response.status} - ${errorText}`);
      }

      let result = await response.json();
      console.log(`[Judge0Provider] ${this.name} initial result:`, result);

      // Handle RapidAPI/Judge0 specific error messages in initial response
      if (result.message) {
        if (result.message.includes('not subscribed')) {
          console.warn(`[Judge0Provider] ${this.name} auth failed, triggering fallback...`);
          throw new Error('AUTH_FAILED: Not subscribed');
        }
        if (result.message.includes('rate limit')) {
          console.warn(`[Judge0Provider] ${this.name} rate limited, triggering fallback...`);
          throw new Error('RATE_LIMIT_EXCEEDED');
        }
      }

      // If status is In Queue (1) or Processing (2), wait and poll
      // wait=true should handle this, but some local instances or RapidAPI might return early
      let attempts = 0;
      const maxAttempts = 10;
      while ((result.status?.id === 1 || result.status?.id === 2) && attempts < maxAttempts) {
        console.log(`[Judge0Provider] ${this.name} polling... (status: ${result.status?.description})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const pollResponse = await fetch(`${this.apiUrl}/submissions/${result.token}?base64_encoded=true`, {
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey && (this.apiUrl.includes('rapidapi.com') 
              ? { 
                  'x-rapidapi-key': this.apiKey,
                  'x-rapidapi-host': new URL(this.apiUrl).hostname
                } 
              : { 'X-Auth-Token': this.apiKey }))
          }
        });

        if (pollResponse.ok) {
          result = await pollResponse.json();
          console.log(`[Judge0Provider] ${this.name} poll result (attempt ${attempts + 1}):`, result);
        } else {
          console.error(`[Judge0Provider] Poll failed: ${pollResponse.status}`);
          break;
        }
        attempts++;
      }

      return {
        stdout: this.fromBase64(result.stdout),
        stderr: this.fromBase64(result.stderr),
        compileOutput: this.fromBase64(result.compile_output),
        exitCode: result.status?.id === 3 ? 0 : 1, // 3 is "Accepted"
        time: result.time ? parseFloat(result.time) * 1000 : undefined,
        memory: result.memory ? parseInt(result.memory) : undefined,
        message: result.status?.description,
        status: result.status,
        token: result.token
      };
    } catch (error) {
      console.error(`[Judge0Provider] ${this.name} execution error:`, error);
      throw error; // Rethrow so ExecutionService can handle fallback
    }
  }

  public getPriority(language: string): number {
    if (this.customPriority !== undefined) return this.customPriority;
    
    // Default priority logic
    const compiled = ['cpp', 'c', 'java', 'csharp'];
    return compiled.includes(language.toLowerCase()) ? 10 : 5;
  }

  public getSupportedLanguages(): string[] {
    return Object.keys(this.languageMap);
  }
}
