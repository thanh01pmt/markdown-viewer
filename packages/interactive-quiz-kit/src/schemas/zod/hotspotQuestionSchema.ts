import { z } from 'zod';

// Schema cho các thành phần con
const HotspotRectSchema = z.object({
  id: z.string().describe("Unique ID for the hotspot."),
  shape: z.literal("rect"),
  coords: z.number().array().length(4).describe("Coordinates for the rect: [x, y, width, height]."),
  description: z.string().optional().describe("Optional description for the hotspot (e.g., for tooltips)."),
});

const HotspotCircleSchema = z.object({
  id: z.string().describe("Unique ID for the hotspot."),
  shape: z.literal("circle"),
  coords: z.number().array().length(3).describe("Coordinates for the circle: [centerX, centerY, radius]."),
  description: z.string().optional().describe("Optional description for the hotspot (e.g., for tooltips)."),
});

// Sử dụng discriminatedUnion để xử lý logic điều kiện cho shape và coords
const HotspotAreaSchema = z.discriminatedUnion("shape", [
  HotspotRectSchema,
  HotspotCircleSchema,
]);

// Schema chính cho câu hỏi Hotspot
export const HotspotQuestionSchema = z.object({
  // Các trường bắt buộc
  id: z.string(),
  questionTypeCode: z.literal("HOTSPOT"),
  prompt: z.string(),
  imageUrl: z.string().url().describe("URL of the image to be used."),
  hotspots: z.array(HotspotAreaSchema).min(1).describe("Array of clickable hotspot areas on the image."),
  correctHotspotIds: z.array(z.string()).min(1).describe("Array of IDs of the correct hotspots."),

  // Các trường tùy chọn
  imageAltText: z.string().optional().describe("Alternative text for the image, for accessibility."),
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
export type HotspotQuestion = z.infer<typeof HotspotQuestionSchema>;