import { z } from 'zod';

// Định nghĩa schema cho câu hỏi Lập trình Scratch
export const ScratchProgrammingQuestionSchema = z.object({
  // Các trường bắt buộc (required)
  id: z.string(),
  questionTypeCode: z.literal("SCRATCH_PROGRAMMING"),
  prompt: z.string(),
  toolboxDefinition: z.string().describe("XML string defining the Blockly/Scratch toolbox."),

  // Các trường tùy chọn (optional)
  initialWorkspace: z.string().optional().describe("Optional XML string for the initial state of the workspace."),
  solutionWorkspaceXML: z.string().optional().describe("Optional XML string representing the solution blocks."),
  solutionGeneratedCode: z.string().optional().describe("The code or logic representation that a correct program should achieve, used for grading."),
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
export type ScratchProgrammingQuestion = z.infer<typeof ScratchProgrammingQuestionSchema>;

// (Tùy chọn) Ví dụ sử dụng
const exampleData = {
  id: "scrq-001",
  questionTypeCode: "SCRATCH_PROGRAMMING",
  prompt: "Make the cat move 10 steps.",
  toolboxDefinition: "<xml>...</xml>",
  solutionGeneratedCode: "move(10)"
};

// Xác thực dữ liệu
try {
  const validatedQuestion = ScratchProgrammingQuestionSchema.parse(exampleData);
  console.log("Validation successful:", validatedQuestion);
} catch (error) {
  console.error("Validation failed:", error);
}