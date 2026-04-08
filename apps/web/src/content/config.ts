import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const commonFields = {
  id: z.string(),
  points: z.number().optional(),
  explanation: z.string().optional(),
  learningObjective: z.string().optional(),
  glossary: z.array(z.string()).optional(),
  bloomLevelCode: z.string().optional(),
  difficultyCode: z.enum(['VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional(),
  category: z.string().optional(),
  topic: z.string().optional(),
};

const optionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean().optional(),
});

const mcqSchema = z.object({
  ...commonFields,
  questionTypeCode: z.literal("MULTIPLE_CHOICE"),
  prompt: z.string(),
  options: z.array(optionSchema).min(1),
  correctAnswerId: z.string(),
});

const matchingSchema = z.object({
  ...commonFields,
  questionTypeCode: z.literal("MATCHING"),
  prompt: z.string(),
  prompts: z.array(z.object({ id: z.string(), text: z.string() })),
  options: z.array(z.object({ id: z.string(), text: z.string() })),
  correctAnswerMap: z.array(z.object({ promptId: z.string(), optionId: z.string() })),
});

const booleanSchema = z.object({
  ...commonFields,
  questionTypeCode: z.literal("TRUE_FALSE"),
  prompt: z.string(),
  correctAnswer: z.boolean(),
});

const codingSchema = z.object({
  ...commonFields,
  questionTypeCode: z.enum(["CODING", "BLOCKLY_PROGRAMMING", "SCRATCH_PROGRAMMING"]),
  prompt: z.string(),
  initialCode: z.string().optional(),
  solutionCode: z.string().optional(),
  language: z.string().optional(),
}).passthrough();

const quizQuestionSchema = z.discriminatedUnion("questionTypeCode", [
  mcqSchema,
  matchingSchema,
  booleanSchema,
  codingSchema,
  z.object({ questionTypeCode: z.literal("MULTIPLE_RESPONSE") }).passthrough(),
  z.object({ questionTypeCode: z.literal("FILL_IN_THE_BLANKS") }).passthrough(),
  z.object({ questionTypeCode: z.literal("HOTSPOT") }).passthrough(),
  z.object({ questionTypeCode: z.literal("SEQUENCE") }).passthrough(),
  z.object({ questionTypeCode: z.literal("SHORT_ANSWER") }).passthrough(),
  z.object({ questionTypeCode: z.literal("NUMERIC") }).passthrough(),
]);

const lessonSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  program_id: z.string(),
  type: z.enum(['lessons', 'slides', 'activities', 'quizzes']),
  last_updated: z.date().optional(),
  layout: z.string().optional(),
  alignment: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  // For Quiz collections
  questions: z.array(quizQuestionSchema).optional(),
});

const lessons = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/lessons" }),
  schema: lessonSchema,
});

const slides = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/slides" }),
  schema: lessonSchema,
});

const activities = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/activities" }),
  schema: lessonSchema,
});

const quizzes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/quizzes" }),
  schema: lessonSchema,
});

export const collections = {
  lessons,
  slides,
  activities,
  quizzes,
};
