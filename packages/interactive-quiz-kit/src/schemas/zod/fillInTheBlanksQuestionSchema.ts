import { z } from 'zod';

// Schema cho các thành phần con
const TextSegmentSchema = z.object({
  type: z.literal("text"),
  content: z.string().optional().describe("Text content for 'text' type segments."),
});

const BlankSegmentSchema = z.object({
  type: z.literal("blank"),
  id: z.string().describe("Unique ID for 'blank' type segments, used to map to answers."),
});

// Sử dụng discriminatedUnion để xử lý logic điều kiện
const SegmentSchema = z.discriminatedUnion("type", [
  TextSegmentSchema,
  BlankSegmentSchema,
]);

const AnswerSchema = z.object({
  blankId: z.string().describe("ID of the blank this answer corresponds to."),
  acceptedValues: z.array(z.string()).min(1).describe("Array of acceptable string values for this blank."),
  options: z.array(z.string()).optional().describe("If provided, turns the blank into a dropdown select with these options."),
});

// Schema chính cho câu hỏi Fill In The Blanks
export const FillInTheBlanksQuestionSchema = z.object({
  // Các trường bắt buộc
  id: z.string(),
  questionTypeCode: z.literal("FILL_IN_THE_BLANKS"),
  prompt: z.string().describe("Overall instruction or context for the fill-in-the-blanks sentence(s)."),
  segments: z.array(SegmentSchema).min(1).describe("Array of text and blank segments constructing the question."),
  answers: z.array(AnswerSchema).min(1).describe("Definitions of correct answers for each blank."),

  // Các trường tùy chọn
  isCaseSensitive: z.boolean().optional().describe("Whether answer evaluation should be case sensitive."),
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
export type FillInTheBlanksQuestion = z.infer<typeof FillInTheBlanksQuestionSchema>;