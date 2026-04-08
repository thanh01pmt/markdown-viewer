// FILE: src/lib/interactive-quiz-kit/ai/flows/evaluate-user-code-types.ts
// ================================================================================
// NEW FILE: Contains Zod schemas and TypeScript types for the AI code evaluation flow.
// This file does NOT use 'use server' and can be safely imported anywhere.

import { z } from 'zod';
import type { SupportedCodingLanguage, TestCase } from '../../types';

//================================================================//
// SCHEMA DEFINITIONS
//================================================================//

export const EvaluateUserCodeClientInputSchema = z.object({
  language: z.custom<SupportedCodingLanguage>(),
  problemPrompt: z.string(),
  userCode: z.string(),
  testCase: z.custom<TestCase>(),
});
export type EvaluateUserCodeClientInput = z.infer<typeof EvaluateUserCodeClientInputSchema>;

const AIEvaluationOutputSchema = z.object({
  passed: z.boolean().describe("Did the user's code produce the expected output for the given input?"),
  actualOutput: z.any().describe("The actual output produced by the user's code."),
  reasoning: z.string().describe("A brief explanation of why the code passed or failed, or if there was a syntax error."),
});
export type AIEvaluationOutput = z.infer<typeof AIEvaluationOutputSchema>;

export const EvaluateUserCodeOutputSchema = AIEvaluationOutputSchema;
export type EvaluateUserCodeOutput = z.infer<typeof EvaluateUserCodeOutputSchema>;