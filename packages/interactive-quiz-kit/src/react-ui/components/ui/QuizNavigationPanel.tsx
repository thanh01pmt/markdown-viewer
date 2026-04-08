// FILE: packages/interactive-quiz-kit/src/react-ui/components/ui/QuizNavigationPanel.tsx
'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../elements/card';
import { Button } from '../elements/button';
import { ScrollArea } from '../elements/scroll-area';
import { Progress } from '../elements/progress';
import { Clock, CheckCircle } from 'lucide-react';
import { cn } from '../../../utils/utils';
import type { QuizQuestion } from '../../../types';

interface QuizNavigationPanelProps {
  timeLeft: number | null;
  questions: QuizQuestion[];
  currentQuestionNumber: number;
  answerStatuses: Map<string, boolean>;
  onQuestionSelect: (index: number) => void;
  onFinishQuiz: () => void;
  isFinishing: boolean;
}

const formatTime = (seconds: number | null): string => {
  if (seconds === null) return '...';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const QuizNavigationPanel: React.FC<QuizNavigationPanelProps> = ({
  timeLeft,
  questions,
  currentQuestionNumber,
  answerStatuses,
  onQuestionSelect,
  onFinishQuiz,
  isFinishing,
}) => {
  const { t } = useTranslation();
  const totalQuestions = questions.length;
  const answeredCount = Array.from(answerStatuses.values()).filter(Boolean).length;

  const handleQuestionClick = (index: number) => {
    if (currentQuestionNumber !== index + 1) {
      onQuestionSelect(index);
    }
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        {timeLeft !== null && (
          <div className="flex flex-col items-center mb-4">
            <div className="relative h-24 w-24">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="stroke-current text-gray-200 dark:text-gray-700"
                  strokeWidth="8"
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                ></circle>
                <circle
                  className="stroke-current text-primary"
                  strokeWidth="8"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - (timeLeft / (questions.length * 60)))}`} // Assuming 1 min per question for total time, adjust if needed
                  transform="rotate(-90 50 50)"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{formatTime(timeLeft)}</span>
                <span className="text-xs text-muted-foreground">{t('practiceFlow.player.nav.remainingLabel', 'REMAINING')}</span>
              </div>
            </div>
          </div>
        )}
        <CardTitle className="text-lg">{t('practiceFlow.player.nav.title', 'Question Overview')}</CardTitle>
        <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
            <span>{t('practiceFlow.player.nav.answeredLabel', 'Answered:')} {answeredCount}/{totalQuestions}</span>
            <Progress value={(answeredCount / totalQuestions) * 100} className="w-1/2" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-48">
          <div className="grid grid-cols-5 gap-2 pr-4">
            {Array.from({ length: totalQuestions }, (_, i) => {
              const questionId = questions[i]?.id;
              const hasAnswer = answerStatuses.get(questionId) || false;
              const isCurrent = currentQuestionNumber === i + 1;

              return (
                <Button
                  key={i}
                  variant={isCurrent ? 'default' : hasAnswer ? 'secondary' : 'outline'}
                  size="icon"
                  onClick={() => handleQuestionClick(i)}
                  className={cn(
                    "h-8 w-8 transition-all duration-200",
                    isCurrent && "ring-2 ring-primary ring-offset-2"
                  )}
                  aria-label={`Go to question ${i + 1}`}
                >
                  {i + 1}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
        <Button onClick={onFinishQuiz} className="w-full mt-4" disabled={isFinishing}>
          <CheckCircle className="mr-2 h-4 w-4" />
          {isFinishing ? t('practiceFlow.player.submitting', 'Submitting...') : t('common.submit', 'Submit')}
        </Button>
      </CardContent>
    </Card>
  );
};