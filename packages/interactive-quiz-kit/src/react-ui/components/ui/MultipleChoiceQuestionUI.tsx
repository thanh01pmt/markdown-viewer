// FILE: src/lib/interactive-quiz-kit/react-ui/components/ui/MultipleChoiceQuestionUI.tsx
// ================================================================================
// VERSION 2 - INTEGRATED MarkdownRenderer

'use client';
import React from 'react';
import type { MultipleChoiceQuestion, UserAnswerType } from '../../../types';
import { RadioGroup, RadioGroupItem } from '../elements/radio-group';
import { Label } from '../elements/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../elements/card';
import { MarkdownRenderer } from '../common/MarkdownRenderer'; // *** NEW IMPORT ***
import { cn } from '../../../utils/utils';
import { useTranslation } from 'react-i18next';

interface MultipleChoiceQuestionUIProps {
  question: MultipleChoiceQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null;
  showCorrectAnswer?: boolean;
}

export const MultipleChoiceQuestionUI: React.FC<MultipleChoiceQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer = false,
}) => {
  const { t } = useTranslation();
  const { prompt, options, points, explanation, correctAnswerId, id: questionId } = question;

  const handleSelection = (value: string) => {
    onAnswerChange(value);
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl mb-1 font-body">
          <MarkdownRenderer content={prompt} />
        </CardTitle>
        {points && <CardDescription className="text-sm text-muted-foreground">{t('common.points', '{{count}} points', { count: points })}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        <RadioGroup
          value={typeof userAnswer === 'string' ? userAnswer : ''}
          onValueChange={handleSelection}
          className="space-y-3"
          aria-labelledby={`question-prompt-${questionId}`}
        >
          {options.map((option) => {
            const isSelected = userAnswer === option.id;
            const isCorrect = option.id === correctAnswerId;
            let itemClassName = "p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary";
            
            if (showCorrectAnswer) {
              if (isCorrect) {
                itemClassName += " border-green-500 bg-green-500/10";
              } else if (isSelected && !isCorrect) {
                itemClassName += " border-destructive bg-destructive/10";
              } else {
                itemClassName += " border-muted";
              }
            } else {
               itemClassName += isSelected ? " border-primary bg-primary/10" : " border-muted";
            }

            return (
              <Label
                key={option.id}
                htmlFor={option.id}
                className={itemClassName}
              >
                <div className="flex items-center">
                  <RadioGroupItem value={option.id} id={option.id} className="mr-3" />
                  {/* *** CHANGED: Use MarkdownRenderer for the option text *** */}
                  <div className="text-base flex-1">
                    <MarkdownRenderer content={option.text} />
                  </div>
                </div>
              </Label>
            );
          })}
        </RadioGroup>
        {showCorrectAnswer && explanation && (
          <div className="mt-4 p-4 rounded-md bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-800/50">
            <strong className="font-semibold text-amber-900 dark:text-amber-200">Explanation:</strong>
            <div className={cn(
              "prose prose-sm dark:prose-invert max-w-none mt-1",
              "text-amber-800 dark:text-amber-300",
              "[--tw-prose-bold:theme(colors.amber.900)] dark:[--tw-prose-bold:theme(colors.amber.100)]",
              "[--tw-prose-code:theme(colors.amber.900)] dark:[--tw-prose-code:theme(colors.amber.100)]",
              "[--tw-prose-links:theme(colors.amber.950)] dark:[--tw-prose-links:theme(colors.amber.200)]"
            )}>
              <MarkdownRenderer content={explanation} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};