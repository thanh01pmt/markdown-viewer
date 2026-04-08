// FILE: src/lib/interactive-quiz-kit/services/evaluators/short-answer-evaluator.ts
// ================================================================================
// NEW FILE: Evaluator for Short Answer questions.

import type { ShortAnswerQuestion, UserAnswerType, AnswerDetail } from '../../types';
import type { QuestionEvaluator, EvaluationResult } from './base-evaluator';

export class ShortAnswerEvaluator implements QuestionEvaluator {
  public async evaluate(question: ShortAnswerQuestion, answer: UserAnswerType): Promise<EvaluationResult> {
    const points = question.points ?? 0;
    let isCorrect = false;

    if (typeof answer === 'string') {
      const userAnswerTrimmed = answer.trim();
      const caseSensitive = question.isCaseSensitive ?? false;
      isCorrect = question.acceptedAnswers.some(accAns => 
        caseSensitive 
        ? accAns.trim() === userAnswerTrimmed 
        : accAns.trim().toLowerCase() === userAnswerTrimmed.toLowerCase()
      );
    }
    
    const correctAnswerDetail: AnswerDetail = {
      id: null,
      value: question.acceptedAnswers,
    };

    return Promise.resolve({
      isCorrect,
      correctAnswer: correctAnswerDetail,
      pointsEarned: isCorrect ? points : 0,
    });
  }
}