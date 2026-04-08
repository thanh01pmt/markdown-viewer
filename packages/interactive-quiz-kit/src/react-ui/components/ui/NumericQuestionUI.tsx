// FILE: src/lib/interactive-quiz-kit/react-ui/components/ui/NumericQuestionUI.tsx
// ================================================================================
// VERSION 2 - INTEGRATED MarkdownRenderer

'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { NumericQuestion, UserAnswerType } from '../../../types';
import { Input } from '../elements/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../elements/card';
import { Label } from '../elements/label';
import { MarkdownRenderer } from '../common/MarkdownRenderer'; // *** NEW IMPORT ***

interface NumericQuestionUIProps {
  question: NumericQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null; // string or number for user's typed answer
  showCorrectAnswer?: boolean;
}

export const NumericQuestionUI: React.FC<NumericQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer = false,
}) => {
  const { t } = useTranslation();
  const { prompt, points, explanation, answer: correctAnswerValue, tolerance, id: questionId } = question;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Allow empty string (for clearing input), or valid numeric patterns
    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
      onAnswerChange(value === '' ? null : value);
    }
  };
  
  const displayUserAnswer = userAnswer as string || "";

  let isActuallyCorrect = false;
  if (showCorrectAnswer && userAnswer !== null && userAnswer !== "") {
    const userAnswerNum = parseFloat(String(userAnswer));
    if (!isNaN(userAnswerNum)) {
      isActuallyCorrect = tolerance !== undefined && tolerance !== null
        ? Math.abs(userAnswerNum - correctAnswerValue) <= tolerance
        : userAnswerNum === correctAnswerValue;
    }
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
        <Label htmlFor={`numeric-input-${questionId}`} className="sr-only">
          {t('practiceFlow.results.yourAnswer', 'Your Answer')}
        </Label>
        <Input
          id={`numeric-input-${questionId}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*\.?[0-9]*"
          value={displayUserAnswer}
          onChange={handleInputChange}
          placeholder={t('practiceFlow.player.placeholders.numeric', 'Enter a number')}
          aria-describedby={explanation ? `explanation-${questionId}` : undefined}
          className={`
            ${showCorrectAnswer && userAnswer !== null && userAnswer !== "" ? (isActuallyCorrect ? 'border-green-500 focus-visible:ring-green-500' : 'border-destructive focus-visible:ring-destructive') : 'border-input'}
          `}
        />
        {showCorrectAnswer && (
          <div className="mt-4 space-y-2">
            {userAnswer !== null && userAnswer !== "" && !isActuallyCorrect && (
              <p className="text-sm text-destructive">
                {t('practiceFlow.results.incorrectAnswer', 'Your answer was marked incorrect.')}
              </p>
            )}
            <div className="p-3 bg-accent/20 border border-accent rounded-md">
              <p className="text-sm font-semibold text-accent-foreground">{t('practiceFlow.results.correctAnswerLabel', 'Correct Answer:')}</p>
              <p className="text-sm text-accent-foreground/80">
                {correctAnswerValue}
                {tolerance !== undefined && tolerance !== null && tolerance > 0 && (
                  ` (${t('practiceFlow.results.tolerance', 'Tolerance: ±{{tolerance}}, Accepted range: {{min}} to {{max}}', { tolerance: tolerance, min: correctAnswerValue - tolerance, max: correctAnswerValue + tolerance })})`
                )}
              </p>
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