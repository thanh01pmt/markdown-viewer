// packages/interactive-quiz-kit/src/ai/flows/generate-questions-from-quiz-plan.ts
'use client';

import type { QuizQuestion, QuestionTypeStrings, SupportedCodingLanguage, ImageContextItem } from '../../types';
import type { PlannedQuestion } from './generate-quiz-plan-types';
import type { QuizContext } from './question-gen/question-generation-schemas';
import { PointAllocationService } from '../../services/PointAllocationService';

// Import all generation flows
import { generateTrueFalseQuestion } from './question-gen/generate-true-false-question';
import { generateMCQQuestion } from './question-gen/generate-mcq-question';
import { generateMRQQuestion } from './question-gen/generate-mrq-question';
import { generateShortAnswerQuestion } from './question-gen/generate-short-answer-question';
import { generateNumericQuestion } from './question-gen/generate-numeric-question';
import { generateFillInTheBlanksQuestion } from './question-gen/generate-fitb-question';
import { generateSequenceQuestion } from './question-gen/generate-sequence-question';
import { generateMatchingQuestion } from './question-gen/generate-matching-question';
import { generateCodingQuestion } from './question-gen/generate-coding-question';

import {
  type GenerateQuestionsFromQuizPlanClientInput,
  type GenerateQuestionsFromQuizPlanOutput,
} from './generate-questions-from-quiz-plan-types';

//================================================================//
// DEFINITIONS & HELPERS
//================================================================//

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const calculateCombinedDifficulty = (plannedQ: PlannedQuestion): 'EASY' | 'MEDIUM' | 'HARD' => {
  const { plannedBloomLevelCode, plannedQuestionTypeCode, plannedContextId } = plannedQ;
  let contextScore = 1;
  if (['SPEC_CASE', 'NAT_OBS', 'DATA_MOD', 'INTERDISC', 'HYPO_COMP'].includes(plannedContextId || '')) contextScore = 2;
  else if (['TECH_ENG', 'EXP_INV', 'REAL_PROB'].includes(plannedContextId || '')) contextScore = 3;

  let bloomScore = 1;
  if (plannedBloomLevelCode === 'UNDERSTAND') bloomScore = 2;
  else if (plannedBloomLevelCode === 'APPLY') bloomScore = 3;
  else if (['ANALYZE', 'EVALUATE', 'CREATE'].includes(plannedBloomLevelCode)) bloomScore = 4;

  let questionTypeScore = 1;
  switch (plannedQuestionTypeCode as QuestionTypeStrings) {
    case 'MATCHING': case 'FILL_IN_THE_BLANKS': case 'NUMERIC': questionTypeScore = 2; break;
    case 'SEQUENCE': case 'MULTIPLE_RESPONSE': case 'DRAG_AND_DROP': case 'CODING': questionTypeScore = 3; break;
  }
  
  const totalScore = bloomScore + contextScore + questionTypeScore;
  if (totalScore <= 4) return 'EASY';
  if (totalScore <= 7) return 'MEDIUM';
  return 'HARD';
};

//================================================================//
// MAIN FUNCTION (REFACTORED)
//================================================================//

export async function generateQuestionsFromQuizPlan(
  clientInput: GenerateQuestionsFromQuizPlanClientInput,
  apiKey: string
): Promise<GenerateQuestionsFromQuizPlanOutput> {
  const { quizPlan, language, imageContexts } = clientInput;
  const generatedQuestions: QuizQuestion[] = [];
  const errors: { plannedQuestionIndex: number; plannedTopic: string; plannedQuestionTypeCode: string; error: string; }[] = [];
  
  for (let i = 0; i < quizPlan.length; i++) {
    const plannedQ = quizPlan[i];
    let questionGenerated = false;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const quizContext: QuizContext = {
          plannedTopic: plannedQ.plannedTopic,
          plannedQuestionTypeCode: plannedQ.plannedQuestionTypeCode,
          plannedBloomLevelCode: plannedQ.plannedBloomLevelCode,
          plannedContextId: plannedQ.plannedContextId,
          targetMisconception: plannedQ.targetMisconception,
          difficultyReason: plannedQ.difficultyReason,
          topicSpecificity: plannedQ.topicSpecificity,
          originalLoId: plannedQ.originalLoId,
          originalSubject: plannedQ.originalSubject,
          originalCategory: plannedQ.originalCategory,
          originalTopic: plannedQ.originalTopic,
          description: plannedQ.plannedTopic, 
        };

        const imageUrl = plannedQ.imageId && imageContexts
          ? imageContexts.find((ctx: ImageContextItem) => ctx.id === plannedQ.imageId)?.imageUrl
          : undefined;

        const baseClientInput = {
          language: language,
          difficultyCode: calculateCombinedDifficulty(plannedQ),
          quizContext: quizContext,
          imageUrl: imageUrl,
        };

        let result: { question?: QuizQuestion, error?: string } = {};

        switch (plannedQ.plannedQuestionTypeCode) {
          case 'TRUE_FALSE': result = await generateTrueFalseQuestion(baseClientInput, apiKey); break;
          case 'MULTIPLE_CHOICE': result = await generateMCQQuestion({ ...baseClientInput, numberOfOptions: 4 }, apiKey); break;
          case 'MULTIPLE_RESPONSE': result = await generateMRQQuestion({ ...baseClientInput, numberOfOptions: 5, minCorrectAnswers: 2, maxCorrectAnswers: 3 }, apiKey); break;
          case 'SHORT_ANSWER': result = await generateShortAnswerQuestion({ ...baseClientInput, isCaseSensitive: false }, apiKey); break;
          case 'NUMERIC': result = await generateNumericQuestion({ ...baseClientInput, allowDecimals: true, tolerance: 0 }, apiKey); break;
          case 'FILL_IN_THE_BLANKS': result = await generateFillInTheBlanksQuestion({ ...baseClientInput, numberOfBlanks: 2, isCaseSensitive: false }, apiKey); break;
          case 'SEQUENCE': result = await generateSequenceQuestion({ ...baseClientInput, numberOfItems: 4 }, apiKey); break;
          case 'MATCHING': result = await generateMatchingQuestion({ ...baseClientInput, numberOfPairs: 4, shuffleOptions: true }, apiKey); break;
          case 'CODING': {
            const subject = plannedQ.originalSubject?.toLowerCase() || '';
            let codingLanguage: SupportedCodingLanguage = 'javascript';
            if (subject.includes('swift')) codingLanguage = 'swift';
            else if (subject.includes('python')) codingLanguage = 'python';
            
            result = await generateCodingQuestion({
                ...baseClientInput,
                codingLanguage: codingLanguage,
            }, apiKey);
            break;
          }
          default: throw new Error(`Question type "${plannedQ.plannedQuestionTypeCode}" is not supported for automated generation.`);
        }
        
        if (result.error) {
            throw new Error(result.error);
        }

        if (result.question) {
          const question = result.question;
          
          if (plannedQ.originalLoId) {
            question.meta = {
              ...(question.meta || {}),
              learningObjectiveCodes: [plannedQ.originalLoId],
            };
          }
          
          generatedQuestions.push(question);
          questionGenerated = true;
          break;
        } else {
          throw new Error(`AI did not return a question object for type '${plannedQ.plannedQuestionTypeCode}'.`);
        }
      } catch (e: any) {
        lastError = e;
        console.warn(`Attempt ${attempt} failed for question ${i + 1} (Topic: ${plannedQ.plannedTopic}): ${e.message}`);
        if (attempt < MAX_ATTEMPTS) {
          await delay(RETRY_DELAY_MS);
        }
      }
    }

    if (!questionGenerated && lastError) {
      errors.push({
        plannedQuestionIndex: i,
        plannedTopic: plannedQ.plannedTopic,
        plannedQuestionTypeCode: plannedQ.plannedQuestionTypeCode as string,
        error: lastError.message || 'Unknown error after all retries.',
      });
    }
  }

  const finalQuestions = PointAllocationService.allocatePoints(generatedQuestions);

  return { generatedQuestions: finalQuestions, errors: errors.length > 0 ? errors : undefined };
}