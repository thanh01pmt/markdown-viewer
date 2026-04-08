import { z } from 'zod';

// Schema chính cho câu hỏi Short Answer
export const ShortAnswerQuestionSchema = z.object({
  // Các trường bắt buộc
  id: z.string(),
  questionTypeCode: z.literal("SHORT_ANSWER"),
  prompt: z.string(),
  acceptedAnswers: z.array(z.string()).min(1).describe("An array of acceptable short answers."),

  // Các trường tùy chọn
  isCaseSensitive: z.boolean().optional().describe("Whether the answer evaluation should be case sensitive."),
  points: z.number().optional(),
  explanation: z.string().optional(),
  learningObjective: z.string().optional(),
  glossary: z.array(z.string()).optional(),
  bloomLevelCode: z.string().optional(),
  difficultyCode: z.enum(['VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional(),
  contextCode: z.string().optional(),
  gradeBand: z.string().optional(),
  course: z.string().optional(),
  category: z.string().optional(),
  topic: z.string().optional(),
});

// (Tùy chọn) Suy luận kiểu TypeScript
export type ShortAnswerQuestion = z.infer<typeof ShortAnswerQuestionSchema>;