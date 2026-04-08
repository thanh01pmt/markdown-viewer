// FILE: src/lib/interactive-quiz-kit/ai/flows/question-gen/generate-matching-question-types.ts

import { z } from 'zod';
import type { MatchingQuestion } from '../../../types';
import { BaseQuestionGenerationClientInputSchema } from './question-generation-schemas';

//================================================================//
// INPUT SCHEMA
//================================================================//
// LƯU Ý: Schema này ngầm kế thừa trường 'imageUrl' từ schema cơ sở để hỗ trợ câu hỏi đa phương tiện.
export const GenerateMatchingQuestionClientInputSchema = BaseQuestionGenerationClientInputSchema.extend({
  numberOfPairs: z.number().int().min(2).max(8).optional().default(4),
  shuffleOptions: z.boolean().optional().default(true),
});
export type GenerateMatchingQuestionClientInput = z.infer<typeof GenerateMatchingQuestionClientInputSchema>;

//================================================================//
// AI OUTPUT SCHEMA (Internal representation from AI)
//================================================================//

export const AIMatchingOutputFieldsSchema = z.object({
  prompt: z.string().describe("The instructional text for the user, e.g., 'Match the concept to its definition.'"),
  correctPairs: z.array(z.object({
    promptText: z.string().min(1).describe("The text for the left-hand side item (the prompt)."),
    optionText: z.string().min(1).describe("The text for the right-hand side item (the matching option)."),
  })).min(2),
  explanation: z.string().optional(),
  points: z.number().optional().default(10),
  difficultyCode: z.enum(['VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional(),
  topic: z.string().optional(),
  verifiedCategory: z.string().optional(), // Thêm để xác thực
});
export type AIMatchingOutputFields = z.infer<typeof AIMatchingOutputFieldsSchema>;

//================================================================//
// FINAL OUTPUT TYPE
//================================================================//

export type GenerateMatchingQuestionOutput = {
    question?: MatchingQuestion;
    error?: string;
};