import { executionService } from "./ExecutionService";
import { Judge0Provider } from "./providers/Judge0Provider";
import { PistonProvider } from "./providers/PistonProvider";
import { LiteProvider } from "./providers/LiteProvider";
import { AIProvider } from "./providers/AIProvider";

export interface ExecutionConfig {
  url: string;
  key?: string;
  name?: string;
  priority?: number;
}

/**
 * Initialize the execution system with tiered providers.
 */
export function initExecutionSystem(config?: {
  pistonPrimary?: ExecutionConfig;
  judge0Primary?: ExecutionConfig;
  judge0Fallback?: ExecutionConfig;
  geminiKey?: string;
}) {
  // Clear existing providers to avoid duplicates on re-init
  executionService.clearProviders();

  // 1. Register Lite Provider (Base priority)
  executionService.registerProvider(new LiteProvider());

  // 2. Register Judge0 Fallback (Medium priority)
  if (config?.judge0Fallback?.url) {
    executionService.registerProvider(new Judge0Provider(
      config.judge0Fallback.url, 
      config.judge0Fallback.key,
      { 
        id: 'judge0-fallback', 
        name: config.judge0Fallback.name || 'Judge0 Fallback (RapidAPI)',
        priority: config.judge0Fallback.priority || 8 
      }
    ));
  }

  // 3. Register Piston Primary (High priority)
  if (config?.pistonPrimary?.url) {
    executionService.registerProvider(new PistonProvider(
      config.pistonPrimary.url,
      config.pistonPrimary.key,
      {
        id: 'piston-primary',
        name: config.pistonPrimary.name || 'Piston Primary (Self-hosted)',
        priority: config.pistonPrimary.priority || 20
      }
    ));
  }

  // 4. Register Judge0 Primary (High priority - Self-hosted)
  if (config?.judge0Primary?.url) {
    executionService.registerProvider(new Judge0Provider(
      config.judge0Primary.url, 
      config.judge0Primary.key,
      { 
        id: 'judge0-primary', 
        name: config.judge0Primary.name || 'Judge0 Primary (Self-hosted)',
        priority: config.judge0Primary.priority || 15
      }
    ));
  }

  // 4. Register AI Provider (Last resort)
  if (config?.geminiKey) {
    executionService.registerProvider(new AIProvider(config.geminiKey));
  }
}

export * from "./IExecutionProvider";
export * from "./ExecutionService";
export * from "./providers/Judge0Provider";
export * from "./providers/LiteProvider";
export * from "./providers/AIProvider";
