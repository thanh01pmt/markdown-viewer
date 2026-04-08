// FILE: src/lib/interactive-quiz-kit/types/results.ts
// ================================================================================
// UPDATED: Added `completionTimestamp` to QuizResultType.

import { QuestionTypeStrings, type BaseQuestion } from './questions';
import { RichContentString } from './common';

// This type should align with EvaluationResult from CodeEvaluationService
export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: any;
  reasoning: string;
}

export type UserAnswerType =
  | string
  | string[]
  | Record<string, string>
  | Record<string, string[]> // For DND categorization
  | boolean
  | null;

export type UserAnswers = Map<string, UserAnswerType>;

export interface PerformanceMetric {
  totalQuestions: number;
  correctQuestions: number;
  pointsEarned: number;
  maxPoints: number;
  percentage: number;
}

export interface PerformanceByLearningObjective extends PerformanceMetric {
  learningObjective: string;
}

export interface PerformanceByCategory extends PerformanceMetric {
  category: string;
}

export interface PerformanceByTopic extends PerformanceMetric {
  topic: string;
}

export interface PerformanceByDifficulty extends PerformanceMetric {
  difficultyCode: string;
}

export interface PerformanceByBloomLevel extends PerformanceMetric {
  bloomLevelCode: string;
}

export type AnswerDetail = {
  id: string | string[] | null; 
  value: 
    | RichContentString 
    | RichContentString[] 
    | Record<string, RichContentString> 
    | Record<string, RichContentString[]>
    | boolean 
    | number 
    | null; 
};

export interface QuizResultType {
  quizTitle?: string;
  score: number;
  maxScore: number;
  percentage: number;
  answers: UserAnswers;
  passed?: boolean;
  completionTimestamp?: number; // <-- THÊM MỚI
  questionResults: Array<{
    questionId: string;
    questionTypeCode: QuestionTypeStrings;
    prompt: RichContentString;
    meta?: BaseQuestion['meta'];
    difficultyCode?: string; // Added to enable grouping fallback
    isCorrect: boolean;
    pointsEarned: number;
    userAnswer: AnswerDetail | null;
    correctAnswer: AnswerDetail | null;
    explanation?: RichContentString;
    allOptions?: { id: string, value: RichContentString }[];
    timeSpentSeconds?: number;
    evaluationDetails?: TestCaseResult[];
  }>;
  webhookStatus?: 'idle' | 'sending' | 'success' | 'error';
  webhookError?: string;
  scormStatus?: 'idle' | 'no_api' | 'initializing' | 'initialized' | 'sending_data' | 'committed' | 'terminated' | 'error';
  scormError?: string;
  studentName?: string;
  totalTimeSpentSeconds?: number;
  averageTimePerQuestionSeconds?: number;
  performanceByLearningObjective?: PerformanceByLearningObjective[];
  performanceByCategory?: PerformanceByCategory[];
  performanceByTopic?: PerformanceByTopic[];
  performanceByDifficulty?: PerformanceByDifficulty[];
  performanceByBloomLevel?: PerformanceByBloomLevel[];
}