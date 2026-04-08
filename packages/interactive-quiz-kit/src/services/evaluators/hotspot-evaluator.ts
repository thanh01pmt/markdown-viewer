// FILE: src/lib/interactive-quiz-kit/services/evaluators/hotspot-evaluator.ts
// ================================================================================
// NEW FILE: Evaluator for Hotspot questions.

import type { HotspotQuestion, UserAnswerType, AnswerDetail } from '../../types';
import type { QuestionEvaluator, EvaluationResult } from './base-evaluator';

export class HotspotEvaluator implements QuestionEvaluator {
  public async evaluate(question: HotspotQuestion, answer: UserAnswerType): Promise<EvaluationResult> {
    const points = question.points ?? 0;
    let isCorrect = false;

    if (Array.isArray(answer)) {
      const userAnswerSet = new Set(answer as string[]);
      const correctAnswerSet = new Set(question.correctHotspotIds);
      isCorrect = userAnswerSet.size === correctAnswerSet.size && 
                  [...userAnswerSet].every(id => correctAnswerSet.has(id));
    }
    
    const correctValues = question.correctHotspotIds.map(id => 
      question.hotspots.find(h => h.id === id)?.description || id
    );
    const correctAnswerDetail: AnswerDetail = {
      id: question.correctHotspotIds,
      value: correctValues,
    };

    return Promise.resolve({
      isCorrect,
      correctAnswer: correctAnswerDetail,
      pointsEarned: isCorrect ? points : 0,
    });
  }
}