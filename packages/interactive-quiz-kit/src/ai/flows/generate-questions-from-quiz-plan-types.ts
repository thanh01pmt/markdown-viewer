// FILE: src/lib/interactive-quiz-kit/ai/flows/generate-questions-from-quiz-plan-types.ts
// ================================================================================
// UPDATED: Added `imageContexts` to the input schema to pass the image library.

import { z } from 'zod';
import type { PlannedQuestion } from './generate-quiz-plan-types';
import type { ImageContextItem } from '../../types/misc';

//================================================================//
// SCHEMA DEFINITIONS
//================================================================//

export const GenerateQuestionsFromQuizPlanClientInputSchema = z.object({
  quizPlan: z.array(z.custom<PlannedQuestion>()).min(1),
  language: z.string().optional().default('English'),
  imageContexts: z.array(z.custom<ImageContextItem>()).optional().describe("Library of available image contexts passed from the client."),
});
export type GenerateQuestionsFromQuizPlanClientInput = z.infer<typeof GenerateQuestionsFromQuizPlanClientInputSchema>;

export const GenerationErrorSchema = z.object({
  plannedQuestionIndex: z.number(),
  plannedTopic: z.string(),
  plannedQuestionTypeCode: z.string(),
  error: z.string(),
});
export type GenerationError = z.infer<typeof GenerationErrorSchema>;

export const GenerateQuestionsFromQuizPlanOutputSchema = z.object({
  generatedQuestions: z.array(z.any()),
  errors: z.array(GenerationErrorSchema).optional(),
});
export type GenerateQuestionsFromQuizPlanOutput = z.infer<typeof GenerateQuestionsFromQuizPlanOutputSchema>;