// FILE: src/lib/interactive-quiz-kit/ai/flows/question-gen/question-generation-schemas.ts
// ================================================================================
// A centralized file for all Zod schemas related to AI question generation.
// This file is "headless" and can be safely imported in any environment.

import { z } from 'zod';

//================================================================//
// 1. UNIFIED CONTEXT SCHEMA (Based on PlannedQuestion)
//================================================================//

export const QuizContextSchema = z.object({
  plannedTopic: z.string().optional(),
  plannedQuestionTypeCode: z.string().optional(),
  plannedBloomLevelCode: z.string().optional(),
  plannedContextId: z.string().optional(),
  targetMisconception: z.string().optional(),
  difficultyReason: z.string().optional(),
  topicSpecificity: z.enum(['broad', 'focused', 'specific']).optional(),
  originalLoId: z.string().optional(),
  originalSubject: z.string().optional(),
  originalCategory: z.string().optional(),
  originalTopic: z.string().optional(),
  description: z.string().optional().describe("The full description of the learning objective for deep context."),
});
export type QuizContext = z.infer<typeof QuizContextSchema>;

//================================================================//
// 2. BASE INPUT SCHEMA FOR ALL QUESTION GENERATORS
//================================================================//

export const BaseQuestionGenerationClientInputSchema = z.object({
  language: z.string().optional().default('English'),
  difficultyCode: z.enum(['VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD']),
  quizContext: QuizContextSchema.optional(),
  imageUrl: z.string().url().optional().describe("Optional URL of an image to be used as context."),
});
export type BaseQuestionGenerationClientInput = z.infer<typeof BaseQuestionGenerationClientInputSchema>;

//================================================================//
// 3. ZOD SCHEMAS FOR FINAL QUESTION STRUCTURES (POST-REFACTOR)
//================================================================//

// Base schema reflecting the NEW BaseQuestion type (without old metadata)
const BaseQuestionZodSchema = z.object({
  id: z.string(),
  prompt: z.string().min(1),
  points: z.number().min(0).optional(),
  explanation: z.string().optional(),
  learningObjectiveCodes: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  imageAltText: z.string().optional(),
  // The 'difficulty' field is now part of the AI output, but not the final BaseQuestion type.
  // We keep it on the AI output schemas but not here.
});

// --- Schemas for each specific question type ---

export const TrueFalseQuestionZodSchema = BaseQuestionZodSchema.extend({
  questionTypeCode: z.literal('TRUE_FALSE'),
  correctAnswer: z.boolean(),
});

export const MultipleChoiceQuestionZodSchema = BaseQuestionZodSchema.extend({
  questionTypeCode: z.literal('MULTIPLE_CHOICE'),
  options: z.array(z.object({ id: z.string(), text: z.string().min(1) })).min(2),
  correctAnswerId: z.string(),
}).refine((data) => data.options.some(option => option.id === data.correctAnswerId), {
  message: "correctAnswerId must match one of the option IDs",
  path: ["correctAnswerId"]
});

export const MultipleResponseQuestionZodSchema = BaseQuestionZodSchema.extend({
  questionTypeCode: z.literal('MULTIPLE_RESPONSE'),
  options: z.array(z.object({ id: z.string(), text: z.string().min(1) })).min(2),
  correctAnswerIds: z.array(z.string()).min(1),
}).refine((data) => data.correctAnswerIds.every(id => data.options.some(opt => opt.id === id)), {
  message: "All correctAnswerIds must exist in the options array", path: ["correctAnswerIds"]
});

export const ShortAnswerQuestionZodSchema = BaseQuestionZodSchema.extend({
  questionTypeCode: z.literal('SHORT_ANSWER'),
  acceptedAnswers: z.array(z.string().min(1)).min(1),
  isCaseSensitive: z.boolean().optional(),
});

export const NumericQuestionZodSchema = BaseQuestionZodSchema.extend({
  questionTypeCode: z.literal('NUMERIC'),
  answer: z.number(),
  tolerance: z.number().min(0).optional(),
});

export const FillInTheBlanksQuestionZodSchema = BaseQuestionZodSchema.extend({
  questionTypeCode: z.literal('FILL_IN_THE_BLANKS'),
  segments: z.array(z.object({
    type: z.enum(['text', 'blank']),
    content: z.string().optional(),
    id: z.string().optional(),
  })).min(1),
  answers: z.array(z.object({
    blankId: z.string(),
    acceptedValues: z.array(z.string().min(1)).min(1),
  })).min(1),
  isCaseSensitive: z.boolean().optional(),
}).refine((data) => {
  const segmentBlankIds = new Set(data.segments.filter(s => s.type === 'blank' && s.id).map(s => s.id!));
  const answerBlankIds = new Set(data.answers.map(a => a.blankId));
  return segmentBlankIds.size === answerBlankIds.size && [...segmentBlankIds].every(id => answerBlankIds.has(id));
}, { message: "Mismatch between defined blanks in segments and their answers.", path: ["answers"] });

export const SequenceQuestionZodSchema = BaseQuestionZodSchema.extend({
  questionTypeCode: z.literal('SEQUENCE'),
  items: z.array(z.object({ id: z.string(), content: z.string().min(1) })).min(2),
  correctOrder: z.array(z.string()).min(2),
}).refine((data) => new Set(data.correctOrder).size === data.items.length, {
  message: "correctOrder must contain all unique item IDs exactly once.", path: ["correctOrder"]
});

export const MatchingQuestionZodSchema = BaseQuestionZodSchema.extend({
  questionTypeCode: z.literal('MATCHING'),
  prompts: z.array(z.object({ id: z.string(), content: z.string().min(1) })).min(2),
  options: z.array(z.object({ id: z.string(), content: z.string().min(1) })).min(2),
  correctAnswerMap: z.array(z.object({ promptId: z.string(), optionId: z.string() })).min(2),
  shuffleOptions: z.boolean().optional(),
}).refine((data) => data.prompts.length === data.correctAnswerMap.length, {
  message: "Each prompt must have exactly one corresponding answer in the map.", path: ["correctAnswerMap"]
});

export const CodingQuestionZodSchema = BaseQuestionZodSchema.extend({
    questionTypeCode: z.literal('CODING'),
    codingLanguage: z.enum(['cpp', 'javascript', 'python', 'swift', 'csharp']),
    functionSignature: z.string().optional(),
    solutionCode: z.string(),
    testCases: z.array(z.object({
      id: z.string(),
      input: z.array(z.any()),
      expectedOutput: z.any(),
      isPublic: z.boolean(),
    })).min(1),
});