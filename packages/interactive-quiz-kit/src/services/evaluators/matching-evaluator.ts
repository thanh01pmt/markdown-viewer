// FILE: src/lib/interactive-quiz-kit/services/evaluators/matching-evaluator.ts
// ================================================================================
// NEW FILE: Evaluator for Matching questions.

import type { MatchingQuestion, UserAnswerType, AnswerDetail } from '../../types';
import type { QuestionEvaluator, EvaluationResult } from './base-evaluator';

export class MatchingEvaluator implements QuestionEvaluator {
  public async evaluate(question: MatchingQuestion, answer: UserAnswerType): Promise<EvaluationResult> {
    const points = question.points ?? 0;
    let isCorrect = false;

    if (typeof answer === 'object' && answer !== null && !Array.isArray(answer)) {
      const userAnswerMap = answer as Record<string, string>;
      isCorrect = question.correctAnswerMap.length === Object.keys(userAnswerMap).length &&
                  question.correctAnswerMap.every(map => userAnswerMap[map.promptId] === map.optionId);
    }
    
    const correctMap = question.correctAnswerMap.reduce((acc, curr) => {
        const promptText = question.prompts.find(p => p.id === curr.promptId)?.content || '';
        const optionText = question.options.find(o => o.id === curr.optionId)?.content || '';
        acc[promptText] = optionText;
        return acc;
    }, {} as Record<string, string>);

    const correctAnswerDetail: AnswerDetail = {
      id: null,
      value: correctMap,
    };

    return Promise.resolve({
      isCorrect,
      correctAnswer: correctAnswerDetail,
      pointsEarned: isCorrect ? points : 0,
    });
  }
}