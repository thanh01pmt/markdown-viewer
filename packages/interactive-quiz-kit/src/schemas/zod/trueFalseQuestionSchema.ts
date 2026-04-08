import { z } from 'zod';

// Schema chính cho câu hỏi True/False
export const TrueFalseQuestionSchema = z.object({
  // Các trường bắt buộc
  id: z.string().describe("Unique identifier for the question."),
  questionTypeCode: z.literal("TRUE_FALSE").describe("The type of the question."),
  prompt: z.string().describe("The main text or statement for the question."),
  correctAnswer: z.boolean().describe("The correct answer for the statement (true if the statement is true, false if it is false)."),

  // Các trường tùy chọn
  points: z.number().optional().describe("Points awarded for a correct answer."),
  explanation: z.string().optional().describe("Explanation for why the answer is correct or incorrect."),
  learningObjective: z.string().optional().describe("The learning objective this question addresses."),
  glossary: z.array(z.string()).optional().describe("List of related glossary terms."),
  bloomLevelCode: z.string().optional().describe("Cognitive level based on Bloom's Taxonomy (e.g., 'Remembering', 'Applying')."),
  difficultyCode: z.enum(['VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional().describe("Difficulty level of the question."),
  contextCode: z.string().optional().describe("Identifier for the context of the question."),
  gradeBand: z.string().optional().describe("Target grade band for the question (e.g., 'K-2', 'Middle School')."),
  course: z.string().optional().describe("Associated course name."),
  category: z.string().optional().describe("General category of the question content (e.g., 'Mathematics', 'History')."),
  topic: z.string().optional().describe("Specific topic within the category."),
});

// (Tùy chọn) Suy luận kiểu TypeScript
export type TrueFalseQuestion = z.infer<typeof TrueFalseQuestionSchema>;