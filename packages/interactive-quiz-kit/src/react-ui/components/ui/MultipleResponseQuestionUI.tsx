// FILE: src/lib/interactive-quiz-kit/react-ui/components/ui/MultipleResponseQuestionUI.tsx
// ================================================================================
// VERSION 2 - INTEGRATED MarkdownRenderer

'use client';
import React from 'react';
import type { MultipleResponseQuestion, UserAnswerType } from '../../../types';
import { Checkbox } from '../elements/checkbox';
import { Label } from '../elements/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../elements/card';
import { MarkdownRenderer } from '../common/MarkdownRenderer'; // *** NEW IMPORT ***
import { cn } from '../../../utils/utils';
import { useTranslation } from 'react-i18next';

interface MultipleResponseQuestionUIProps {
  question: MultipleResponseQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null; // string[] for selected option IDs
  showCorrectAnswer?: boolean;
}

export const MultipleResponseQuestionUI: React.FC<MultipleResponseQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer = false,
}) => {
  const { t } = useTranslation();
  const { prompt, options, points, explanation, correctAnswerIds, id: questionId } = question;

  const handleSelectionChange = (optionId: string, checked: boolean) => {
    const currentAnswers = Array.isArray(userAnswer) ? [...userAnswer] : [];
    let newAnswers: string[];
    if (checked) {
      if (!currentAnswers.includes(optionId)) {
        newAnswers = [...currentAnswers, optionId];
      } else {
        newAnswers = currentAnswers; // Already selected, no change
      }
    } else {
      newAnswers = currentAnswers.filter(id => id !== optionId);
    }
    onAnswerChange(newAnswers.length > 0 ? newAnswers : null); // Pass null if no answers selected
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
        <div className="space-y-3" role="group" aria-labelledby={`question-prompt-${questionId}`}>
          {options.map((option) => {
            const isSelected = Array.isArray(userAnswer) && userAnswer.includes(option.id);
            const isCorrectOption = correctAnswerIds.includes(option.id);
            
            let itemClassName = "p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary flex items-center";

            if (showCorrectAnswer) {
              if (isCorrectOption) {
                itemClassName += isSelected ? " border-green-500 bg-green-500/10" : " border-green-500";
              } else {
                itemClassName += isSelected ? " border-destructive bg-destructive/10" : " border-muted";
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
                <Checkbox
                  id={option.id}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleSelectionChange(option.id, !!checked)}
                  className="mr-3"
                  aria-label={option.text.replace(/<[^>]*>?/gm, '')} // Use plain text for aria-label
                />
                {/* *** CHANGED: Use MarkdownRenderer for the option text *** */}
                <div className="text-base flex-1">
                  <MarkdownRenderer content={option.text} />
                </div>
              </Label>
            );
          })}
        </div>
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