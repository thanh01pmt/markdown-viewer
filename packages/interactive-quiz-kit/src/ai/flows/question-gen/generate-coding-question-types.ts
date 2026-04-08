// src/lib/interactive-quiz-kit/ai/flows/question-gen/generate-coding-question-types.ts

import { z } from 'zod';
import type { CodingQuestion, SupportedCodingLanguage } from '../../../types';
import { BaseQuestionGenerationClientInputSchema } from './question-generation-schemas';

export const GenerateCodingQuestionClientInputSchema = BaseQuestionGenerationClientInputSchema.extend({
  codingLanguage: z.enum(['cpp', 'javascript', 'python', 'swift', 'csharp']),
});
export type GenerateCodingQuestionClientInput = z.infer<typeof GenerateCodingQuestionClientInputSchema>;

export const AICodingQuestionOutputSchema = z.object({
  prompt: z.string().describe("The problem description for the user."),
  functionSignature: z.string().optional().describe("A suggested function signature for the user to implement."),
  solutionCode: z.string().describe("A complete, correct model solution in the specified language."),
  testCases: z.array(z.object({
    input: z.array(z.any()),
    // FIX: Use .refine to make it explicitly non-optional for TypeScript's inference
    expectedOutput: z.any().refine(val => val !== undefined, {
      message: "expectedOutput is required and cannot be undefined.",
    }),
    isPublic: z.boolean(),
  })).min(3, { message: "Must provide at least 3 test cases." }),
  verifiedCodingLanguage: z.enum(['cpp', 'javascript', 'python', 'swift', 'csharp']).optional().describe("The programming language this question actually addresses."),
});
export type AICodingQuestionOutput = z.infer<typeof AICodingQuestionOutputSchema>;

export type GenerateCodingQuestionOutput = {
    question?: CodingQuestion;
    error?: string;
};