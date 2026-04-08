import { z } from 'zod';

// Schema cho một mục trong chuỗi
const SequenceItemSchema = z.object({
  id: z.string().describe("Unique ID for the item."),
  content: z.string().describe("Text content of the item."),
});

// Schema chính cho câu hỏi Sequence
export const SequenceQuestionSchema = z.object({
  // Các trường bắt buộc
  id: z.string(),
  questionTypeCode: z.literal("SEQUENCE"),
  prompt: z.string(),
  items: z.array(SequenceItemSchema)
    .min(2) // Tương đương với "minItems": 2
    .describe("Array of items to be sequenced."),
  correctOrder: z.array(z.string())
    .min(2) // Tương đương với "minItems": 2
    .describe("Array of item IDs in the correct sequence."),

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
export type SequenceQuestion = z.infer<typeof SequenceQuestionSchema>;