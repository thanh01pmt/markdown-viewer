// packages/interactive-quiz-kit/src/schemas.ts

/**
 * This file serves as the public entry point for all Zod schemas
 * used within the interactive-quiz-kit.
 *
 * It re-exports schemas from their internal locations to create a clean,
 * consistent API for consumers of the library.
 */

export * from './schemas/zod/blocklyProgrammingQuestionSchema';
export * from './schemas/zod/codingQuestionSchema';
export * from './schemas/zod/dragAndDropQuestionSchema';
export * from './schemas/zod/fillInTheBlanksQuestionSchema';
export * from './schemas/zod/hotspotQuestionSchema';
export * from './schemas/zod/matchingQuestionSchema';
export * from './schemas/zod/multipleChoiceQuestionSchema';
export * from './schemas/zod/multipleResponseQuestionSchema';
export * from './schemas/zod/numericQuestionSchema';
export * from './schemas/zod/quizConfigSchema';
export * from './schemas/zod/scratchProgrammingQuestionSchema';
export * from './schemas/zod/sequenceQuestionSchema';
export * from './schemas/zod/shortAnswerQuestionSchema';
export * from './schemas/zod/trueFalseQuestionSchema';