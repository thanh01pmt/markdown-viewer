// FILE: src/lib/interactive-quiz-kit/types.ts
// ================================================================================
// UPDATED: Exported the missing StudentMastery type.

export type { RichContentString, MarkdownString } from "./types/common";

export type {
	QuestionTypeStrings,
	BaseQuestion,
	MultipleChoiceQuestion,
	MultipleResponseQuestion,
	FillInTheBlanksQuestion,
	DragAndDropQuestion,
	TrueFalseQuestion,
	ShortAnswerQuestion,
	NumericQuestion,
	SequenceQuestion,
	MatchingQuestion,
	HotspotQuestion,
	BlocklyProgrammingQuestion,
	ScratchProgrammingQuestion,
	CodingQuestion,
	QuizQuestion,
	QuestionOption,
	SequenceItem,
	MatchPromptItem,
	MatchOptionItem,
	DraggableItem,
	DropZone,
	HotspotArea,
	TestCase,
	SupportedCodingLanguage,
} from "./types/questions";

export type { SCORMSettings, QuizSettings } from "./types/quiz-settings";

export type { QuizConfig } from "./types/quiz-config";

export type {
	UserAnswerType,
	UserAnswers,
	PerformanceByLearningObjective,
	PerformanceByCategory,
	PerformanceByTopic,
	PerformanceByDifficulty,
	PerformanceByBloomLevel,
	PerformanceMetric,
	AnswerDetail,
	QuizResultType,
	TestCaseResult,
} from "./types/results";

export type {
	QuizEngineCallbacks,
	QuizEngineConstructorOptions,
} from "./types/quiz-engine";

export type {
	ImportError,
	QuestionReview,
	QuizReviewContent,
	ImageContextItem,
} from "./types/misc";