// FILE: src/lib/interactive-quiz-kit/services/evaluators/multiple-choice-evaluator.ts
// ================================================================================
// NEW FILE: Evaluator for Multiple Choice questions.

import type { MultipleChoiceQuestion, UserAnswerType, AnswerDetail } from '../../types';
import type { QuestionEvaluator, EvaluationResult } from './base-evaluator';

export class MultipleChoiceEvaluator implements QuestionEvaluator {
  public async evaluate(question: MultipleChoiceQuestion, answer: UserAnswerType): Promise<EvaluationResult> {
    const points = question.points ?? 0;
    const correctAnswerId = question.correctAnswerId;
    
    const isCorrect = answer === correctAnswerId;
    
    const correctOption = question.options.find(opt => opt.id === correctAnswerId);
    const correctAnswerDetail: AnswerDetail = {
      id: correctAnswerId,
      value: correctOption?.text || '',
    };

    return Promise.resolve({
      isCorrect,
      correctAnswer: correctAnswerDetail,
      pointsEarned: isCorrect ? points : 0,
    });
  }
}