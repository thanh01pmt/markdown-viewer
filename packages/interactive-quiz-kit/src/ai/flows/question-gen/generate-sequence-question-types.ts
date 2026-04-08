// FILE: src/lib/interactive-quiz-kit/ai/flows/question-gen/generate-sequence-question-types.ts

import { z } from 'zod';
import type { SequenceQuestion } from '../../../types';
import { BaseQuestionGenerationClientInputSchema } from './question-generation-schemas';

//================================================================//
// INPUT SCHEMA
//================================================================//
// LƯU Ý: Schema này ngầm kế thừa trường 'imageUrl' từ schema cơ sở để hỗ trợ câu hỏi đa phương tiện.
export const GenerateSequenceQuestionClientInputSchema = BaseQuestionGenerationClientInputSchema.extend({
  numberOfItems: z.number().int().min(2).max(10).optional().default(4),
});
export type GenerateSequenceQuestionClientInput = z.infer<typeof GenerateSequenceQuestionClientInputSchema>;

//================================================================//
// AI OUTPUT SCHEMA (Internal representation from AI)
//================================================================//

export const AISequenceOutputFieldsSchema = z.object({
  prompt: z.string().describe("The instructional text for the user, e.g., 'Arrange the steps in the correct order.'"),
  // Yêu cầu AI cung cấp các item dưới dạng một mảng duy nhất đã được sắp xếp đúng thứ tự
  // Điều này đơn giản hóa logic và giảm rủi ro
  itemsInCorrectOrder: z.array(z.string().min(1)).min(2).describe("An array of strings, with each string representing an item to be sequenced. The array itself MUST be in the correct final order."),
  explanation: z.string().optional(),
  points: z.number().optional().default(10),
  difficultyCode: z.enum(['VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional(),
  topic: z.string().optional(),
  verifiedCategory: z.string().optional(), // Thêm để xác thực
});
export type AISequenceOutputFields = z.infer<typeof AISequenceOutputFieldsSchema>;

//================================================================//
// FINAL OUTPUT TYPE
//================================================================//

export type GenerateSequenceQuestionOutput = {
    question?: SequenceQuestion;
    error?: string;
};