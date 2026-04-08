// FILE: src/lib/interactive-quiz-kit/services/evaluators/base-evaluator.ts
import type { QuizQuestion, UserAnswerType, AnswerDetail, TestCaseResult } from '../../types';

export interface EvaluationResult {
  isCorrect: boolean;
  correctAnswer: AnswerDetail | null;
  pointsEarned: number;
  evaluationDetails?: TestCaseResult[]; // New optional field
}

export interface QuestionEvaluator {
  evaluate(question: QuizQuestion, answer: UserAnswerType): Promise<EvaluationResult>;
}