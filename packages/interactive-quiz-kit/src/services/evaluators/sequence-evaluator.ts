// FILE: src/lib/interactive-quiz-kit/services/evaluators/sequence-evaluator.ts
// ================================================================================
// NEW FILE: Evaluator for Sequence questions.

import type { SequenceQuestion, UserAnswerType, AnswerDetail } from '../../types';
import type { QuestionEvaluator, EvaluationResult } from './base-evaluator';

export class SequenceEvaluator implements QuestionEvaluator {
  public async evaluate(question: SequenceQuestion, answer: UserAnswerType): Promise<EvaluationResult> {
    const points = question.points ?? 0;
    let isCorrect = false;

    if (Array.isArray(answer) && answer.length === question.correctOrder.length) {
      isCorrect = answer.every((itemId, index) => itemId === question.correctOrder[index]);
    }
    
    const correctValues = question.correctOrder.map(id => 
      question.items.find(item => item.id === id)?.content || ''
    );
    const correctAnswerDetail: AnswerDetail = {
      id: question.correctOrder,
      value: correctValues,
    };

    return Promise.resolve({
      isCorrect,
      correctAnswer: correctAnswerDetail,
      pointsEarned: isCorrect ? points : 0,
    });
  }
}