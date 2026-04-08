// FILE: src/lib/interactive-quiz-kit/ai/flows/question-gen/generate-short-answer-question-types.ts

import { z } from 'zod';
import type { ShortAnswerQuestion } from '../../../types';
import { BaseQuestionGenerationClientInputSchema } from './question-generation-schemas';

//================================================================//
// INPUT SCHEMA
//================================================================//
// LƯU Ý: Schema này ngầm kế thừa trường 'imageUrl' từ schema cơ sở để hỗ trợ câu hỏi đa phương tiện.
export const GenerateShortAnswerQuestionClientInputSchema = BaseQuestionGenerationClientInputSchema.extend({
  isCaseSensitive: z.boolean().optional().default(false),
});
export type GenerateShortAnswerQuestionClientInput = z.infer<typeof GenerateShortAnswerQuestionClientInputSchema>;

//================================================================//
// AI OUTPUT SCHEMA (Internal representation from AI)
//================================================================//

export const AIShortAnswerOutputFieldsSchema = z.object({
  prompt: z.string().describe("The question text that prompts the user for a short answer."),
  acceptedAnswers: z.array(z.string().min(1)).min(1).describe("An array of one or more acceptable short answers. Include common variations if applicable."),
  // isCaseSensitive không cần thiết ở đây, chúng ta sẽ quản lý nó ở phía client
  explanation: z.string().optional(),
  points: z.number().optional().default(10),
  difficultyCode: z.enum(['VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional(),
  topic: z.string().optional(),
  verifiedCategory: z.string().optional(), // Thêm để xác thực
});
export type AIShortAnswerOutputFields = z.infer<typeof AIShortAnswerOutputFieldsSchema>;

//================================================================//
// FINAL OUTPUT TYPE
//================================================================//

export type GenerateShortAnswerQuestionOutput = {
    question?: ShortAnswerQuestion;
    error?: string;
};