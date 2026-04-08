// FILE: src/lib/interactive-quiz-kit/services/evaluators/coding-evaluator.ts
import type { CodingQuestion, UserAnswerType, AnswerDetail } from '../../types';
import { CodeEvaluationService } from '../CodeEvaluationService';
import type { QuestionEvaluator, EvaluationResult } from './base-evaluator';

export class CodingEvaluator implements QuestionEvaluator {
  public async evaluate(question: CodingQuestion, answer: UserAnswerType): Promise<EvaluationResult> {
    const points = question.points ?? 0;
    
    if (typeof answer !== 'string' || !answer.trim()) {
      return {
        isCorrect: false,
        correctAnswer: { id: null, value: question.solutionCode },
        pointsEarned: 0,
        evaluationDetails: question.testCases.map(tc => ({
          testCaseId: tc.id,
          passed: false,
          actualOutput: "No submission",
          reasoning: "User did not submit any code."
        }))
      };
    }

    try {
      const evaluationService = new CodeEvaluationService();
      const testCaseResults = await evaluationService.evaluateAllTestCases(question, answer);
      
      const isCorrect = testCaseResults.every(result => result.passed);

      const correctAnswerDetail: AnswerDetail = {
        id: null,
        value: question.solutionCode,
      };

      return {
        isCorrect,
        correctAnswer: correctAnswerDetail,
        pointsEarned: isCorrect ? points : 0,
        evaluationDetails: testCaseResults, // Pass through the detailed results
      };
    } catch (error) {
      console.error("A critical error occurred during code evaluation:", error);
      return {
        isCorrect: false,
        correctAnswer: { id: null, value: question.solutionCode },
        pointsEarned: 0,
        evaluationDetails: question.testCases.map(tc => ({
          testCaseId: tc.id,
          passed: false,
          actualOutput: "Evaluation Error",
          reasoning: error instanceof Error ? error.message : "An unknown error occurred."
        }))
      };
    }
  }
}