/**
 * Result of a code execution.
 */
export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  time?: number; // execution time in ms
  memory?: number; // memory usage in bytes
  message?: string; // system message (e.g. error description)
  compileOutput?: string;
  token?: string; // Judge0 token if applicable
  status?: { id: number; description: string }; // Extended status (mostly for Judge0)
}

/**
 * Interface for all execution providers (Judge0, Lite, AI).
 */
export interface IExecutionProvider {
  id: string;
  name: string;
  
  /**
   * Execute code with given language and input.
   */
  execute(
    code: string,
    language: string,
    stdin?: string,
    options?: any
  ): Promise<ExecutionResult>;

  /**
   * Check if the provider is available in the current environment.
   */
  isAvailable(): Promise<boolean>;

  /**
   * Priority of the provider for a given language.
   * Higher number = higher priority.
   */
  getPriority(language: string): number;

  /**
   * Get supported languages for this provider.
   */
  getSupportedLanguages(): string[];
}
