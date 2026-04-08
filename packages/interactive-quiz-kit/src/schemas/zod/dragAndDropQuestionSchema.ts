import { z } from 'zod';

// Schema cho các thành phần con
const DraggableItemSchema = z.object({
  id: z.string(),
  content: z.string(),
});

const DropZoneSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const AnswerMapSchema = z.object({
  draggableId: z.string(),
  dropZoneId: z.string(),
});

// Schema chính cho câu hỏi Drag and Drop
export const DragAndDropQuestionSchema = z.object({
  // Các trường bắt buộc
  id: z.string(),
  questionTypeCode: z.literal("DRAG_AND_DROP"),
  prompt: z.string(),
  draggableItems: z.array(DraggableItemSchema).min(1),
  dropZones: z.array(DropZoneSchema).min(1),
  answerMap: z.array(AnswerMapSchema).min(1),

  // Các trường tùy chọn
  backgroundImageUrl: z.string().url().optional().describe("Must be a valid URL format."), // .url() tương đương "format": "uri-reference"
  imageAltText: z.string().optional(),
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
export type DragAndDropQuestion = z.infer<typeof DragAndDropQuestionSchema>;