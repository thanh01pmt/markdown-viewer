// packages/interactive-quiz-kit/src/index.ts

// --- Export TYPES first ---
export type { RichContentString, MarkdownString } from "./types/common";

// METADATA & QUESTION BANK TYPE EXPORTS REMOVED - They belong to the application layer.

export type {
	QuestionTypeStrings, BaseQuestion, MultipleChoiceQuestion, MultipleResponseQuestion,
	FillInTheBlanksQuestion, DragAndDropQuestion, TrueFalseQuestion, ShortAnswerQuestion,
	NumericQuestion, SequenceQuestion, MatchingQuestion, HotspotQuestion, BlocklyProgrammingQuestion,
	ScratchProgrammingQuestion, CodingQuestion, QuizQuestion, QuestionOption, SequenceItem,
	MatchPromptItem, MatchOptionItem, DraggableItem, DropZone, HotspotArea, TestCase,
	SupportedCodingLanguage
} from "./types/questions";
export type { SCORMSettings, QuizSettings } from "./types/quiz-settings";
export type { QuizConfig } from "./types/quiz-config";
export type {
	UserAnswerType, UserAnswers, PerformanceByLearningObjective, PerformanceByCategory,
	PerformanceByTopic, PerformanceByDifficulty, PerformanceByBloomLevel, PerformanceMetric,
	AnswerDetail, QuizResultType, TestCaseResult
} from "./types/results";
export type { QuizEngineCallbacks, QuizEngineConstructorOptions } from "./types/quiz-engine";

// CORE MISC TYPES (Application-specific ones like Achievement, PracticeSession were moved)
export type {
	ImportError, QuestionReview, QuizReviewContent, ImageContextItem
} from "./types/misc";

export * from './schemas';
export * from './types';
export * from './i18n';

export * as ai from './ai';

// AI-ECOSYSTEM & DASHBOARD TYPE EXPORTS REMOVED

// --- Export VALUES (services, constants, etc.) ---
// Headless Services & Utilities (safe for server)
export { QuizEngine } from './services/QuizEngine';
export { QuizEditorService } from './services/QuizEditorService';
export { QuestionImportService } from './services/QuestionImportService';
export { generateLauncherHTML } from './services/HTMLLauncherGenerator';
export { generateSCORMManifest } from './services/SCORMManifestGenerator';
export { exportQuizAsSCORMZip } from './services/scormPackaging';
export { sampleQuiz, emptyQuiz } from './services/sampleQuiz';
export { generateUniqueId, generateQuestionCode } from './utils/idGenerators';
export { sanitizeCode } from './utils/utils';
export { cn } from './utils/utils';
export { PointAllocationService } from './services/PointAllocationService';
export { APIKeyService, GEMINI_API_KEY_SERVICE_NAME } from './services/APIKeyService';

// UTILS CONSOLIDATED EXPORTS
export { exportToTSV, exportToJSON } from './utils/utils';
export { extractJsonFromMarkdown, debugJsonExtraction } from './utils/jsonUtils';