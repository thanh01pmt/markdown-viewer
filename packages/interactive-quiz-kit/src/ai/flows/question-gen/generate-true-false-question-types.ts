// FILE: src/lib/interactive-quiz-kit/ai/flows/question-gen/generate-true-false-question-types.ts

import { z } from 'zod';
import type { TrueFalseQuestion } from '../../../types';
import { BaseQuestionGenerationClientInputSchema } from './question-generation-schemas';

//================================================================//
// INPUT SCHEMA
//================================================================//
// LƯU Ý: Schema này ngầm kế thừa trường 'imageUrl' từ schema cơ sở để hỗ trợ câu hỏi đa phương tiện.
// Không cần trường bổ sung, chỉ cần extend từ base
export const GenerateTrueFalseQuestionClientInputSchema = BaseQuestionGenerationClientInputSchema.extend({});
export type GenerateTrueFalseQuestionClientInput = z.infer<typeof GenerateTrueFalseQuestionClientInputSchema>;

//================================================================//
// AI OUTPUT SCHEMA (Internal representation from AI)
//================================================================//

export const AITrueFalseOutputFieldsSchema = z.object({
  prompt: z.string().describe("The statement that the user will evaluate as true or false."),
  correctAnswer: z.boolean(),
  explanation: z.string().optional().describe("An explanation of why the statement is true or false, especially important if false."),
  points: z.number().optional().default(10),
  difficultyCode: z.enum(['VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional(),
  topic: z.string().optional(),
  verifiedCategory: z.string().optional(), // Thêm để xác thực
});
export type AITrueFalseOutputFields = z.infer<typeof AITrueFalseOutputFieldsSchema>;

//================================================================//
// FINAL OUTPUT TYPE
//================================================================//

export type GenerateTrueFalseQuestionOutput = {
    question?: TrueFalseQuestion;
    error?: string;
};