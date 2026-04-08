import { defineCollection, z } from 'astro:content';

const commonSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  order: z.number().default(0),
  lastUpdated: z.string().or(z.date()).optional(),
});

const lessons = defineCollection({
  type: 'content',
  schema: commonSchema.extend({
    duration: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  }),
});

const slides = defineCollection({
  type: 'content',
  schema: commonSchema.extend({
    layout: z.string().default('default'),
    theme: z.string().optional(),
  }),
});

const quizzes = defineCollection({
  type: 'content',
  schema: commonSchema.extend({
    passingScore: z.number().default(70),
    timeLimit: z.number().optional(), // in minutes
  }),
});

const labs = defineCollection({
  type: 'content',
  schema: commonSchema.extend({
    environment: z.enum(['node', 'python', 'react', 'vanilla']).default('node'),
    files: z.record(z.string()).optional(),
  }),
});

export const collections = {
  lessons,
  slides,
  quizzes,
  labs,
};
