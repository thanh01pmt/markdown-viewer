import { IExecutionProvider, ExecutionResult } from "./IExecutionProvider";
import { Judge0Provider } from "./providers/Judge0Provider";
import { PistonProvider } from "./providers/PistonProvider";

/**
 * Service to manage and select code execution providers.
 */
export class ExecutionService {
  private static instance: ExecutionService;
  private providers: Map<string, IExecutionProvider> = new Map();

  private constructor() {}

  public static getInstance(): ExecutionService {
    if (!ExecutionService.instance) {
      ExecutionService.instance = new ExecutionService();
    }
    return ExecutionService.instance;
  }

  /**
   * Clear all registered providers.
   */
  public clearProviders(): void {
    this.providers.clear();
  }

  /**
   * Register a provider.
   */
  public registerProvider(provider: IExecutionProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Get all registered providers.
   */
  public getProviders(): IExecutionProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get the best provider for a language based on priority and availability.
   */
  public async getBestProvider(language: string): Promise<IExecutionProvider | null> {
    const lang = language.toLowerCase();
    const sortedProviders = Array.from(this.providers.values())
      .filter(p => p.getSupportedLanguages().map(l => l.toLowerCase()).includes(lang))
      .sort((a, b) => b.getPriority(lang) - a.getPriority(lang));

    console.log(`[ExecutionService] Finding best provider for '${language}' (normalized: '${lang}'). Found ${sortedProviders.length} potential providers.`);
    
    for (const provider of sortedProviders) {
      if (await provider.isAvailable()) {
        console.log(`[ExecutionService] Selected provider: ${provider.name} (ID: ${provider.id})`);
        return provider;
      }
    }

    return null;
  }

  /**
   * Execute code using the best available provider with automatic fallback.
   */
  public async execute(
    code: string,
    language: string,
    stdin?: string
  ): Promise<ExecutionResult> {
    const lang = language.toLowerCase();
    const providers = Array.from(this.providers.values())
      .filter(p => p.getSupportedLanguages().map(l => l.toLowerCase()).includes(lang))
      .sort((a, b) => b.getPriority(lang) - a.getPriority(lang));

    console.log(`[ExecutionService] Executing for '${language}'. Providers in order:`, providers.map(p => `${p.name} (${p.id})`));

    if (providers.length === 0) {
      return {
        stdout: "",
        stderr: `No execution provider available for language: ${language}`,
        exitCode: 1,
        message: "EXECUTION_ERROR_NO_PROVIDER"
      };
    }

    let lastError: any = null;

    for (const provider of providers) {
      try {
        if (!(await provider.isAvailable())) continue;

        const result = await provider.execute(code, language, stdin);
        
        // If it's a "recoverable" error (like rate limit or generic API failure), 
        // and we have more providers, try the next one.
        const isRecoverable = 
          result.message === 'RATE_LIMIT_EXCEEDED' || 
          result.message === 'AUTH_FAILED' ||
          result.message === 'UNSUPPORTED_LANGUAGE' ||
          result.message === 'EXECUTION_ERROR' ||
          result.status?.id === 13 || // Internal Error
          result.exitCode === 1 && !result.stderr; // Generic failure without stderr

        if (isRecoverable && providers.indexOf(provider) < providers.length - 1) {
          lastError = result;
          continue; 
        }

        return result;
      } catch (error: any) {
        lastError = error;
        // Continue to next provider on crash
      }
    }

    return {
      stdout: "",
      stderr: lastError?.stderr || lastError?.message || "All execution providers failed",
      exitCode: 1,
      message: "EXECUTION_ERROR_ALL_FAILED"
    };
  }
}

export const executionService = ExecutionService.getInstance();
