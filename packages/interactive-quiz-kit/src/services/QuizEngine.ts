// packages/interactive-quiz-kit/src/services/QuizEngine.ts
import type {
  QuizConfig, QuizQuestion, UserAnswers, UserAnswerType, QuizResultType,
  QuizEngineConstructorOptions, QuizEngineCallbacks,
  PerformanceByLearningObjective, PerformanceByCategory, PerformanceByTopic,
  PerformanceByDifficulty, PerformanceByBloomLevel,
  PerformanceMetric,
  AnswerDetail,
  QuestionTypeStrings,
  MultipleChoiceQuestion,
  MultipleResponseQuestion,
  SequenceQuestion,
  MatchingQuestion,
  DragAndDropQuestion,
  BaseQuestion
} from '..';
import { SCORMService } from './SCORMService';
import type { QuestionEvaluator } from './evaluators/base-evaluator';
import { MultipleChoiceEvaluator } from './evaluators/multiple-choice-evaluator';
import { MultipleResponseEvaluator } from './evaluators/multiple-response-evaluator';
import { TrueFalseEvaluator } from './evaluators/true-false-evaluator';
import { ShortAnswerEvaluator } from './evaluators/short-answer-evaluator';
import { NumericEvaluator } from './evaluators/numeric-evaluator';
import { SequenceEvaluator } from './evaluators/sequence-evaluator';
import { MatchingEvaluator } from './evaluators/matching-evaluator';
import { FillInTheBlanksEvaluator } from './evaluators/fill-in-the-blanks-evaluator';
import { DragAndDropEvaluator } from './evaluators/drag-and-drop-evaluator';
import { HotspotEvaluator } from './evaluators/hotspot-evaluator';
import { ProgrammingEvaluator } from './evaluators/programming-evaluator';
import { CodingEvaluator } from './evaluators/coding-evaluator';

interface AggregatedPerformanceData {
  totalQuestions: number;
  correctQuestions: number;
  pointsEarned: number;
  maxPoints: number;
}

export class QuizEngine {
  private config: QuizConfig;
  private userAnswers: UserAnswers = new Map();
  private currentQuestionIndex: number = 0;
  public questions: QuizQuestion[];
  private callbacks: QuizEngineCallbacks;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private timeLeftInSeconds: number | null = null;
  private scormService: SCORMService | null = null;
  private quizResultState: Partial<QuizResultType> = { scormStatus: 'idle' };
  private overallStartTime: number;
  private questionStartTime: number | null = null;
  private questionTimings: Map<string, number> = new Map();
  private evaluators: Map<QuestionTypeStrings, QuestionEvaluator>;

  constructor(options: QuizEngineConstructorOptions) {
    this.config = options.config;
    this.callbacks = options.callbacks || {};
    if (this.config.settings?.shuffleQuestions) {
      const base = `${this.config.id || ''}:${this.config.version || ''}:${this.config.title || ''}`;
      let seed = 0;
      for (let i = 0; i < base.length; i++) seed = (seed * 31 + base.charCodeAt(i)) >>> 0;
      this.questions = this.shuffleWithSeed([...this.config.questions], seed);
    } else {
      this.questions = this.config.questions;
    }
    this.overallStartTime = Date.now();

    this.evaluators = new Map();
    this.registerEvaluators();

    if (this.config.settings?.timeLimitMinutes && this.config.settings.timeLimitMinutes > 0) {
      this.timeLeftInSeconds = this.config.settings.timeLimitMinutes * 60;
    }
    if (this.config.settings?.scorm) {
      this.quizResultState.scormStatus = 'initializing';
      this.scormService = new SCORMService(this.config.settings.scorm);
      if (this.scormService.hasAPI()) {
        const initResult = this.scormService.initialize();
        if (initResult.success) {
          this.quizResultState.scormStatus = 'initialized';
          this.quizResultState.studentName = initResult.studentName;
        } else {
          this.quizResultState.scormStatus = 'error';
          this.quizResultState.scormError = initResult.error || "SCORM initialization failed.";
        }
      } else {
        this.quizResultState.scormStatus = 'no_api';
      }
    }
    const initialQ = this.getCurrentQuestion();
    if (initialQ) {
        this.questionStartTime = Date.now();
    }
    
    if (this.callbacks.onQuizStart) {
        this.callbacks.onQuizStart({
            initialQuestion: initialQ,
            currentQuestionNumber: this.getCurrentQuestionNumber(),
            totalQuestions: this.getTotalQuestions(),
            timeLimitInSeconds: this.timeLeftInSeconds,
            scormStatus: this.quizResultState.scormStatus,
            studentName: this.quizResultState.studentName,
        });
    }
    if (this.timeLeftInSeconds !== null) {
        this.startTimer();
    }
    this.callbacks.onQuestionChange?.(initialQ, this.getCurrentQuestionNumber(), this.getTotalQuestions());
  }

  private shuffleWithSeed<T>(arr: T[], seed: number): T[] {
    let s = seed >>> 0;
    const next = () => {
      s += 0x6D2B79F5;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  private registerEvaluators(): void {
    this.evaluators.set('MULTIPLE_CHOICE', new MultipleChoiceEvaluator());
    this.evaluators.set('MULTIPLE_RESPONSE', new MultipleResponseEvaluator());
    this.evaluators.set('TRUE_FALSE', new TrueFalseEvaluator());
    this.evaluators.set('SHORT_ANSWER', new ShortAnswerEvaluator());
    this.evaluators.set('NUMERIC', new NumericEvaluator());
    this.evaluators.set('SEQUENCE', new SequenceEvaluator());
    this.evaluators.set('MATCHING', new MatchingEvaluator());
    this.evaluators.set('FILL_IN_THE_BLANKS', new FillInTheBlanksEvaluator());
    this.evaluators.set('DRAG_AND_DROP', new DragAndDropEvaluator());
    this.evaluators.set('HOTSPOT', new HotspotEvaluator());
    const programmingEvaluator = new ProgrammingEvaluator();
    this.evaluators.set('BLOCKLY_PROGRAMMING', programmingEvaluator);
    this.evaluators.set('SCRATCH_PROGRAMMING', programmingEvaluator);
    this.evaluators.set('CODING', new CodingEvaluator());
  }

  private _recordCurrentQuestionTime(): void {
    if (this.questionStartTime && this.currentQuestionIndex >= 0 && this.currentQuestionIndex < this.questions.length) {
      const currentQId = this.questions[this.currentQuestionIndex].id;
      const elapsedMs = Date.now() - this.questionStartTime;
      const currentTotalTime = this.questionTimings.get(currentQId) || 0;
      this.questionTimings.set(currentQId, currentTotalTime + (elapsedMs / 1000));
    }
    this.questionStartTime = null;
  }

  private startTimer(): void {
    if (this.timerId !== null) clearInterval(this.timerId);
    this.timerId = setInterval(() => this.handleTick(), 1000);
  }

  private stopTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private handleTick(): void {
    if (this.timeLeftInSeconds === null) return;
    if (this.timeLeftInSeconds > 0) {
      this.timeLeftInSeconds--;
      this.callbacks.onTimeTick?.(this.timeLeftInSeconds);
    }
    if (this.timeLeftInSeconds <= 0) {
      this.stopTimer();
      this.callbacks.onQuizTimeUp?.();
      this.calculateResults();
    }
  }

  public getTimeLeftInSeconds(): number | null { return this.timeLeftInSeconds; }
  public getCurrentQuestion(): QuizQuestion | null { return this.questions[this.currentQuestionIndex] || null; }
  public getCurrentQuestionNumber(): number { return this.currentQuestionIndex + 1; }
  public getTotalQuestions(): number { return this.questions.length; }
  public getUserAnswer(questionId: string): UserAnswerType | undefined { return this.userAnswers.get(questionId); }
  public isQuizFinished(): boolean { return this.quizResultState.score !== undefined; }
  
  // --- NEW PUBLIC METHOD ---
  public getAnswerStatuses(): Map<string, boolean> {
    const statuses = new Map<string, boolean>();
    this.questions.forEach(q => {
        const answer = this.userAnswers.get(q.id);
        // An answer is considered set if it's not null or undefined.
        // For arrays, an empty array is still a response state we might care about, but for now, we treat it as unanswered if empty.
        const hasAnswer = answer !== null && answer !== undefined && (!Array.isArray(answer) || answer.length > 0);
        statuses.set(q.id, hasAnswer);
    });
    return statuses;
  }

  public submitAnswer(questionId: string, answer: UserAnswerType): void {
    this.userAnswers.set(questionId, answer);
    const question = this.questions.find(q => q.id === questionId);
    if (question) this.callbacks.onAnswerSubmit?.(question, answer);
  }

  public nextQuestion(): QuizQuestion | null {
    this._recordCurrentQuestionTime();
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      const currentQ = this.getCurrentQuestion();
      this.questionStartTime = Date.now();
      this.callbacks.onQuestionChange?.(currentQ, this.getCurrentQuestionNumber(), this.getTotalQuestions());
      return currentQ;
    }
    return null;
  }

  public previousQuestion(): QuizQuestion | null {
    this._recordCurrentQuestionTime();
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      const currentQ = this.getCurrentQuestion();
      this.questionStartTime = Date.now();
      this.callbacks.onQuestionChange?.(currentQ, this.getCurrentQuestionNumber(), this.getTotalQuestions());
      return currentQ;
    }
    return null;
  }

  public goToQuestion(index: number): QuizQuestion | null {
    if (index >= 0 && index < this.questions.length && index !== this.currentQuestionIndex) {
      this._recordCurrentQuestionTime();
      this.currentQuestionIndex = index;
      const currentQ = this.getCurrentQuestion();
      this.questionStartTime = Date.now();
      this.callbacks.onQuestionChange?.(currentQ, this.getCurrentQuestionNumber(), this.getTotalQuestions());
      return currentQ;
    }
    return this.getCurrentQuestion();
  }

  public getElapsedTime(): number {
    return Date.now() - this.overallStartTime;
  }

  public destroy(): void {
    this.stopTimer();
    this._recordCurrentQuestionTime();
    if (this.scormService && this.scormService.hasAPI()) {
      if (['initialized', 'committed', 'sending_data'].includes(this.quizResultState.scormStatus || '')) {
         const termResult = this.scormService.terminate();
         if (termResult.success) {
            this.quizResultState.scormStatus = 'terminated';
         } else {
            this.quizResultState.scormStatus = 'error';
            this.quizResultState.scormError = termResult.error || "SCORM termination failed on destroy.";
         }
      }
    }
    this.scormService = null;
  }
  
  public async calculateResults(): Promise<QuizResultType> {
    this.stopTimer();
    this._recordCurrentQuestionTime();

    let totalScore = 0;
    let maxScore = 0;
    const questionResultsArray: QuizResultType['questionResults'] = [];
    let accumulatedTotalTimeSpent = 0;

    for (const question of this.questions) {
      const userAnswerRaw = this.userAnswers.get(question.id) || null;
      maxScore += question.points ?? 0;

      const evaluator = this.evaluators.get(question.questionTypeCode);
      if (!evaluator) {
        console.warn(`No evaluator found for question type: ${question.questionTypeCode}`);
        questionResultsArray.push({
          questionId: question.id,
          questionTypeCode: question.questionTypeCode,
          prompt: question.prompt,
          meta: question.meta,
          difficultyCode: question.difficultyCode,
          isCorrect: false,
          pointsEarned: 0,
          userAnswer: { id: null, value: userAnswerRaw },
          correctAnswer: { id: null, value: 'Evaluation not implemented.' },
          explanation: question.explanation,
          timeSpentSeconds: parseFloat((this.questionTimings.get(question.id) || 0).toFixed(2)),
        });
        continue;
      }

      const { 
        isCorrect, 
        correctAnswer: correctAnswerDetail, 
        pointsEarned,
        evaluationDetails 
      } = await evaluator.evaluate(question, userAnswerRaw);
      
      totalScore += pointsEarned;
      
      const timeSpentOnThisQuestion = parseFloat((this.questionTimings.get(question.id) || 0).toFixed(2));
      accumulatedTotalTimeSpent += timeSpentOnThisQuestion;

      const userAnswerDetail = this.formatUserAnswerDetail(question, userAnswerRaw);

      questionResultsArray.push({
        questionId: question.id,
        questionTypeCode: question.questionTypeCode,
        prompt: question.prompt,
        meta: question.meta,
        difficultyCode: question.difficultyCode,
        isCorrect,
        pointsEarned,
        userAnswer: userAnswerDetail,
        correctAnswer: correctAnswerDetail,
        explanation: question.explanation,
        timeSpentSeconds: timeSpentOnThisQuestion,
        evaluationDetails: evaluationDetails,
      });
    }

    const percentage = maxScore > 0 ? parseFloat(((totalScore / maxScore) * 100).toFixed(2)) : 0;
    let passed: boolean | undefined = undefined;
    if (this.config.settings?.passingScorePercent != null) {
      passed = percentage >= this.config.settings.passingScorePercent;
    }
    const totalQuizTimeSpentSeconds = parseFloat(accumulatedTotalTimeSpent.toFixed(2));
    const averageTimePerQuestionSeconds = this.questions.length > 0 ? parseFloat((totalQuizTimeSpentSeconds / this.questions.length).toFixed(2)) : 0;
    const metadataPerformance = await this._calculateMetadataPerformance();

    const finalResults: QuizResultType = {
      score: totalScore, maxScore, percentage, answers: this.userAnswers, questionResults: questionResultsArray, passed,
      completionTimestamp: Date.now(),
      webhookStatus: 'idle', scormStatus: this.quizResultState.scormStatus || 'idle',
      scormError: this.quizResultState.scormError, studentName: this.quizResultState.studentName,
      totalTimeSpentSeconds: totalQuizTimeSpentSeconds, averageTimePerQuestionSeconds: averageTimePerQuestionSeconds,
      ...metadataPerformance,
    };
    
    this.quizResultState = {...this.quizResultState, ...finalResults};
    if (this.config.settings?.scorm) this._sendResultsToSCORM(finalResults);
    await this._sendResultsToWebhook(finalResults);
    this.callbacks.onQuizFinish?.(finalResults);
    return finalResults;
  }

  private formatUserAnswerDetail(question: QuizQuestion, userAnswerRaw: UserAnswerType): AnswerDetail | null {
    if (userAnswerRaw === null) return null;

    switch (question.questionTypeCode) {
      case 'MULTIPLE_CHOICE': {
        const q = question as MultipleChoiceQuestion;
        const id = userAnswerRaw as string;
        return { id, value: q.options.find(opt => opt.id === id)?.text || '' };
      }
      case 'MULTIPLE_RESPONSE': {
        const q = question as MultipleResponseQuestion;
        const ids = userAnswerRaw as string[];
        const values = ids.map(id => q.options.find(opt => opt.id === id)?.text || '');
        return { id: ids, value: values };
      }
      case 'SEQUENCE': {
        const q = question as SequenceQuestion;
        const ids = userAnswerRaw as string[];
        const values = ids.map(id => q.items.find(item => item.id === id)?.content || '');
        return { id: ids, value: values };
      }
      case 'MATCHING': {
        const q = question as MatchingQuestion;
        const userAnswerMap = userAnswerRaw as Record<string, string>;
        const valueMap: Record<string, string> = {};
        for (const promptId in userAnswerMap) {
            const optionId = userAnswerMap[promptId];
            const promptText = q.prompts.find(p => p.id === promptId)?.content || '';
            const optionText = q.options.find(o => o.id === optionId)?.content || '';
            valueMap[promptText] = optionText;
        }
        return { id: null, value: valueMap };
      }
      case 'DRAG_AND_DROP': {
        const q = question as DragAndDropQuestion;
        if (typeof userAnswerRaw === 'object' && userAnswerRaw !== null && !Array.isArray(userAnswerRaw)) {
            const userAnswerMapByIds = userAnswerRaw as Record<string, string[]>;
            const enrichedUserAnswerMap: Record<string, string[]> = {};
            for (const dropZoneId in userAnswerMapByIds) {
                const draggableIds = userAnswerMapByIds[dropZoneId];
                const dropZoneText = q.dropZones.find(z => z.id === dropZoneId)?.label || `(ID: ${dropZoneId})`;
                const draggableTexts = draggableIds.map(dId => q.draggableItems.find(d => d.id === dId)?.content || `(ID: ${dId})`);
                enrichedUserAnswerMap[dropZoneText] = draggableTexts;
            }
            return { id: null, value: enrichedUserAnswerMap };
        }
        return { id: null, value: userAnswerRaw };
      }
      default:
        return { id: null, value: userAnswerRaw as any };
    }
  }

  private async _calculateMetadataPerformance(): Promise<Partial<QuizResultType>> {
    const difficultyPerformanceMap = new Map<string, AggregatedPerformanceData>();
    const loPerformanceMap = new Map<string, AggregatedPerformanceData>();

    const updateMap = (map: Map<string, AggregatedPerformanceData>, key: string | undefined, points: number, isCorrect: boolean, pointsEarned: number) => {
      if (!key) return;
      const current = map.get(key) || { totalQuestions: 0, correctQuestions: 0, pointsEarned: 0, maxPoints: 0 };
      current.totalQuestions++;
      current.maxPoints += points;
      if (isCorrect) {
        current.correctQuestions++;
        current.pointsEarned += pointsEarned;
      }
      map.set(key, current);
    };

    for (const q of this.questions) {
      const userAnswer = this.userAnswers.get(q.id) || null;
      const evaluator = this.evaluators.get(q.questionTypeCode);
      if (evaluator) {
        const { isCorrect, pointsEarned } = await evaluator.evaluate(q, userAnswer);
        const pointsForThisQuestion = q.points ?? 0;
        
        updateMap(difficultyPerformanceMap, q.difficultyCode, pointsForThisQuestion, isCorrect, pointsEarned);

        const loCodes = q.meta?.learningObjectiveCodes;
        if (loCodes && loCodes.length > 0) {
            loCodes.forEach(code => {
                updateMap(loPerformanceMap, code, pointsForThisQuestion, isCorrect, pointsEarned);
            });
        }
      }
    }

    const formatPerformanceArray = <T extends PerformanceMetric & Record<string, any>>(
        map: Map<string, AggregatedPerformanceData>,
        keyName: keyof T
    ): T[] => {
        return Array.from(map.entries()).map(([key, data]) => ({
            [keyName]: key,
            totalQuestions: data.totalQuestions,
            correctQuestions: data.correctQuestions,
            pointsEarned: data.pointsEarned,
            maxPoints: data.maxPoints,
            percentage: data.maxPoints > 0 ? parseFloat(((data.pointsEarned / data.maxPoints) * 100).toFixed(2)) : 0,
        } as T));
    };

    return {
      performanceByDifficulty: formatPerformanceArray<PerformanceByDifficulty>(difficultyPerformanceMap, 'difficultyCode'),
      performanceByLearningObjective: formatPerformanceArray<PerformanceByLearningObjective>(loPerformanceMap, 'learningObjective'),
    };
  }

  private async _sendResultsToWebhook(results: QuizResultType): Promise<void> {
    if (!this.config.settings?.webhookUrl) {
      results.webhookStatus = 'idle';
      return;
    }
    results.webhookStatus = 'sending';
    try {
      const response = await fetch(this.config.settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(results),
      });
      if (response.ok) {
        results.webhookStatus = 'success';
      } else {
        results.webhookStatus = 'error';
        results.webhookError = `Webhook returned status: ${response.status} ${response.statusText}`;
        try { const errorBody = await response.text(); results.webhookError += ` - Body: ${errorBody.substring(0, 200)}`; } catch (e) { /* ignore */ }
      }
    } catch (error) {
      results.webhookStatus = 'error';
      results.webhookError = error instanceof Error ? `Fetch error: ${error.message}` : 'Unknown webhook error.';
    }
  }

  private _sendResultsToSCORM(results: QuizResultType): void {
    if (!this.scormService || !this.scormService.hasAPI() || this.quizResultState.scormStatus === 'no_api') {
      results.scormStatus = this.quizResultState.scormStatus || 'idle';
      return;
    }
    if (this.quizResultState.scormStatus === 'error' && this.quizResultState.scormError?.includes("initialization failed")) {
        results.scormStatus = 'error';
        results.scormError = this.quizResultState.scormError;
        return;
    }
    results.scormStatus = 'sending_data';
    try {
      this.scormService.setScore(results.score, results.maxScore, 0);
      let lessonStatusSetting: 'passed' | 'failed' | 'completed' | 'incomplete' | 'browsed' | 'not attempted' = 'completed';
      if (this.config.settings?.passingScorePercent !== undefined && this.config.settings?.passingScorePercent !== null) {
          lessonStatusSetting = results.passed ? 'passed' : 'failed';
      } else if (this.config.settings?.scorm?.setCompletionOnFinish) {
          lessonStatusSetting = 'completed';
      }
      this.scormService.setLessonStatus(lessonStatusSetting, results.passed);
      if (results.totalTimeSpentSeconds !== undefined && this.scormService.formatCMITime) {
        const cmiTime = this.scormService.formatCMITime(results.totalTimeSpentSeconds);
        const sessionTimeVar = this.config.settings?.scorm?.sessionTimeVar ||
                               (this.scormService.getSCORMVersion() === "2004" ? "cmi.session_time" : "cmi.core.session_time");
        if(sessionTimeVar) this.scormService.setValue(sessionTimeVar, cmiTime);
      }
      const commitResult = this.scormService.commit();
      if (commitResult.success) {
        results.scormStatus = 'committed';
      } else {
        results.scormStatus = 'error';
        results.scormError = commitResult.error || "SCORM commit failed.";
      }
    } catch (e) {
        results.scormStatus = 'error';
        results.scormError = e instanceof Error ? e.message : "Unknown SCORM data sending error.";
    }
  }
}