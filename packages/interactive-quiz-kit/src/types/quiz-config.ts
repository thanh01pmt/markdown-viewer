import { QuizQuestion } from './questions';
import { QuizSettings } from './quiz-settings';
import { RichContentString } from './common';

export interface QuizConfig {
  id: string;
  title: string;
  description?: RichContentString;
  questions: QuizQuestion[];
  settings?: QuizSettings;
  version?: number; // Added for cache-busting QuizPlayer
}
