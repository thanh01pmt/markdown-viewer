import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lessonSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  program_id: z.string(),
  type: z.enum(['lessons', 'slides', 'activities']),
  last_updated: z.date().optional(),
  layout: z.string().optional(),
  // Fallback fields for legacy MD
  alignment: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
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

export const collections = {
  lessons,
  slides,
  activities,
};
