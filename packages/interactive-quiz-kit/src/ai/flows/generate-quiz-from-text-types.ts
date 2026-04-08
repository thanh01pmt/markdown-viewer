// FILE: src/lib/interactive-quiz-kit/ai/flows/generate-quiz-from-text-types.ts
// ================================================================================
// UPDATED: Corrected the export name for GenerateQuizFromTextOutputSchema.

import { z } from 'zod';
import {
  MultipleChoiceQuestionZodSchema,
  TrueFalseQuestionZodSchema,
  ShortAnswerQuestionZodSchema,
} from './question-gen/question-generation-schemas'; 

// --- Input Schema ---

export const GenerateQuizFromTextInputSchema = z.object({
  language: z.string().optional().default('English'),
  documentContent: z.string().min(100, { message: "Document content must be substantial enough to generate a quiz." }),
  numQuestions: z.number().int().min(1).max(20).optional().default(10),
  questionTypes: z.array(z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'])).optional(),
});
export type GenerateQuizFromTextClientInput = z.infer<typeof GenerateQuizFromTextInputSchema>;


// --- Output Schema ---

// A union of the simple question types suitable for text-based generation.
const AnyGeneratedQuestionSchema = z.union([
  MultipleChoiceQuestionZodSchema,
  TrueFalseQuestionZodSchema,
  ShortAnswerQuestionZodSchema,
]);

export const GenerateQuizFromTextOutputSchema = z.object({
  generatedQuestions: z.array(AnyGeneratedQuestionSchema),
});
export type GenerateQuizFromTextOutput = z.infer<typeof GenerateQuizFromTextOutputSchema>;