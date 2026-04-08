// FILE: schemas/zod/quizConfigSchema.ts
// ================================================================================

import { z } from 'zod';

// --- Step 1: Assume question schemas are defined ---
// (These are the schemas we created in previous steps, represented here as stubs for clarity)
const MultipleChoiceQuestionSchema = z.object({ questionTypeCode: z.literal("MULTIPLE_CHOICE") }).passthrough();
const MultipleResponseQuestionSchema = z.object({ questionTypeCode: z.literal("MULTIPLE_RESPONSE") }).passthrough();
const FillInTheBlanksQuestionSchema = z.object({ questionTypeCode: z.literal("FILL_IN_THE_BLANKS") }).passthrough();
const DragAndDropQuestionSchema = z.object({ questionTypeCode: z.literal("DRAG_AND_DROP") }).passthrough();
const TrueFalseQuestionSchema = z.object({ questionTypeCode: z.literal("TRUE_FALSE") }).passthrough();
const ShortAnswerQuestionSchema = z.object({ questionTypeCode: z.literal("SHORT_ANSWER") }).passthrough();
const NumericQuestionSchema = z.object({ questionTypeCode: z.literal("NUMERIC") }).passthrough();
const SequenceQuestionSchema = z.object({ questionTypeCode: z.literal("SEQUENCE") }).passthrough();
const MatchingQuestionSchema = z.object({ questionTypeCode: z.literal("MATCHING") }).passthrough();
const HotspotQuestionSchema = z.object({ questionTypeCode: z.literal("HOTSPOT") }).passthrough();
const BlocklyProgrammingQuestionSchema = z.object({ questionTypeCode: z.literal("BLOCKLY_PROGRAMMING") }).passthrough();
const ScratchProgrammingQuestionSchema = z.object({ questionTypeCode: z.literal("SCRATCH_PROGRAMMING") }).passthrough();


// --- Step 2: Create a discriminated union schema for all question types ---
export const QuizQuestionSchema = z.discriminatedUnion("questionTypeCode", [
  MultipleChoiceQuestionSchema,
  MultipleResponseQuestionSchema,
  FillInTheBlanksQuestionSchema,
  DragAndDropQuestionSchema,
  TrueFalseQuestionSchema,
  ShortAnswerQuestionSchema,
  NumericQuestionSchema,
  SequenceQuestionSchema,
  MatchingQuestionSchema,
  HotspotQuestionSchema,
  BlocklyProgrammingQuestionSchema,
  ScratchProgrammingQuestionSchema,
]);


// --- Step 3: Define schemas for settings ---
export const SCORMSettingsSchema = z.object({
  version: z.enum(["1.2", "2004"]),
  setCompletionOnFinish: z.boolean().optional(),
  setSuccessOnPass: z.boolean().optional(),
  autoCommit: z.boolean().optional(),
  studentNameVar: z.string().optional(),
  lessonStatusVar: z.string().optional(),
  scoreRawVar: z.string().optional(),
  scoreMaxVar: z.string().optional(),
  scoreMinVar: z.string().optional(),
  sessionTimeVar: z.string().optional(),
  exitVar: z.string().optional(),
  suspendDataVar: z.string().optional(),
  lessonStatusVar_1_2: z.string().optional(),
  scoreRawVar_1_2: z.string().optional(),
  scoreMaxVar_1_2: z.string().optional(),
  scoreMinVar_1_2: z.string().optional(),
  completionStatusVar_2004: z.string().optional(),
  successStatusVar_2004: z.string().optional(),
  scoreScaledVar_2004: z.string().optional(),
  scoreRawVar_2004: z.string().optional(),
  scoreMaxVar_2004: z.string().optional(),
  scoreMinVar_2004: z.string().optional(),
});

export const QuizSettingsSchema = z.object({
  language: z.string().optional().describe("The primary language of the quiz content (e.g., 'English', 'Vietnamese'). Affects AI generation."), // <-- ĐÃ THÊM
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional().describe("Whether to shuffle options within applicable question types."),
  timeLimitMinutes: z.number().min(0).optional().describe("Time limit in minutes. 0 for no limit."),
  showCorrectAnswers: z.enum(["immediately", "end_of_quiz", "never"]).optional(),
  passingScorePercent: z.number().min(0).max(100).optional(),
  webhookUrl: z.string().url().optional().describe("URL to send quiz results to."),
  scorm: SCORMSettingsSchema.optional().describe("SCORM integration settings."),
});


// --- Step 4: Define the main schema for QuizConfig ---
export const QuizConfigSchema = z.object({
  // Required fields
  id: z.string().describe("Unique identifier for the quiz."),
  title: z.string().describe("The main title of the quiz."),
  questions: z.array(QuizQuestionSchema).describe("An array of quiz questions."),

  // Optional fields
  description: z.string().optional().describe("Optional description for the quiz."),
  settings: QuizSettingsSchema.optional().describe("Settings for the quiz behavior."),
});

// (Optional) Infer TypeScript type
export type QuizConfig = z.infer<typeof QuizConfigSchema>;