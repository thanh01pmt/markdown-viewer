// FILE: src/lib/interactive-quiz-kit/ai/flows/generate-quiz-plan-types.ts
// ================================================================================
// UPDATED: Modified `imageId` in PlannedQuestionSchema to be nullable to handle AI returning null.

import { z } from 'zod';
import type { ImageContextItem } from '../../types/misc';
import type { QuestionTypeStrings } from '../../types/questions';

// Schema cho một chủ đề, bao gồm cả metadata
export const TopicWithMetadataSchema = z.object({
  topic: z.string().min(1),
  ratio: z.number().min(0).max(100),
  originalLoId: z.string().optional(),
  originalSubject: z.string().optional(),
  originalCategory: z.string().optional(),
  originalTopic: z.string().optional(),
  commonMisconceptions: z.array(z.string()).optional(),
});
export type TopicWithMetadata = z.infer<typeof TopicWithMetadataSchema>;

// Enum cho các cấp độ Bloom
const BloomLevelStringsEnum = z.enum(['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE']);
export type BloomLevelStringsForAI = z.infer<typeof BloomLevelStringsEnum>;

// Các loại câu hỏi được hỗ trợ trong việc sinh toàn bộ quiz
const fullQuizSupportedQuestionTypesArray = [
  'TRUE_FALSE', 'MULTIPLE_CHOICE', 'MULTIPLE_RESPONSE', 'SHORT_ANSWER',
  'NUMERIC', 'FILL_IN_THE_BLANKS', 'SEQUENCE', 'MATCHING', 'DRAG_AND_DROP',
  'CODING'
] as [QuestionTypeStrings, ...QuestionTypeStrings[]];


// Schema chính cho Input
export const GenerateQuizPlanClientInputSchema = z.object({
  language: z.string().optional().default('English'),
  totalQuestions: z.number().int().min(1).max(50),
  numCodingQuestions: z.number().optional().default(0),
  topics: z.array(TopicWithMetadataSchema).min(1),
  bloomLevels: z.array(z.object({
    level: BloomLevelStringsEnum,
    ratio: z.number().min(0).max(100),
  })).min(1),
  selectedContextIds: z.array(z.string()).optional(),
  selectedQuestionTypes: z.array(z.enum(fullQuizSupportedQuestionTypesArray)).min(1),
  imageContexts: z.array(z.custom<ImageContextItem>()).optional().describe("Library of available image contexts for the AI to use."),
});
export type GenerateQuizPlanClientInput = z.infer<typeof GenerateQuizPlanClientInputSchema>;

// Schema cho một câu hỏi đã được lên kế hoạch
export const PlannedQuestionSchema = z.object({
  plannedTopic: z.string().min(1).describe('The specific, assessable topic for this question.'),
  plannedQuestionTypeCode: z.enum(fullQuizSupportedQuestionTypesArray).describe('The specific question type chosen.'),
  plannedBloomLevelCode: BloomLevelStringsEnum.describe("The Bloom's level assigned."),
  plannedContextId: z.string().optional().describe('The specific context ID chosen for this question.'),
  imageId: z.string().nullable().optional().describe("The ID of the image from the context library to be used for this question."),
  targetMisconception: z.string().optional().describe('A specific common misconception this question should target.'),
  difficultyReason: z.string().optional().describe('Strategic explanation of difficulty choice and placement.'),
  topicSpecificity: z.enum(['broad', 'focused', 'specific']).optional().describe('How specific the topic coverage should be.'),
  originalLoId: z.string().optional(),
  originalSubject: z.string().optional(),
  originalCategory: z.string().optional(),
  originalTopic: z.string().optional(),
});
export type PlannedQuestion = z.infer<typeof PlannedQuestionSchema>;

// Schema chính cho Output
export const GenerateQuizPlanOutputSchema = z.object({
  quizPlan: z.array(PlannedQuestionSchema).describe('A detailed plan for each question in the quiz.'),
  diversityMetrics: z.object({
    questionTypeDistribution: z.record(z.number()).optional(),
    bloomLevelDistribution: z.record(z.number()).optional(),
    maxConsecutiveSameType: z.number().optional(),
  }).optional().describe('Metrics showing the diversity achieved in the plan.'),
  planningStrategy: z.object({
    overallApproach: z.string().optional(),
    keyDecisions: z.array(z.string()).optional(),
  }).optional(),
});
export type GenerateQuizPlanOutput = z.infer<typeof GenerateQuizPlanOutputSchema>;