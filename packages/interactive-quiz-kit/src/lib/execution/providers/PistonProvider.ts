import { IExecutionProvider, ExecutionResult } from '../IExecutionProvider';

export class PistonProvider implements IExecutionProvider {
  public readonly id: string;
  public readonly name: string;
  private apiUrl: string;
  private apiKey?: string;
  private customPriority?: number;

  private cachedRuntimes: any[] | null = null;

  constructor(apiUrl: string, apiKey?: string, options?: { id?: string; name?: string; priority?: number }) {
    this.apiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    this.apiKey = apiKey;
    this.id = options?.id || 'piston';
    this.name = options?.name || 'Piston Engine';
    this.customPriority = options?.priority;
  }

  public async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/runtimes`);
      if (response.ok) {
        this.cachedRuntimes = await response.json();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  public async execute(code: string, language: string, stdin?: string): Promise<ExecutionResult> {
    try {
      // 1. Ensure runtimes are cached
      if (!this.cachedRuntimes) {
        const response = await fetch(`${this.apiUrl}/runtimes`);
        if (response.ok) {
          this.cachedRuntimes = await response.json();
        } else {
          throw new Error('Could not fetch Piston runtimes');
        }
      }

      // 2. Map language to Piston runtime
      const lowerLang = language.toLowerCase();
      let targetLang = lowerLang;
      if (lowerLang === 'js') targetLang = 'javascript';
      if (lowerLang === 'c' || lowerLang === 'cpp') targetLang = 'gcc';

      const runtime = this.cachedRuntimes!.find(r => 
        r.language === targetLang || 
        (r.aliases && r.aliases.includes(targetLang))
      );

      if (!runtime) {
        return {
          stdout: '',
          stderr: `Language '${language}' (mapped to '${targetLang}') is not supported by this Piston instance.`,
          exitCode: 1,
          message: 'UNSUPPORTED_LANGUAGE'
        };
      }

      console.log(`[PistonProvider] Calling ${this.name} (${runtime.language} ${runtime.version}) at ${this.apiUrl}...`);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }

      const response = await fetch(`${this.apiUrl}/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          language: runtime.language,
          version: runtime.version,
          files: [{ content: code }],
          stdin: stdin || '',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[PistonProvider] HTTP Error ${response.status}:`, errorText);
        throw new Error(`PISTON_HTTP_ERROR: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`[PistonProvider] result:`, result);
      
      if (result.message) {
        throw new Error(`PISTON_ERROR: ${result.message}`);
      }

      const run = result.run || {};
      const compile = result.compile || {};

      return {
        stdout: run.stdout || '',
        stderr: (compile.stderr || '') + (run.stderr || ''),
        compileOutput: compile.stdout || '',
        exitCode: run.code === 0 ? 0 : 1,
        message: run.signal ? `Terminated by signal: ${run.signal}` : undefined,
      };
    } catch (error) {
      console.error(`[PistonProvider] execution error:`, error);
      throw error;
    }
  }

  public getPriority(language: string): number {
    if (this.customPriority !== undefined) return this.customPriority;
    return 20; 
  }

  public getSupportedLanguages(): string[] {
    // We can be more dynamic here if needed, but let's keep it simple
    return ['python', 'javascript', 'js', 'lua', 'c', 'cpp', 'csharp'];
  }
}
