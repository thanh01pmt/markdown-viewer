// FILE: src/lib/interactive-quiz-kit/ai/flows/question-gen/generate-numeric-question-types.ts

import { z } from 'zod';
import type { NumericQuestion } from '../../../types';
import { BaseQuestionGenerationClientInputSchema } from './question-generation-schemas';

//================================================================//
// INPUT SCHEMA
//================================================================//
// LƯU Ý: Schema này ngầm kế thừa trường 'imageUrl' từ schema cơ sở để hỗ trợ câu hỏi đa phương tiện.
export const GenerateNumericQuestionClientInputSchema = BaseQuestionGenerationClientInputSchema.extend({
  allowDecimals: z.boolean().optional().default(true),
  minRange: z.number().optional(),
  maxRange: z.number().optional(),
  // Thêm trường tolerance để client có thể tùy chỉnh
  tolerance: z.number().min(0).optional().default(0),
});
export type GenerateNumericQuestionClientInput = z.infer<typeof GenerateNumericQuestionClientInputSchema>;

//================================================================//
// AI OUTPUT SCHEMA (Internal representation from AI)
//================================================================//

export const AINumericOutputFieldsSchema = z.object({
  prompt: z.string(),
  answer: z.number(),
  // AI có thể đề xuất một tolerance, nhưng chúng ta sẽ ưu tiên của client
  tolerance: z.number().min(0).optional(),
  explanation: z.string().optional(),
  points: z.number().optional().default(10),
  difficultyCode: z.enum(['VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional(),
  topic: z.string().optional(),
  verifiedCategory: z.string().optional(), // Thêm để xác thực
});
export type AINumericOutputFields = z.infer<typeof AINumericOutputFieldsSchema>;

//================================================================//
// FINAL OUTPUT TYPE
//================================================================//

export type GenerateNumericQuestionOutput = {
    question?: NumericQuestion;
    error?: string;
};