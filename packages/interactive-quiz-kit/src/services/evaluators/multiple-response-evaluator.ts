// FILE: src/lib/interactive-quiz-kit/services/evaluators/multiple-response-evaluator.ts
// ================================================================================
// NEW FILE: Evaluator for Multiple Response questions.

import type { MultipleResponseQuestion, UserAnswerType, AnswerDetail } from '../../types';
import type { QuestionEvaluator, EvaluationResult } from './base-evaluator';

export class MultipleResponseEvaluator implements QuestionEvaluator {
  public async evaluate(question: MultipleResponseQuestion, answer: UserAnswerType): Promise<EvaluationResult> {
    const points = question.points ?? 0;
    const correctAnswerIds = question.correctAnswerIds;
    let isCorrect = false;

    if (Array.isArray(answer)) {
      const userAnswerSet = new Set(answer as string[]);
      const correctAnswerSet = new Set(correctAnswerIds);
      isCorrect = userAnswerSet.size === correctAnswerSet.size && 
                  [...userAnswerSet].every(id => correctAnswerSet.has(id));
    }
    
    const correctValues = correctAnswerIds.map(id => 
      question.options.find(opt => opt.id === id)?.text || ''
    );
    const correctAnswerDetail: AnswerDetail = {
      id: correctAnswerIds,
      value: correctValues,
    };

    return Promise.resolve({
      isCorrect,
      correctAnswer: correctAnswerDetail,
      pointsEarned: isCorrect ? points : 0,
    });
  }
}