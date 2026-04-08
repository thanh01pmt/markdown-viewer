// packages/interactive-quiz-kit/src/types/questions.ts

import { RichContentString } from './common';

export type QuestionTypeStrings =
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_RESPONSE'
  | 'FILL_IN_THE_BLANKS'
  | 'DRAG_AND_DROP'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'
  | 'NUMERIC'
  | 'SEQUENCE'
  | 'MATCHING'
  | 'HOTSPOT'
  | 'BLOCKLY_PROGRAMMING'
  | 'SCRATCH_PROGRAMMING'
  | 'CODING';

export interface BaseQuestion {
  id: string;
  code?: string;
  questionTypeCode: QuestionTypeStrings;
  prompt: RichContentString;
  points?: number;
  explanation?: RichContentString;
  imageUrl?: string;
  imageAltText?: string;
  difficultyCode?: string;
  bloomLevelCode?: string;
  contextCode?: string;
  knowledgeDimensionCode?: string;
  
  meta?: {
    learningObjectiveCodes?: string[];
    conceptCodes?: string[];
    topicCodes?: string[];
    categoryCodes?: string[];
    subjectCodes?: string[];
    fieldCodes?: string[];
    gradeLevelCodes?: string[];
    // Single-code facets kept for convenience when consolidating metadata
    bloomLevelCode?: string;
    contextCode?: string;
    knowledgeDimensionCode?: string;
  }; 
}

// 1. Multiple Choice Question
export interface QuestionOption {
  id: string;
  text: RichContentString;
}
export interface MultipleChoiceQuestion extends BaseQuestion {
  questionTypeCode: 'MULTIPLE_CHOICE';
  options: QuestionOption[];
  correctAnswerId: string;
}

// 2. Multiple Response Question
export interface MultipleResponseQuestion extends BaseQuestion {
  questionTypeCode: 'MULTIPLE_RESPONSE';
  options: QuestionOption[];
  correctAnswerIds: string[];
}

// 3. Fill In The Blanks Question
export interface FillInTheBlanksQuestion extends BaseQuestion {
  questionTypeCode: 'FILL_IN_THE_BLANKS';
  segments: { type: 'text' | 'blank'; content?: RichContentString; id?: string }[];
  answers: { 
    blankId: string; 
    acceptedValues: string[];
    options?: string[]; // <-- THAY ĐỔI ĐƯỢC THÊM VÀO ĐÂY
  }[];
  isCaseSensitive?: boolean;
}

// 4. Drag and Drop Question
export interface DraggableItem {
  id: string;
  content: RichContentString;
}
export interface DropZone {
  id: string;
  label: RichContentString;
}
export interface DragAndDropQuestion extends BaseQuestion {
  questionTypeCode: 'DRAG_AND_DROP';
  draggableItems: DraggableItem[];
  dropZones: DropZone[];
  answerMap: { draggableId: string; dropZoneId: string }[];
  backgroundImageUrl?: string;
}

// 5. True/False Question
export interface TrueFalseQuestion extends BaseQuestion {
  questionTypeCode: 'TRUE_FALSE';
  correctAnswer: boolean;
}

// 6. Short Answer Question
export interface ShortAnswerQuestion extends BaseQuestion {
  questionTypeCode: 'SHORT_ANSWER';
  acceptedAnswers: string[];
  isCaseSensitive?: boolean;
}

// 7. Numeric Question
export interface NumericQuestion extends BaseQuestion {
  questionTypeCode: 'NUMERIC';
  answer: number;
  tolerance?: number;
}

// 8. Sequence Question
export interface SequenceItem {
  id: string;
  content: RichContentString;
}
export interface SequenceQuestion extends BaseQuestion {
  questionTypeCode: 'SEQUENCE';
  items: SequenceItem[];
  correctOrder: string[];
}

// 9. Matching Question
export interface MatchPromptItem {
  id: string;
  content: RichContentString;
}
export interface MatchOptionItem {
  id: string;
  content: RichContentString;
}
export interface MatchingQuestion extends BaseQuestion {
  questionTypeCode: 'MATCHING';
  prompts: MatchPromptItem[];
  options: MatchOptionItem[];
  correctAnswerMap: { promptId: string; optionId: string }[];
  shuffleOptions?: boolean;
}

// 10. Hotspot Question
export interface HotspotArea {
  id: string;
  shape: 'rect' | 'circle';
  coords: number[];
  description?: RichContentString;
}
export interface HotspotQuestion extends BaseQuestion {
  questionTypeCode: 'HOTSPOT';
  imageUrl: string;
  hotspots: HotspotArea[];
  correctHotspotIds: string[];
}


// 11. Blockly Programming Question
export interface BlocklyProgrammingQuestion extends BaseQuestion {
  questionTypeCode: 'BLOCKLY_PROGRAMMING';
  toolboxDefinition: string;
  initialWorkspace?: string;
  solutionWorkspaceXML?: string;
  solutionGeneratedCode?: string;
}

// 12. Scratch Programming Question
export interface ScratchProgrammingQuestion extends BaseQuestion {
  questionTypeCode: 'SCRATCH_PROGRAMMING';
  toolboxDefinition: string;
  initialWorkspace?: string;
  solutionWorkspaceXML?: string;
  solutionGeneratedCode?: string;
}

export type SupportedCodingLanguage = 'cpp' | 'javascript' | 'python' | 'swift' | 'csharp' | 'lua' | 'c';

export interface TestCase {
  id: string;
  input: any[];
  expectedOutput: any;
  isPublic: boolean;
}

export interface CodingQuestion extends BaseQuestion {
  questionTypeCode: 'CODING';
  codingLanguage: SupportedCodingLanguage;
  solutionCode: string;
  testCases: TestCase[];
  functionSignature?: string;
}

export type QuizQuestion =
  | MultipleChoiceQuestion
  | MultipleResponseQuestion
  | FillInTheBlanksQuestion
  | DragAndDropQuestion
  | TrueFalseQuestion
  | ShortAnswerQuestion
  | NumericQuestion
  | SequenceQuestion
  | MatchingQuestion
  | HotspotQuestion
  | BlocklyProgrammingQuestion
  | ScratchProgrammingQuestion
  | CodingQuestion;