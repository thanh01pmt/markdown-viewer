// FILE: src/lib/interactive-quiz-kit/services/evaluators/programming-evaluator.ts
// ================================================================================
// NEW FILE: Evaluator for Blockly and Scratch programming questions.

import type { BlocklyProgrammingQuestion, ScratchProgrammingQuestion, UserAnswerType, AnswerDetail } from '../../types';
import type { QuestionEvaluator, EvaluationResult } from './base-evaluator';

export class ProgrammingEvaluator implements QuestionEvaluator {
  public async evaluate(question: BlocklyProgrammingQuestion | ScratchProgrammingQuestion, answer: UserAnswerType): Promise<EvaluationResult> {
    const points = question.points ?? 0;
    let isCorrect = false;

    if (typeof answer === 'string' && typeof question.solutionGeneratedCode === 'string') {
      if (typeof window !== 'undefined' && (window as any).Blockly?.JavaScript) {
        const LocalBlockly = (window as any).Blockly;
        let generatedUserCode = '';
        try {
          const tempWorkspace = new LocalBlockly.Workspace();
          const dom = LocalBlockly.Xml.textToDom(answer);
          LocalBlockly.Xml.domToWorkspace(dom, tempWorkspace);
          generatedUserCode = LocalBlockly.JavaScript.workspaceToCode(tempWorkspace) || "";
          const normalize = (code: string) => code.replace(/\s+/g, ' ').trim();
          isCorrect = normalize(generatedUserCode) === normalize(question.solutionGeneratedCode);
          tempWorkspace.dispose();
        } catch (e) {
          console.error(`Error generating code from user's ${question.questionTypeCode} XML for evaluation:`, e);
          isCorrect = false;
        }
      } else {
        console.warn(`Blockly library not available for ${question.questionTypeCode} evaluation. Skipping code comparison.`);
        isCorrect = false;
      }
    }
    
    const correctAnswerDetail: AnswerDetail = {
      id: null,
      value: question.solutionGeneratedCode || '',
    };

    return Promise.resolve({
      isCorrect,
      correctAnswer: correctAnswerDetail,
      pointsEarned: isCorrect ? points : 0,
    });
  }
}