// src/lib/interactive-quiz-kit/schemas/zod/codingQuestionSchema.ts
import { z } from 'zod';

// Schema for a single test case, aligning with the TestCase interface
export const TestCaseSchema = z.object({
  id: z.string().describe("Unique ID for the test case."),
  input: z.array(z.any()).describe("An array of inputs for the function."),
  expectedOutput: z.any().describe("The expected output for the given input."),
  isPublic: z.boolean().describe("Whether this test case is visible to the user before submission."),
});

// Main schema for the Coding Question, aligning with the CodingQuestion interface
export const CodingQuestionSchema = z.object({
  // Required fields from BaseQuestion and CodingQuestion
  id: z.string(),
  questionTypeCode: z.literal("CODING"),
  prompt: z.string(),
  codingLanguage: z.enum(['cpp', 'javascript', 'python', 'swift', 'csharp']),
  solutionCode: z.string().describe("A complete, correct model solution in the specified language."),
  testCases: z.array(TestCaseSchema).min(1).describe("An array of test cases to evaluate the user's code."),

  // Optional fields from CodingQuestion
  functionSignature: z.string().optional().describe("A suggested function signature for the user to implement."),
  
  // Optional fields from BaseQuestion
  points: z.number().optional(),
  explanation: z.string().optional(),
  learningObjective: z.string().optional(),
  glossary: z.array(z.string()).optional(),
  bloomLevelCode: z.string().optional(),
  difficultyCode: z.enum(['VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional(),
  contextCode: z.string().optional(),
  gradeBand: z.string().optional(),
  course: z.string().optional(),
  subject: z.string().optional(),
  category: z.string().optional(),
  topic: z.string().optional(),
  imageUrl: z.string().url().optional(),
  imageAltText: z.string().optional(),
});

// (Optional) Infer TypeScript type from the Zod schema
export type CodingQuestion = z.infer<typeof CodingQuestionSchema>;