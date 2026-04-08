// FILE: src/lib/interactive-quiz-kit/react-ui/components/ui/FillInTheBlanksQuestionUI.tsx
// ================================================================================
// UPDATED VERSION - ENHANCED STYLING FOR INLINE UNDERLINE INPUTS AND DROPDOWNS TO MATCH IMAGE

'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { FillInTheBlanksQuestion, UserAnswerType } from '../../../types';
import { Input } from '../elements/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../elements/card';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { cn } from '../../../utils/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../elements/select';

interface FillInTheBlanksQuestionUIProps {
  question: FillInTheBlanksQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null; // Record<string, string> for { blankId: "answer" }
  showCorrectAnswer?: boolean;
}

export const FillInTheBlanksQuestionUI: React.FC<FillInTheBlanksQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer = false,
}) => {
  const { t } = useTranslation();
  const { prompt, segments, answers: correctAnswersMap, points, explanation, id: questionId, isCaseSensitive } = question;
  
  const isValidPayload = Array.isArray(segments) && Array.isArray(correctAnswersMap);

  const [userInputs, setUserInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isValidPayload) return;
    if (userAnswer && typeof userAnswer === 'object' && !Array.isArray(userAnswer)) {
      setUserInputs(userAnswer as Record<string, string>);
    } else {
      const initialInputs: Record<string, string> = {};
      segments.forEach(segment => {
        if (segment.type === 'blank' && segment.id) {
          initialInputs[segment.id] = '';
        }
      });
      setUserInputs(initialInputs);
    }
  }, [segments, userAnswer, isValidPayload]);

  if (!isValidPayload) {
    return (
      <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
        <p className="font-semibold text-destructive">{t('invalidQuestionPayload', 'Invalid question payload')}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t('invalidFillInTheBlanksDescription', 'This fill-in-the-blanks question is missing required segments or answer definitions.')}
        </p>
      </div>
    );
  }

  const handleAnswerChangeForBlank = (blankId: string, value: string) => {
    const newInputs = { ...userInputs, [blankId]: value };
    setUserInputs(newInputs);
    const hasValue = Object.values(newInputs).some(val => val && val.trim() !== "");
    onAnswerChange(hasValue ? newInputs : null);
  };

  const getCorrectnessForBlank = (blankId: string): boolean | null => {
    if (!showCorrectAnswer || !userInputs[blankId]) return null;

    const userAnswerForBlank = userInputs[blankId]?.trim();
    const correctAnswerDef = correctAnswersMap.find(a => a.blankId === blankId);
    if (!correctAnswerDef || !userAnswerForBlank) return false;

    const caseSensitive = isCaseSensitive === undefined ? false : isCaseSensitive;
    return correctAnswerDef.acceptedValues.some(accVal => 
      caseSensitive 
      ? accVal.trim() === userAnswerForBlank 
      : accVal.trim().toLowerCase() === userAnswerForBlank.toLowerCase()
    );
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl mb-1 font-body">
          {t('common.fibPrompt')}
        </CardTitle>
        {points && <CardDescription className="text-sm text-muted-foreground">{t('common.points', '{{count}} points', { count: points })}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
      <div className="text-base leading-relaxed" aria-labelledby={`question-prompt-${questionId}`}>
          {segments.map((segment, index) => {
            if (segment.type === 'text') {
              // Render text segments inline với styling phù hợp
              return (
                <span key={`text-${index}`} className="inline align-middle">
                  {segment.content || ''}
                </span>
              );
            }
            if (segment.type === 'blank' && segment.id) {
              const blankId = segment.id;
              const answerDefinition = correctAnswersMap.find(a => a.blankId === blankId);
              const isCorrect = getCorrectnessForBlank(blankId);
              
              let feedbackClass = "";
              if (showCorrectAnswer && userInputs[blankId]?.trim()) {
                feedbackClass = isCorrect ? 'border-green-500 focus-visible:ring-green-500' : 'border-destructive focus-visible:ring-destructive';
              }

              // Nếu có options thì render dropdown, không thì render input
              if (answerDefinition?.options && answerDefinition.options.length > 0) {
                return (
                  <span key={blankId} className="inline-block align-middle mx-1">
                    <Select
                      value={userInputs[blankId] || ''}
                      onValueChange={(value) => handleAnswerChangeForBlank(blankId, value)}
                      disabled={showCorrectAnswer}
                    >
                      <SelectTrigger className={cn(
                        "inline-flex w-auto min-w-[180px] h-9 text-base border-b-2 border-t-0 border-x-0 rounded-none bg-transparent px-2",
                        showCorrectAnswer ? feedbackClass : "border-gray-400 focus:border-blue-500"
                      )}>
                        <SelectValue placeholder={t('practiceFlow.player.placeholders.select', 'Select...')} />
                      </SelectTrigger>
                      <SelectContent>
                        {answerDefinition.options.map((option, optIndex) => (
                          <SelectItem key={optIndex} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </span>
                );
              } else {
                return (
                  <span key={blankId} className="inline-block align-middle mx-1">
                    <Input
                      id={blankId}
                      type="text"
                      value={userInputs[blankId] || ''}
                      onChange={(e) => handleAnswerChangeForBlank(blankId, e.target.value)}
                      placeholder={t('practiceFlow.player.placeholders.fillInTheBlank', 'your answer')}
                      className={cn(
                        "inline-block w-auto min-w-[150px] max-w-[300px] h-9 text-base text-center",
                        "border-b-2 border-t-0 border-x-0 rounded-none bg-transparent px-2",
                        showCorrectAnswer ? feedbackClass : "border-dashed border-gray-400 focus:border-blue-500"
                      )}
                      aria-label={`Blank ${index + 1}`}
                      disabled={showCorrectAnswer}
                    />
                  </span>
                );
              }
            }
            return null;
          })}
        </div>

        {showCorrectAnswer && explanation && (
          <div className="mt-4 p-4 rounded-md bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-800/50">
            <strong className="font-semibold text-amber-900 dark:text-amber-200">{t('practiceFlow.results.explanationTitle', 'Explanation')}:</strong>
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
        
        {showCorrectAnswer && (
          <div className="mt-4 space-y-3">
            {correctAnswersMap.map(ansDef => {
              const isBlankCorrect = getCorrectnessForBlank(ansDef.blankId);
              const userAnswerDisplay = userInputs[ansDef.blankId] || t('practiceFlow.results.notAnswered', 'Not Answered');
              const blankLabelIndex = segments.findIndex(s => s.id === ansDef.blankId);
              const blankLabel = blankLabelIndex !== -1 ? blankLabelIndex + 1 : ansDef.blankId;
              
              return (
                <div key={`feedback-${ansDef.blankId}`} className={`p-2 border rounded-md ${isBlankCorrect ? 'border-green-500/50 bg-green-500/10' : 'border-destructive/50 bg-destructive/10'}`}>
                  <p className="text-sm">
                    <span className="font-semibold">{t('practiceFlow.results.blankLabel', 'Blank #{{label}}', { label: blankLabel })}:</span> {t('practiceFlow.results.youFilled', 'You filled: "{{answer}}".', { answer: userAnswerDisplay })}
                  </p>
                  <p className="text-xs">{t('practiceFlow.results.acceptedAnswersLabel', 'Accepted answers')}: {ansDef.acceptedValues.join(' | ')}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};