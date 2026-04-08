import { QuizQuestion } from './questions';
import { QuizConfig } from './quiz-config';
import { QuizResultType, UserAnswerType } from './results';

export interface QuizEngineCallbacks {
  onQuizStart?: (initialData: {
    initialQuestion: QuizQuestion | null;
    currentQuestionNumber: number;
    totalQuestions: number;
    timeLimitInSeconds: number | null;
    scormStatus?: QuizResultType['scormStatus'];
    studentName?: string;
  }) => void;
  onQuestionChange?: (question: QuizQuestion | null, currentQuestionNumber: number, totalQuestions: number) => void;
  onAnswerSubmit?: (question: QuizQuestion, userAnswer: UserAnswerType) => void;
  onQuizFinish?: (results: QuizResultType) => void;
  onTimeTick?: (timeLeftInSeconds: number) => void;
  onQuizTimeUp?: () => void;
}

export interface QuizEngineConstructorOptions {
  config: QuizConfig;
  callbacks?: QuizEngineCallbacks;
}
