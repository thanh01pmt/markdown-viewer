// FILE: src/lib/interactive-quiz-kit/services/evaluators/true-false-evaluator.ts
// ================================================================================
// NEW FILE: Evaluator for True/False questions.

import type { TrueFalseQuestion, UserAnswerType, AnswerDetail } from '../../types';
import type { QuestionEvaluator, EvaluationResult } from './base-evaluator';

export class TrueFalseEvaluator implements QuestionEvaluator {
  public async evaluate(question: TrueFalseQuestion, answer: UserAnswerType): Promise<EvaluationResult> {
    const points = question.points ?? 0;
    const correctAnswer = question.correctAnswer;
    
    let userAnswer = answer;
    if (typeof answer === 'string') {
      userAnswer = answer.toLowerCase() === 'true';
    }
    
    const isCorrect = typeof userAnswer === 'boolean' && userAnswer === correctAnswer;
    
    const correctAnswerDetail: AnswerDetail = {
      id: null,
      value: correctAnswer,
    };

    return Promise.resolve({
      isCorrect,
      correctAnswer: correctAnswerDetail,
      pointsEarned: isCorrect ? points : 0,
    });
  }
}