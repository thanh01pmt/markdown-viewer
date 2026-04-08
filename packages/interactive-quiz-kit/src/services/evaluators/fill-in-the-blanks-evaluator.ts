// FILE: src/lib/interactive-quiz-kit/services/evaluators/fill-in-the-blanks-evaluator.ts
// ================================================================================
// NEW FILE: Evaluator for Fill-in-the-Blanks questions.

import type { FillInTheBlanksQuestion, UserAnswerType, AnswerDetail } from '../../types';
import type { QuestionEvaluator, EvaluationResult } from './base-evaluator';

export class FillInTheBlanksEvaluator implements QuestionEvaluator {
  public async evaluate(question: FillInTheBlanksQuestion, answer: UserAnswerType): Promise<EvaluationResult> {
    const points = question.points ?? 0;
    let isCorrect = false;

    if (typeof answer === 'object' && answer !== null && !Array.isArray(answer)) {
      const userAnswerMap = answer as Record<string, string>;
      isCorrect = question.answers.length > 0 && question.answers.every(correctAnsDef => {
        const userValForBlank = userAnswerMap[correctAnsDef.blankId]?.trim();
        if (userValForBlank === undefined) return false;
        const caseSensitive = question.isCaseSensitive ?? false;
        return correctAnsDef.acceptedValues.some(accVal => 
          caseSensitive 
          ? accVal.trim() === userValForBlank 
          : accVal.trim().toLowerCase() === userValForBlank.toLowerCase()
        );
      });
    }
    
    const correctMap = question.answers.reduce((acc, curr) => {
        acc[curr.blankId] = curr.acceptedValues.join(' | ');
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