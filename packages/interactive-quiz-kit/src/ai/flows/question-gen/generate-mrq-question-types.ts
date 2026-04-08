// FILE: src/lib/interactive-quiz-kit/ai/flows/question-gen/generate-mrq-question-types.ts
// ================================================================================
// UPDATED: Added 'verifiedCategory' to AI output schema for consistency and type safety.

import { z } from 'zod';
import type { MultipleResponseQuestion } from '../../../types';
import { BaseQuestionGenerationClientInputSchema } from './question-generation-schemas';

//================================================================//
// INPUT SCHEMA
//================================================================//
// LƯU Ý: Schema này ngầm kế thừa trường 'imageUrl' từ schema cơ sở để hỗ trợ câu hỏi đa phương tiện.
export const GenerateMRQQuestionClientInputSchema = BaseQuestionGenerationClientInputSchema.extend({
  numberOfOptions: z.number().int().min(2).max(8).optional().default(5),
  minCorrectAnswers: z.number().int().min(1).optional().default(2),
  maxCorrectAnswers: z.number().int().min(1).optional().default(3),
});
export type GenerateMRQQuestionClientInput = z.infer<typeof GenerateMRQQuestionClientInputSchema>;

//================================================================//
// AI OUTPUT SCHEMA (Internal representation from AI)
//================================================================//

export const AIMRQOutputFieldsSchema = z.object({
  prompt: z.string(),
  options: z.array(z.object({ tempId: z.string(), text: z.string() })).min(2).max(8),
  correctTempOptionIds: z.array(z.string()).min(1),
  explanation: z.string().optional(),
  points: z.number().optional().default(10),
  difficultyCode: z.enum(['VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional(),
  topic: z.string().optional(),
  verifiedCategory: z.string().optional().describe("The category this question actually addresses."),
});
export type AIMRQOutputFields = z.infer<typeof AIMRQOutputFieldsSchema>;

//================================================================//
// FINAL OUTPUT TYPE
//================================================================//

export type GenerateMRQQuestionOutput = {
    question?: MultipleResponseQuestion;
    error?: string;
};