// FILE: src/lib/interactive-quiz-kit/utils/asyncUtils.ts
// ================================================================================
// NEW FILE: Contains higher-order functions and utilities for handling async operations.

/**
 * Options for configuring the retry mechanism.
 */
export interface RetryOptions {
    /** The total number of attempts (1 initial + retries). Defaults to 3. */
    attempts?: number;
    /** The delay in milliseconds between retries. Defaults to 1000ms. */
    delayMs?: number;
    /** An optional callback function that is called upon each failed attempt before the delay. */
    onRetry?: (error: Error, attempt: number) => void;
  }
  
  /**
   * A higher-order function that wraps an asynchronous function with a retry mechanism.
   * 
   * @template T The expected return type of the async function.
   * @param asyncFn The asynchronous function to execute and retry upon failure.
   * @param options Configuration for the retry behavior.
   * @returns A promise that resolves with the result of the `asyncFn` if it succeeds,
   *          or rejects with the last error if all attempts fail.
   */
  export async function withRetry<T>(
    asyncFn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const { attempts = 3, delayMs = 1000, onRetry } = options;
    let lastError: Error | null = null;
  
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        // Attempt to execute the provided async function
        return await asyncFn();
      } catch (error: any) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Execute the onRetry callback if provided
        onRetry?.(lastError, attempt);
  
        // If this was the last attempt, break the loop to throw the error
        if (attempt >= attempts) {
          break;
        }
  
        // Wait for the specified delay before the next attempt
        if (delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
  
    // If the loop completes without a successful return, throw the last captured error.
    throw lastError;
  }