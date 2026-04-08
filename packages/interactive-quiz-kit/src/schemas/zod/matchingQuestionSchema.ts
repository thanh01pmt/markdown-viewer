import { z } from 'zod';

// Schema cho các thành phần con
const MatchPromptItemSchema = z.object({
  id: z.string(),
  content: z.string(),
});

const MatchOptionItemSchema = z.object({
  id: z.string(),
  content: z.string(),
});

const CorrectAnswerMapSchema = z.object({
  promptId: z.string(),
  optionId: z.string(),
});

// Schema chính cho câu hỏi Matching
export const MatchingQuestionSchema = z.object({
  // Các trường bắt buộc
  id: z.string(),
  questionTypeCode: z.literal("MATCHING"),
  prompt: z.string(),
  prompts: z.array(MatchPromptItemSchema).min(1).describe("Array of items to be matched (e.g., terms, questions)."),
  options: z.array(MatchOptionItemSchema).min(1).describe("Array of choices to match with the prompts (e.g., definitions, answers)."),
  correctAnswerMap: z.array(CorrectAnswerMapSchema).min(1).describe("Array defining the correct pairings between prompt IDs and option IDs."),

  // Các trường tùy chọn
  shuffleOptions: z.boolean().optional().describe("Whether the display order of options should be shuffled for the user."),
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
export type MatchingQuestion = z.infer<typeof MatchingQuestionSchema>;