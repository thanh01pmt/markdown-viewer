import { z } from 'zod';

// Schema chính cho câu hỏi Numeric
export const NumericQuestionSchema = z.object({
  // Các trường bắt buộc
  id: z.string(),
  questionTypeCode: z.literal("NUMERIC"),
  prompt: z.string(),
  answer: z.number().describe("The precise numerical correct answer."),

  // Các trường tùy chọn
  tolerance: z.number().optional().describe("The acceptable range of error (plus or minus)."),
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
export type NumericQuestion = z.infer<typeof NumericQuestionSchema>;