// src/lib/interactive-quiz-kit/ai.ts

// --- Export TYPES first ---
export type {
  QuizQuestion, QuestionTypeStrings, FillInTheBlanksQuestion, MatchingQuestion, MultipleChoiceQuestion,
  MultipleResponseQuestion, NumericQuestion, SequenceQuestion, ShortAnswerQuestion, TrueFalseQuestion,
  CodingQuestion, QuizReviewContent, QuestionReview
} from './index';

// --- Export VALUES (AI flows) ---

// -- Individual Question Generators --
export { generateTrueFalseQuestion } from './ai/flows/question-gen/generate-true-false-question';
export type { GenerateTrueFalseQuestionClientInput, GenerateTrueFalseQuestionOutput } from './ai/flows/question-gen/generate-true-false-question-types';

export { generateMCQQuestion } from './ai/flows/question-gen/generate-mcq-question';
export type { GenerateMCQQuestionClientInput, GenerateMCQQuestionOutput } from './ai/flows/question-gen/generate-mcq-question-types';

export { generateMRQQuestion } from './ai/flows/question-gen/generate-mrq-question';
export type { GenerateMRQQuestionClientInput, GenerateMRQQuestionOutput } from './ai/flows/question-gen/generate-mrq-question-types';

export { generateShortAnswerQuestion } from './ai/flows/question-gen/generate-short-answer-question';
export type { GenerateShortAnswerQuestionClientInput, GenerateShortAnswerQuestionOutput } from './ai/flows/question-gen/generate-short-answer-question-types';

export { generateNumericQuestion } from './ai/flows/question-gen/generate-numeric-question';
export type { GenerateNumericQuestionClientInput, GenerateNumericQuestionOutput } from './ai/flows/question-gen/generate-numeric-question-types';

export { generateFillInTheBlanksQuestion } from './ai/flows/question-gen/generate-fitb-question';
export type { GenerateFillInTheBlanksQuestionClientInput, GenerateFillInTheBlanksQuestionOutput } from './ai/flows/question-gen/generate-fitb-question-types';

export { generateSequenceQuestion } from './ai/flows/question-gen/generate-sequence-question';
export type { GenerateSequenceQuestionClientInput, GenerateSequenceQuestionOutput } from './ai/flows/question-gen/generate-sequence-question-types';

export { generateMatchingQuestion } from './ai/flows/question-gen/generate-matching-question';
export type { GenerateMatchingQuestionClientInput, GenerateMatchingQuestionOutput } from './ai/flows/question-gen/generate-matching-question-types';

export { generateCodingQuestion } from './ai/flows/question-gen/generate-coding-question';
export type { GenerateCodingQuestionClientInput, GenerateCodingQuestionOutput } from './ai/flows/question-gen/generate-coding-question-types';


// -- Full Quiz & Analysis Flows --
export { generateQuizPlan } from './ai/flows/generate-quiz-plan';
export type { GenerateQuizPlanClientInput, GenerateQuizPlanOutput, PlannedQuestion, BloomLevelStringsForAI } from './ai/flows/generate-quiz-plan-types';

export { generateQuestionsFromQuizPlan } from './ai/flows/generate-questions-from-quiz-plan';
export type { GenerateQuestionsFromQuizPlanClientInput, GenerateQuestionsFromQuizPlanOutput } from './ai/flows/generate-questions-from-quiz-plan-types';

export { generateQuizFromText } from './ai/flows/generate-quiz-from-text';
export type { GenerateQuizFromTextClientInput, GenerateQuizFromTextOutput } from './ai/flows/generate-quiz-from-text-types';