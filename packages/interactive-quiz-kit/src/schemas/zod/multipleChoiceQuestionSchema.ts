import { z } from 'zod';

// Định nghĩa schema cho một lựa chọn (option)
const QuestionOptionSchema = z.object({
  id: z.string().describe("Unique ID for the option."),
  text: z.string().describe("Text content of the option."),
});

// Định nghĩa schema chính cho câu hỏi Multiple Choice
export const MultipleChoiceQuestionSchema = z.object({
  // Các trường bắt buộc (required)
  id: z.string().describe("Unique identifier."),
  questionTypeCode: z.literal("MULTIPLE_CHOICE"), // Tương đương với "const" trong JSON Schema
  prompt: z.string().describe("Question statement."),
  options: z.array(QuestionOptionSchema)
    .min(1) // Tương đương với "minItems"
    .describe("Array of answer choices."),
  correctAnswerId: z.string().describe("ID of the correct option."),

  // Các trường tùy chọn (optional)
  points: z.number().optional().describe("Points for correct answer."),
  explanation: z.string().optional().describe("Explanation for the answer."),
  learningObjective: z.string().optional(),
  glossary: z.array(z.string()).optional(),
  bloomLevelCode: z.string().optional(),
  difficultyCode: z.enum(['VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional(), // Có thể làm chặt chẽ hơn với z.enum
  contextCode: z.string().optional(),
  gradeBand: z.string().optional(),
  course: z.string().optional(),
  category: z.string().optional(),
  topic: z.string().optional(),
});

// (Tùy chọn) Suy luận kiểu TypeScript từ Zod Schema
export type MultipleChoiceQuestion = z.infer<typeof MultipleChoiceQuestionSchema>;

// (Tùy chọn) Ví dụ sử dụng
const exampleData = {
  id: "mcq-123",
  questionTypeCode: "MULTIPLE_CHOICE",
  prompt: "What is 2 + 2?",
  options: [
    { id: "opt-1", text: "3" },
    { id: "opt-2", text: "4" },
  ],
  correctAnswerId: "opt-2",
  points: 10,
};

// Xác thực dữ liệu
try {
  const validatedQuestion = MultipleChoiceQuestionSchema.parse(exampleData);
  console.log("Validation successful:", validatedQuestion);
} catch (error) {
  console.error("Validation failed:", error);
}