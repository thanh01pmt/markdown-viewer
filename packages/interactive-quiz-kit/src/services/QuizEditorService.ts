// src/lib/interactive-quiz-kit/services/QuizEditorService.ts

import { 
  QuizConfig, 
  QuizQuestion, 
  QuestionTypeStrings, 
  BaseQuestion,
  TrueFalseQuestion,
  MultipleChoiceQuestion,
  MultipleResponseQuestion,
  ShortAnswerQuestion,
  NumericQuestion,
  FillInTheBlanksQuestion,
  SequenceQuestion,
  MatchingQuestion,
  DragAndDropQuestion,
  HotspotQuestion,
  BlocklyProgrammingQuestion,
  ScratchProgrammingQuestion,
  CodingQuestion
} from '..';
import { generateUniqueId } from '../utils/idGenerators';

/**
 * A service class to manage and manipulate a QuizConfig object in a headless way.
 * This class operates on a deep copy of the initial quiz config to prevent side effects.
 */
export class QuizEditorService {
  private quiz: QuizConfig;

  constructor(initialQuiz: QuizConfig) {
    this.quiz = JSON.parse(JSON.stringify(initialQuiz));
  }

  public getQuiz(): QuizConfig {
    return this.quiz;
  }

  public static createNewQuestionTemplate(type: QuestionTypeStrings): QuizQuestion {
    // BaseQuestion properties are now reduced, without specific metadata codes
    const baseNewQuestion: Omit<BaseQuestion, 'questionTypeCode' | 'prompt'> = {
      id: generateUniqueId(`${type}_`),
      code: '', 
      points: 10,
      difficultyCode: 'MEDIUM',
      meta: {},
    };

    switch (type) {
        case 'TRUE_FALSE':
            return { ...baseNewQuestion, questionTypeCode: 'TRUE_FALSE', prompt: '', correctAnswer: true } as TrueFalseQuestion;
        case 'MULTIPLE_CHOICE':
            return { ...baseNewQuestion, questionTypeCode: 'MULTIPLE_CHOICE', prompt: '', options: [], correctAnswerId: '' } as MultipleChoiceQuestion;
        case 'MULTIPLE_RESPONSE':
            return { ...baseNewQuestion, questionTypeCode: 'MULTIPLE_RESPONSE', prompt: '', options: [], correctAnswerIds: [] } as MultipleResponseQuestion;
        case 'SHORT_ANSWER':
            return { ...baseNewQuestion, questionTypeCode: 'SHORT_ANSWER', prompt: '', acceptedAnswers: [''], isCaseSensitive: false } as ShortAnswerQuestion;
        case 'NUMERIC':
            return { ...baseNewQuestion, questionTypeCode: 'NUMERIC', prompt: '', answer: 0 } as NumericQuestion;
        case 'FILL_IN_THE_BLANKS': {
            const blankId = generateUniqueId('blank_');
            return { 
                ...baseNewQuestion, 
                questionTypeCode: 'FILL_IN_THE_BLANKS', 
                prompt: '', 
                segments: [
                    {type: 'text', content: 'Your text before '}, 
                    {type: 'blank', id: blankId}, 
                    {type: 'text', content: ' and after.'}
                ], 
                answers: [{blankId: blankId, acceptedValues: ['']}], 
                isCaseSensitive: false 
            } as FillInTheBlanksQuestion;
        }
        case 'SEQUENCE':
            return { ...baseNewQuestion, questionTypeCode: 'SEQUENCE', prompt: '', items: [], correctOrder: [] } as SequenceQuestion;
        case 'MATCHING':
            return { ...baseNewQuestion, questionTypeCode: 'MATCHING', prompt: '', prompts: [], options: [], correctAnswerMap: [], shuffleOptions: true } as MatchingQuestion;
        case 'DRAG_AND_DROP':
            return { ...baseNewQuestion, questionTypeCode: 'DRAG_AND_DROP', prompt: '', draggableItems: [], dropZones: [], answerMap: [] } as DragAndDropQuestion;
        case 'HOTSPOT':
            return { ...baseNewQuestion, questionTypeCode: 'HOTSPOT', prompt: '', imageUrl: '', hotspots: [], correctHotspotIds: [] } as HotspotQuestion;
        case 'BLOCKLY_PROGRAMMING':
            return {
                ...baseNewQuestion,
                prompt: '',
                questionTypeCode: 'BLOCKLY_PROGRAMMING',
                toolboxDefinition: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>',
                initialWorkspace: '',
                solutionWorkspaceXML: '',
                solutionGeneratedCode: ''
            } as BlocklyProgrammingQuestion;
        case 'SCRATCH_PROGRAMMING':
            return {
                ...baseNewQuestion,
                prompt: '',
                questionTypeCode: 'SCRATCH_PROGRAMMING',
                toolboxDefinition: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>', 
                initialWorkspace: '',
                solutionWorkspaceXML: '',
                solutionGeneratedCode: ''
            } as ScratchProgrammingQuestion;
        case 'CODING':
            return {
                ...baseNewQuestion,
                prompt: '',
                questionTypeCode: 'CODING',
                codingLanguage: 'javascript',
                solutionCode: '',
                testCases: [],
                functionSignature: '',
                points: 25,
            } as CodingQuestion;
        default:
            const _exhaustiveCheck: never = type;
            throw new Error(`Question type "${_exhaustiveCheck}" is not supported for creation.`);
    }
  }

  public addQuestion(question: QuizQuestion): QuizConfig {
    const newQuestion = { ...question };
    if (newQuestion.id.startsWith('new_')) {
        newQuestion.id = generateUniqueId(`${newQuestion.questionTypeCode}_`);
    }
    this.quiz.questions.push(newQuestion);
    return this.quiz;
  }

  public updateQuestion(updatedQuestion: QuizQuestion): QuizConfig {
    const questionIndex = this.quiz.questions.findIndex(q => q.id === updatedQuestion.id);
    if (questionIndex === -1) {
      throw new Error(`Question with ID "${updatedQuestion.id}" not found.`);
    }
    this.quiz.questions[questionIndex] = updatedQuestion;
    return this.quiz;
  }

  public deleteQuestionByIndex(index: number): QuizConfig {
    if (index < 0 || index >= this.quiz.questions.length) {
        throw new Error(`Invalid index ${index} for question deletion.`);
    }
    this.quiz.questions.splice(index, 1);
    return this.quiz;
  }

  public moveQuestion(fromIndex: number, toIndex: number): QuizConfig {
    if (fromIndex < 0 || fromIndex >= this.quiz.questions.length || toIndex < 0 || toIndex >= this.quiz.questions.length) {
        throw new Error("Invalid index for moving question.");
    }
    const [movedItem] = this.quiz.questions.splice(fromIndex, 1);
    this.quiz.questions.splice(toIndex, 0, movedItem);
    return this.quiz;
  }
}