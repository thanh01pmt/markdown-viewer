// FILE: src/lib/interactive-quiz-kit/react-ui/components/ui/QuizPlayer.tsx
// ================================================================================
// FIXED: Re-added onProgressUpdate callback logic

'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../utils/utils';
import { useToast } from '../../hooks/use-toast';
import type { QuizConfig, QuizResultType, QuizQuestion, UserAnswerType, QuizEngineCallbacks } from '../../../types';
import { QuizEngine } from '../../../services/QuizEngine';
import { QuestionRenderer } from './QuestionRenderer';
import { QuizErrorBoundary } from './QuizErrorBoundary';
import { Button } from '../elements/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../elements/card';
import { AlertCircle, Loader2, LogOut, PanelRightOpen, ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { BlocklyProgrammingQuestionUIRef } from './BlocklyProgrammingQuestionUI';
import type { ScratchProgrammingQuestionUIRef } from './ScratchProgrammingQuestionUI';
import { QuizResult } from './QuizResult';
import { useIsMobile } from '../../hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '../elements/sheet';
import { ScrollArea } from '../elements/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../elements/alert-dialog';

interface QuizPlayerProps {
  quizConfig: QuizConfig;
  onQuizComplete: (result: QuizResultType) => void;
  onExitQuiz?: () => void;
  onProgressUpdate?: (completed: number, total: number) => void; // Already exists
}

type ProgrammingQuestionRefType = BlocklyProgrammingQuestionUIRef | ScratchProgrammingQuestionUIRef;

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ 
  quizConfig, 
  onQuizComplete, 
  onExitQuiz, 
  onProgressUpdate 
}) => {
  // State Management
  const [engine, setEngine] = useState<QuizEngine | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [userAnswer, setUserAnswer] = useState<UserAnswerType>(null);
  const [answerStatuses, setAnswerStatuses] = useState<Map<string, boolean>>(new Map());
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalResult, setFinalResult] = useState<QuizResultType | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Hooks
  const { t } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Refs
  const programmingQuestionRef = useRef<ProgrammingQuestionRefType>(null);
  const engineRef = useRef<QuizEngine | null>(null);
  const isInitializedRef = useRef(false);
  const autoSubmitTriggeredRef = useRef(false);

  // Calculate unanswered questions
  const unansweredCount = useMemo(() => {
    if (!engine) return 0;
    let count = 0;
    engine.questions.forEach(q => {
      if (!answerStatuses.get(q.id)) {
        count++;
      }
    });
    return count;
  }, [engine, answerStatuses]);

  // Format time left
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update answer statuses
  const updateAnswerStatuses = useCallback(() => {
    const currentEngine = engineRef.current;
    if (currentEngine) {
      const statuses = currentEngine.getAnswerStatuses();
      setAnswerStatuses(new Map(statuses));
      
      // --- ADDED: Update progress when answer statuses change ---
      const answeredCount = currentEngine.questions.filter(q => {
        const answer = currentEngine.getUserAnswer(q.id);
        return answer !== undefined && answer !== null;
      }).length;
      onProgressUpdate?.(answeredCount, currentEngine.getTotalQuestions());
      // --- END ADDED ---
    }
  }, [onProgressUpdate]); // Added onProgressUpdate to dependencies

// Submit answer
  const handleSubmitAnswer = useCallback(() => {
    const currentEngine = engineRef.current;
    if (!currentEngine || !currentQuestion) return;
    
    let answerToSubmit: UserAnswerType = userAnswer;
    
    // Get workspace XML for programming questions
    if (currentQuestion.questionTypeCode === 'BLOCKLY_PROGRAMMING' || 
        currentQuestion.questionTypeCode === 'SCRATCH_PROGRAMMING') {
      if (programmingQuestionRef.current?.getWorkspaceXml) {
        answerToSubmit = programmingQuestionRef.current.getWorkspaceXml();
      }
    }
    
    currentEngine.submitAnswer(currentQuestion.id, answerToSubmit);
    updateAnswerStatuses(); // This will trigger onProgressUpdate inside updateAnswerStatuses
    
    // Persist state to sessionStorage
    const answers: Record<string, any> = {};
    currentEngine.questions.forEach(q => {
      const a = currentEngine.getUserAnswer(q.id);
      if (a !== undefined && a !== null) {
        answers[q.id] = a;
      }
    });
    
    sessionStorage.setItem(`quizState:${quizConfig.id}`, JSON.stringify({
      currentIndex: currentEngine.getCurrentQuestionNumber() - 1,
      answers
    }));
  }, [currentQuestion, userAnswer, quizConfig.id, updateAnswerStatuses]);

  // Confirm and finish quiz
  const handleFinishQuizConfirmed = useCallback(async () => {
    if (!engineRef.current) return;
    
    setShowSubmitDialog(false);
    setIsFinishing(true);
    handleSubmitAnswer();
    
    // --- ADDED: Update progress to 100% when finishing ---
    onProgressUpdate?.(engineRef.current.getTotalQuestions(), engineRef.current.getTotalQuestions());
    // --- END ADDED ---
    
    await engineRef.current.calculateResults();
  }, [handleSubmitAnswer, onProgressUpdate]); // Added onProgressUpdate

    // Quiz Engine Callbacks
  const callbacks = useMemo((): QuizEngineCallbacks => ({
    onQuizStart: (initialData) => {
      setCurrentQuestion(initialData.initialQuestion);
      setCurrentQuestionNumber(initialData.currentQuestionNumber);
      setTotalQuestions(initialData.totalQuestions);
      setTimeLeft(initialData.timeLimitInSeconds);
      setIsLoading(false);
      updateAnswerStatuses();
    },
    onQuestionChange: (question, qNum, total) => {
      setCurrentQuestion(question);
      setCurrentQuestionNumber(qNum);
      setTotalQuestions(total);
      const currentEngine = engineRef.current;
      if (currentEngine) {
        const existingAnswer = currentEngine.getUserAnswer(question?.id || '');
        setUserAnswer(existingAnswer !== undefined ? existingAnswer : null);
        
        // --- ADDED: Update progress on question change ---
        const answeredCount = currentEngine.questions.filter(q => {
          const answer = currentEngine.getUserAnswer(q.id);
          return answer !== undefined && answer !== null;
        }).length;
        onProgressUpdate?.(answeredCount, total);
        // --- END ADDED ---
        
        updateAnswerStatuses();
      }
    },
    onQuizFinish: (results) => {
      setFinalResult(results);
      setQuizFinished(true);
      onQuizComplete(results);
      setIsLoading(false);
      setIsFinishing(false);
    },
    onTimeTick: (timeLeftInSeconds) => {
      setTimeLeft(timeLeftInSeconds);
    },
    onQuizTimeUp: () => {
      if (!autoSubmitTriggeredRef.current) {
        autoSubmitTriggeredRef.current = true;
        toast({
          title: t('practiceFlow.player.timeUpTitle', 'Time is up!'),
          description: t('practiceFlow.player.timeUpDescription', 'Your quiz will be submitted automatically.'),
          variant: "destructive",
          duration: 5000,
        });
        // Auto submit when time is up
        setTimeout(() => {
          handleFinishQuizConfirmed();
        }, 1000);
      }
    }
  }), [onQuizComplete, toast, updateAnswerStatuses, onProgressUpdate, t, handleFinishQuizConfirmed]); // Added dependencies

  // Handle answer change
  const handleAnswerChangeRef = useRef<(answer: UserAnswerType) => void>(() => {});
  const handleAnswerChange = useCallback((answer: UserAnswerType) => {
    handleAnswerChangeRef.current(answer);
  }, []);

  useEffect(() => {
    handleAnswerChangeRef.current = (answer: UserAnswerType) => {
      if (currentQuestion?.questionTypeCode !== 'BLOCKLY_PROGRAMMING' && 
          currentQuestion?.questionTypeCode !== 'SCRATCH_PROGRAMMING') {
        setUserAnswer(answer);
        const immediateTypes = new Set([
          'MULTIPLE_CHOICE',
          'MULTIPLE_RESPONSE',
          'TRUE_FALSE',
          'SEQUENCE',
          'MATCHING',
          'DRAG_AND_DROP',
          'HOTSPOT',
          'FILL_IN_THE_BLANKS'
        ]);
        if (currentQuestion && immediateTypes.has(currentQuestion.questionTypeCode)) {
          queueMicrotask(() => {
            const currentEngine = engineRef.current;
            if (!currentEngine || !currentQuestion) return;
            currentEngine.submitAnswer(currentQuestion.id, answer);
            updateAnswerStatuses();
          });
        }
      }
    };
  }, [currentQuestion?.questionTypeCode, currentQuestion, updateAnswerStatuses]);

  // Quiz config key for dependency tracking
  const quizConfigKey = useMemo(() => {
    return JSON.stringify({
      id: quizConfig.id,
      version: quizConfig.version,
      title: quizConfig.title
    });
  }, [quizConfig.id, quizConfig.version, quizConfig.title]);

  // Initialize Quiz Engine
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    setIsLoading(true);
    isInitializedRef.current = true;
    
    try {
      const localQuizEngine = new QuizEngine({ config: quizConfig, callbacks });
      engineRef.current = localQuizEngine;
      setEngine(localQuizEngine);
      
      // Restore saved state if exists
      const savedState = sessionStorage.getItem(`quizState:${quizConfig.id}`);
      if (savedState) {
        const { currentIndex, answers } = JSON.parse(savedState);
        Object.entries(answers).forEach(([questionId, answer]) => {
          localQuizEngine.submitAnswer(questionId, answer as UserAnswerType);
        });
        if (currentIndex > 0) {
          localQuizEngine.goToQuestion(currentIndex);
        }
      }
      
      setIsLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load quiz.");
      setIsLoading(false);
    }
    
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
      isInitializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizConfigKey]);

  // Auto-submit answer with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (userAnswer !== null) {
        handleSubmitAnswer();
      }
    }, 500);
    
    return () => clearTimeout(handler);
  }, [userAnswer, handleSubmitAnswer]);
  
  // Handle question selection
  const handleQuestionSelect = useCallback((index: number) => {
    handleSubmitAnswer();
    engineRef.current?.goToQuestion(index);
    setIsNavOpen(false);
  }, [handleSubmitAnswer]);

  // Navigate to previous question
  const handlePrevQuestion = useCallback(() => {
    if (currentQuestionNumber > 1) {
      handleSubmitAnswer();
      engineRef.current?.goToQuestion(currentQuestionNumber - 2);
    }
  }, [currentQuestionNumber, handleSubmitAnswer]);

  // Navigate to next question
  const handleNextQuestion = useCallback(() => {
    if (currentQuestionNumber < totalQuestions) {
      handleSubmitAnswer();
      engineRef.current?.goToQuestion(currentQuestionNumber);
    }
  }, [currentQuestionNumber, totalQuestions, handleSubmitAnswer]);

  // Show finish quiz dialog
  const handleFinishQuiz = useCallback(() => {
    handleSubmitAnswer();
    setShowSubmitDialog(true);
  }, [handleSubmitAnswer]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t('common.error', 'Quiz Error')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            {onExitQuiz && (
              <Button onClick={onExitQuiz} className="mt-4 w-full">
                {t('common.back', 'Back')}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz finished state
  if (quizFinished && finalResult) {
    return (
      <QuizResult 
        result={finalResult} 
        onExitQuiz={onExitQuiz} 
        quizTitle={quizConfig.title} 
      />
    );
  }

  // Invalid state
  if (!engine || !currentQuestion) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-muted-foreground">{t('practiceFlow.player.loadError', 'Quiz could not be loaded.')}</p>
      </div>
    );
  }

  // Navigation panel component
  const navigationPanel = (
    <div className="h-auto flex flex-col bg-card">
      {/* Time Display */}
      {timeLeft !== null && (
        <div className="p-4 border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('practiceFlow.player.nav.timeRemaining', 'Time Left')}</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className={cn(
                "text-lg font-bold",
                timeLeft < 300 ? "text-destructive" : "text-primary"
              )}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Question Grid */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{t('practiceFlow.player.nav.questionList', 'Question List')}</span>
            <span className="text-muted-foreground">
              {totalQuestions - unansweredCount}/{totalQuestions}
            </span>
          </div>
          
          <div className="grid grid-cols-5 gap-3 p-1">
            {engine.questions.map((q, index) => {
              const isAnswered = answerStatuses.get(q.id) === true;
              const isCurrent = currentQuestionNumber === index + 1;
              
              return (
                <button
                  key={q.id}
                  onClick={() => handleQuestionSelect(index)}
                  className={cn(
                    "aspect-square rounded-md border-2 font-semibold text-sm transition-transform duration-200",
                    "flex items-center justify-center relative",
                    "hover:scale-105 active:scale-95",
                    isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    isAnswered 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-background border-border hover:border-primary/50"
                  )}
                >
                  {index + 1}
                  {isAnswered && (
                    <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-green-500 bg-background rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t space-y-2">
        <Button
          onClick={handleFinishQuiz}
          disabled={isFinishing}
          className="w-full"
          size="lg"
        >
          {isFinishing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('practiceFlow.player.submitting', 'Submitting...')}
            </>
          ) : (
            t('common.submit', 'Submit')
          )}
        </Button>
        
        {onExitQuiz && (
          <Button
            variant="outline"
            onClick={onExitQuiz}
            className="w-full"
            size="sm"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t('common.exit', 'Exit')}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-7xl mx-auto p-4 lg:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold truncate">
                {quizConfig.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t('practiceFlow.player.questionProgress', 'Question {{current}} of {{total}}', { current: currentQuestionNumber, total: totalQuestions })}
              </p>
            </div>
            
            {/* Mobile Navigation Toggle */}
            {isMobile && (
              <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <PanelRightOpen className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[340px] p-0">
                  {navigationPanel}
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* Main Layout */}
          <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
            {/* Question Content */}
            <div className="min-w-0 space-y-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl">
                      {t('practiceFlow.player.questionTitle', 'Question {{number}}', { number: currentQuestionNumber })}
                    </CardTitle>
                    {currentQuestion.points && (
                      <CardDescription className="shrink-0 font-medium">
                        {t('common.points', '{{count}} points', { count: currentQuestion.points })}
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <QuizErrorBoundary>
                    <QuestionRenderer
                      question={currentQuestion}
                      onAnswerChange={handleAnswerChange}
                      userAnswer={userAnswer}
                      ref={programmingQuestionRef}
                    />
                  </QuizErrorBoundary>
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionNumber === 1}
                  size="lg"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t('common.previous', 'Previous')}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleNextQuestion}
                  disabled={currentQuestionNumber === totalQuestions}
                  size="lg"
                >
                  {t('common.next', 'Next')}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Desktop Navigation Panel */}
            {!isMobile && (
              <aside className="lg:sticky lg:top-6 lg:self-start">
                <Card className="overflow-hidden h-auto">
                  {navigationPanel}
                </Card>
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {unansweredCount === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              {t('dialogs.submitConfirm.title', 'Confirm Submission')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                {unansweredCount === 0 ? (
                  <p>
                    {timeLeft && timeLeft > 60 
                      ? t('dialogs.submitConfirm.allAnsweredWithTime', 'There are still {{minutes}} minutes left, you should check carefully for the best results.', { minutes: Math.floor(timeLeft / 60) })
                      : t('dialogs.submitConfirm.allAnswered', 'You have completed all questions. Do you want to submit?')
                    }
                  </p>
                ) : (
                  <p>
                    {t('dialogs.submitConfirm.unanswered', 'You still have {{count}} unanswered question. You should check and complete it for the best results.', { count: unansweredCount })}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {t('dialogs.submitConfirm.warning', 'Once submitted, you will not be able to edit your answers.')}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinishQuizConfirmed}>
              {t('common.submit', 'Submit')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};