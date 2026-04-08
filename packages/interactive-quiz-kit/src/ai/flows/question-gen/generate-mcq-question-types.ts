// FILE: src/lib/interactive-quiz-kit/ai/flows/question-gen/generate-mcq-question-types.ts
// ================================================================================
// UPDATED: Added imageUrl to the input schema to support multimodal questions.

import { z } from 'zod';
import type { MultipleChoiceQuestion } from '../../../types';
import { BaseQuestionGenerationClientInputSchema } from './question-generation-schemas';

//================================================================//
// INPUT SCHEMA
//================================================================//

export const GenerateMCQQuestionClientInputSchema = BaseQuestionGenerationClientInputSchema.extend({
  numberOfOptions: z.number().int().min(2).max(6).optional().default(4),
});
export type GenerateMCQQuestionClientInput = z.infer<typeof GenerateMCQQuestionClientInputSchema>;

//================================================================//
// AI OUTPUT SCHEMA (Internal representation from AI)
//================================================================//

export const AIMCQOutputFieldsSchema = z.object({
  prompt: z.string().describe("The question statement itself."),
  options: z.array(
    z.object({
      tempId: z.string().describe("A temporary, unique identifier for this option (e.g., 'A', 'B', '1', '2')."),
      text: z.string().describe("The text content of this answer option."),
    })
  ).min(2).max(6),
  correctTempOptionId: z.string().describe("The temporary ID of the correct option from the generated options array."),
  explanation: z.string().optional().describe("A brief explanation of why the answer is correct."),
  points: z.number().optional().default(10),
  difficultyCode: z.enum(['VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional(),
  topic: z.string().optional(),
  verifiedCategory: z.string().optional().describe("The category this question actually addresses."),
});
export type AIMCQOutputFields = z.infer<typeof AIMCQOutputFieldsSchema>;

//================================================================//
// FINAL OUTPUT TYPE
//================================================================//

export type GenerateMCQQuestionOutput = {
    question?: MultipleChoiceQuestion;
    error?: string;
};