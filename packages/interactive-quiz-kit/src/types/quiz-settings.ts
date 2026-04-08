export interface SCORMSettings {
  version: "1.2" | "2004";
  setCompletionOnFinish?: boolean;
  setSuccessOnPass?: boolean;
  autoCommit?: boolean;
  studentNameVar?: string;
  lessonStatusVar?: string;
  scoreRawVar?: string;
  scoreMaxVar?: string;
  scoreMinVar?: string;
  sessionTimeVar?: string;
  exitVar?: string;
  suspendDataVar?: string;
  lessonStatusVar_1_2?: string;
  scoreRawVar_1_2?: string;
  scoreMaxVar_1_2?: string;
  scoreMinVar_1_2?: string;
  completionStatusVar_2004?: string;
  successStatusVar_2004?: string;
  scoreScaledVar_2004?: string;
  scoreRawVar_2004?: string;
  scoreMaxVar_2004?: string;
  scoreMinVar_2004?: string;
}

export interface QuizSettings {
  language?: string;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  timeLimitMinutes?: number;
  showCorrectAnswers?: 'immediately' | 'end_of_quiz' | 'never';
  passingScorePercent?: number;
  webhookUrl?: string;
  scorm?: SCORMSettings;
}
