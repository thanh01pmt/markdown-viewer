import { z } from 'zod';

// Định nghĩa schema cho câu hỏi Lập trình Blockly
export const BlocklyProgrammingQuestionSchema = z.object({
  // Các trường bắt buộc (required)
  id: z.string(),
  questionTypeCode: z.literal("BLOCKLY_PROGRAMMING"),
  prompt: z.string(),
  toolboxDefinition: z.string().describe("XML string defining the Blockly toolbox."),

  // Các trường tùy chọn (optional)
  initialWorkspace: z.string().optional().describe("Optional XML string for the initial state of the Blockly workspace."),
  solutionWorkspaceXML: z.string().optional().describe("Optional XML string representing the solution, for visual display."),
  solutionGeneratedCode: z.string().optional().describe("The JavaScript code that a correct Blockly program should generate, used for grading."),
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

// (Tùy chọn) Suy luận kiểu TypeScript từ Zod Schema
export type BlocklyProgrammingQuestion = z.infer<typeof BlocklyProgrammingQuestionSchema>;

// (Tùy chọn) Ví dụ sử dụng
const exampleData = {
  id: "blkq-001",
  questionTypeCode: "BLOCKLY_PROGRAMMING",
  prompt: "Create a program to say 'Hello!'",
  toolboxDefinition: "<xml>...</xml>",
  solutionGeneratedCode: "window.alert('Hello!');"
};

// Xác thực dữ liệu
try {
  const validatedQuestion = BlocklyProgrammingQuestionSchema.parse(exampleData);
  console.log("Validation successful:", validatedQuestion);
} catch (error) {
  console.error("Validation failed:", error);
}