// packages/interactive-quiz-kit/src/types/misc.ts
import { RichContentString } from './common';

export interface ImportError {
  index: number;
  message: string;
  data: any;
}

export interface QuestionReview {
  questionId: string;
  explanation: RichContentString;
}

export interface QuizReviewContent {
  questionReviews: QuestionReview[];
  overallSummary: RichContentString;
  relatedTopics: string[];
}

export interface ImageContextItem {
  id: string;
  imageUrl: string;
  imageAltText: string;
  detailedDescription: string;
  subject: string;
  category: string;
  topic: string;
}

export type StandardDifficulty = 'VERY_EASY' | 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';