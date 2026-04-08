import { z } from 'zod';

// Schema cho một lựa chọn (option) - có thể tái sử dụng từ file khác
const QuestionOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
});

// Schema chính cho câu hỏi Multiple Response
export const MultipleResponseQuestionSchema = z.object({
  // Các trường bắt buộc
  id: z.string(),
  questionTypeCode: z.literal("MULTIPLE_RESPONSE"),
  prompt: z.string(),
  options: z.array(QuestionOptionSchema).min(1),
  correctAnswerIds: z.array(z.string()).min(1).describe("Array of IDs of the correct options."),

  // Các trường tùy chọn
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
export type MultipleResponseQuestion = z.infer<typeof MultipleResponseQuestionSchema>;