'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { MatchingQuestion, MatchPromptItem, MatchOptionItem, UserAnswerType } from '../../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../elements/card';
import { Label } from '../elements/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../elements/select';
import { CheckCircle, XCircle } from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { cn } from '../../../utils/utils';

interface MatchingQuestionUIProps {
  question: MatchingQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null;
  showCorrectAnswer?: boolean;
}

export const MatchingQuestionUI: React.FC<MatchingQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer = false,
}) => {
  const { t } = useTranslation();
  const { prompt, prompts, options: initialOptions, points, explanation, correctAnswerMap, id: questionId } = question;
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});
  const [shuffledOptions, setShuffledOptions] = useState<MatchOptionItem[]>(initialOptions);

  const shuffleWithSeed = (arr: MatchOptionItem[], seedStr: string): MatchOptionItem[] => {
    let seed = 0;
    for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
    let s = seed >>> 0;
    const next = () => {
      s += 0x6D2B79F5;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  };

  useEffect(() => {
    if (question.shuffleOptions) {
      setShuffledOptions(shuffleWithSeed(initialOptions, questionId));
    } else {
      setShuffledOptions(initialOptions);
    }
  }, [initialOptions, question.shuffleOptions, questionId]);

  useEffect(() => {
    if (userAnswer && typeof userAnswer === 'object' && !Array.isArray(userAnswer)) {
      setCurrentAnswers(userAnswer as Record<string, string>);
    } else {
      const initial: Record<string, string> = {};
      prompts.forEach(p => initial[p.id] = '');
      setCurrentAnswers(initial);
    }
  }, [userAnswer, prompts]);

  const handleSelectChange = (promptId: string, optionId: string) => {
    const newAnswers = { ...currentAnswers, [promptId]: optionId };
    setCurrentAnswers(newAnswers);
    const hasSelection = Object.values(newAnswers).some(val => val && val !== '');
    onAnswerChange(hasSelection ? newAnswers : null);
  };

  const getCorrectOptionIdForPrompt = (promptId: string): string | undefined => {
    return correctAnswerMap.find(map => map.promptId === promptId)?.optionId;
  };
  
  const getPlainText = (htmlString: string | undefined) => {
    if (!htmlString) return '';
    if (typeof document !== 'undefined') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        return tempDiv.textContent || tempDiv.innerText || '';
    }
    return htmlString.replace(/<[^>]*>?/gm, '');
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cột Prompts */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-foreground">
              {t('practiceFlow.player.matching.promptsLabel', 'Prompts')}
            </h3>
            <div className="space-y-3">
              {prompts.map((promptItem, index) => {
                const selectedOptionId = currentAnswers[promptItem.id] || "";
                const correctOptionId = getCorrectOptionIdForPrompt(promptItem.id);
                const isSelectionCorrect = showCorrectAnswer && selectedOptionId ? selectedOptionId === correctOptionId : null;

                return (
                  <div key={promptItem.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <MarkdownRenderer 
                        content={promptItem.content} 
                        className="text-base leading-relaxed"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột Answers */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-foreground">
              {t('practiceFlow.player.matching.answersLabel', 'Answers')}
            </h3>
            <div className="space-y-3">
              {prompts.map((promptItem, index) => {
                const selectedOptionId = currentAnswers[promptItem.id] || "";
                const correctOptionId = getCorrectOptionIdForPrompt(promptItem.id);
                const isSelectionCorrect = showCorrectAnswer && selectedOptionId ? selectedOptionId === correctOptionId : null;

                let selectBorderColor = 'border-input';
                if (showCorrectAnswer && selectedOptionId) {
                  selectBorderColor = isSelectionCorrect ? 'border-green-500' : 'border-red-500';
                }

                return (
                  <div key={`answer-${promptItem.id}`} className="relative">
                    <Select
                      value={selectedOptionId}
                      onValueChange={(value) => handleSelectChange(promptItem.id, value)}
                      disabled={showCorrectAnswer}
                    >
                      <SelectTrigger 
                        id={`select-prompt-${promptItem.id}`}
                        className={cn(
                          "w-full h-auto min-h-[40px] py-2.5 text-left",
                          selectBorderColor,
                          showCorrectAnswer && selectedOptionId && "pr-10"
                        )}
                      >
                        <SelectValue placeholder={t('practiceFlow.player.placeholders.matching', 'Select match')} />
                      </SelectTrigger>
                      <SelectContent className="max-w-[400px]">
                        {shuffledOptions.map((option) => {
                          const isSelectedElsewhere = Object.entries(currentAnswers).some(
                            ([pId, oId]) => pId !== promptItem.id && oId === option.id
                          );
                          return (
                            <SelectItem 
                              key={option.id} 
                              value={option.id} 
                              className="whitespace-normal py-2 cursor-pointer"
                              disabled={isSelectedElsewhere}
                            >
                              {getPlainText(option.content)}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    
                    {showCorrectAnswer && selectedOptionId && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {isSelectionCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    )}
                    
                    {showCorrectAnswer && !selectedOptionId && correctOptionId && (
                      <p className="text-xs text-muted-foreground mt-1 ml-1">
                        {t('practiceFlow.results.notSelectedCorrectIs', 'Not selected. Correct: {{answer}}', { 
                          answer: getPlainText(shuffledOptions.find(o => o.id === correctOptionId)?.content) 
                        })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {showCorrectAnswer && explanation && (
          <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-start gap-2">
              <strong className="font-semibold text-amber-900 dark:text-amber-200">
                {t('practiceFlow.results.explanationTitle', 'Explanation')}:
              </strong>
            </div>
            <div className={cn(
              "prose prose-sm dark:prose-invert max-w-none mt-2",
              "text-amber-800 dark:text-amber-300",
              "[--tw-prose-bold:theme(colors.amber.900)] dark:[--tw-prose-bold:theme(colors.amber.100)]"
            )}>
              <MarkdownRenderer content={explanation} />
            </div>
          </div>
        )}

        {showCorrectAnswer && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="font-semibold text-base mb-3">
              {t('practiceFlow.results.correctAnswersLabel', 'Correct Answers')}
            </p>
            <div className="space-y-2">
              {correctAnswerMap.map(map => {
                const promptText = prompts.find(p => p.id === map.promptId)?.content;
                const optionText = initialOptions.find(o => o.id === map.optionId)?.content;
                return (
                  <div key={map.promptId} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground">•</span>
                    <div className="flex-1">
                      <span className="font-medium">{getPlainText(promptText)}</span>
                      <span className="text-muted-foreground mx-2">→</span>
                      <span>{getPlainText(optionText)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};