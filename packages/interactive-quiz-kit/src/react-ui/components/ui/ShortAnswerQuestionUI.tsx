// FILE: src/lib/interactive-quiz-kit/react-ui/components/ui/ShortAnswerQuestionUI.tsx
// ================================================================================
// VERSION 2 - INTEGRATED MarkdownRenderer

'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ShortAnswerQuestion, UserAnswerType } from '../../../types';
import { Input } from '../elements/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../elements/card';
import { Label } from '../elements/label';
import { MarkdownRenderer } from '../common/MarkdownRenderer'; // *** NEW IMPORT ***

interface ShortAnswerQuestionUIProps {
  question: ShortAnswerQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null; // string for user's typed answer
  showCorrectAnswer?: boolean;
}

export const ShortAnswerQuestionUI: React.FC<ShortAnswerQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer = false,
}) => {
  const { t } = useTranslation();
  const { prompt, points, explanation, acceptedAnswers, id: questionId, isCaseSensitive } = question;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAnswerChange(event.target.value || null); // Pass null if empty
  };

  const displayUserAnswer = userAnswer as string || "";

  // Determine correctness for UI feedback (if showCorrectAnswer is true)
  let isActuallyCorrect = false;
  if (showCorrectAnswer && userAnswer) {
    const userAnswerTrimmed = (userAnswer as string).trim();
    isActuallyCorrect = acceptedAnswers.some(accAns => 
        isCaseSensitive 
        ? accAns.trim() === userAnswerTrimmed 
        : accAns.trim().toLowerCase() === userAnswerTrimmed.toLowerCase()
    );
  }

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl mb-1 font-body">
          <MarkdownRenderer content={prompt} />
        </CardTitle>
        {points && <CardDescription className="text-sm text-muted-foreground">{t('common.points', '{{count}} points', { count: points })}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        <Label htmlFor={`short-answer-input-${questionId}`} className="sr-only">
          {t('practiceFlow.results.yourAnswer', 'Your Answer')}
        </Label>
        <Input
          id={`short-answer-input-${questionId}`}
          type="text"
          value={displayUserAnswer}
          onChange={handleInputChange}
          placeholder={t('practiceFlow.player.placeholders.shortAnswer', 'Type your answer here...')}
          aria-describedby={explanation ? `explanation-${questionId}` : undefined}
          className={`
            ${showCorrectAnswer && userAnswer ? (isActuallyCorrect ? 'border-green-500 focus-visible:ring-green-500' : 'border-destructive focus-visible:ring-destructive') : 'border-input'}
          `}
        />
        {showCorrectAnswer && (
          <div className="mt-4 space-y-2">
            {userAnswer && !isActuallyCorrect && (
              <p className="text-sm text-destructive">
                {t('practiceFlow.results.incorrectAnswer', 'Your answer was marked incorrect.')}
              </p>
            )}
            <div className="p-3 bg-accent/20 border border-accent rounded-md">
              <p className="text-sm font-semibold text-accent-foreground">{t('practiceFlow.results.acceptedAnswersLabel', 'Accepted Answers:')}</p>
              <ul className="list-disc list-inside text-sm text-accent-foreground/80">
                {acceptedAnswers.map((ans, idx) => <li key={idx}>{ans}</li>)}
              </ul>
              {isCaseSensitive && <p className="text-xs text-muted-foreground mt-1">({t('practiceFlow.results.caseSensitive', 'Case-sensitive')})</p>}
            </div>
            {explanation && (
              <div id={`explanation-${questionId}`} className="mt-2 p-3 bg-muted/30 border border-muted rounded-md">
                <p className="text-sm font-semibold">{t('practiceFlow.results.explanationTitle', 'Explanation')}:</p>
                {/* *** CHANGED: Use MarkdownRenderer for the explanation *** */}
                <MarkdownRenderer content={explanation} className="text-sm text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};