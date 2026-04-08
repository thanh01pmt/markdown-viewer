// FILE: src/lib/interactive-quiz-kit/services/evaluators/NUMERIC-evaluator.ts
// ================================================================================
// NEW FILE: Evaluator for Numeric questions.

import type { NumericQuestion, UserAnswerType, AnswerDetail } from '../../types';
import type { QuestionEvaluator, EvaluationResult } from './base-evaluator';

export class NumericEvaluator implements QuestionEvaluator {
  public async evaluate(question: NumericQuestion, answer: UserAnswerType): Promise<EvaluationResult> {
    const points = question.points ?? 0;
    let isCorrect = false;

    if (typeof answer === 'string' || typeof answer === 'number') {
      const userAnswerNum = parseFloat(String(answer));
      if (!isNaN(userAnswerNum)) {
        isCorrect = question.tolerance != null 
          ? Math.abs(userAnswerNum - question.answer) <= question.tolerance 
          : userAnswerNum === question.answer;
      }
    }
    
    const correctAnswerDetail: AnswerDetail = {
      id: null,
      value: question.answer,
    };

    return Promise.resolve({
      isCorrect,
      correctAnswer: correctAnswerDetail,
      pointsEarned: isCorrect ? points : 0,
    });
  }
}