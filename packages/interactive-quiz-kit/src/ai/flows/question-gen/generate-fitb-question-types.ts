// FILE: src/lib/interactive-quiz-kit/ai/flows/question-gen/generate-fitb-question-types.ts

import { z } from 'zod';
import type { FillInTheBlanksQuestion } from '../../../types';
import { BaseQuestionGenerationClientInputSchema } from './question-generation-schemas';

//================================================================//
// INPUT SCHEMA
//================================================================//
// LƯU Ý: Schema này ngầm kế thừa trường 'imageUrl' từ schema cơ sở để hỗ trợ câu hỏi đa phương tiện.
export const GenerateFillInTheBlanksQuestionClientInputSchema = BaseQuestionGenerationClientInputSchema.extend({
  numberOfBlanks: z.number().int().min(1).max(5).optional().default(1),
  isCaseSensitive: z.boolean().optional().default(false),
});
export type GenerateFillInTheBlanksQuestionClientInput = z.infer<typeof GenerateFillInTheBlanksQuestionClientInputSchema>;

//================================================================//
// AI OUTPUT SCHEMA (Internal representation from AI) - REFACTORED
//================================================================//
export const AIFillInTheBlanksOutputFieldsSchema = z.object({
  prompt: z.string().describe("The instructional text for the user, e.g., 'Fill in the blanks to complete the sentence.'"),
  // Yêu cầu AI trả về cấu trúc segments trực tiếp
  segments: z.array(z.object({
    type: z.enum(['text', 'blank']),
    content: z.string().optional().describe("The text content for a 'text' segment."),
    acceptedAnswers: z.array(z.string().min(1)).min(1).optional().describe("An array of correct answers for a 'blank' segment."),
  })).min(1).describe("An array of text and blank segments representing the question."),
  explanation: z.string().optional(),
  points: z.number().optional().default(10),
  difficultyCode: z.enum(['VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional(),
  topic: z.string().optional(),
  verifiedCategory: z.string().optional(), // Thêm để xác thực
});
export type AIFillInTheBlanksOutputFields = z.infer<typeof AIFillInTheBlanksOutputFieldsSchema>;

//================================================================//
// FINAL OUTPUT TYPE
//================================================================//
export type GenerateFillInTheBlanksQuestionOutput = {
    question?: FillInTheBlanksQuestion;
    error?: string;
};