// FILE: src/lib/interactive-quiz-kit/react-ui/components/ui/SequenceQuestionUI.tsx
// ================================================================================
// UPDATED: Added `whitespace-normal` to buttons and list items to allow text wrapping for long content.

'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { SequenceQuestion, SequenceItem, UserAnswerType } from '../../../types';
import { Button } from '../elements/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../elements/card';
import { Label } from '../elements/label';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface SequenceQuestionUIProps {
  question: SequenceQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null; // string[] of item IDs in user's order
  showCorrectAnswer?: boolean;
}

export const SequenceQuestionUI: React.FC<SequenceQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer = false,
}) => {
  const { t } = useTranslation();
  const { prompt, items, points, explanation, id: questionId, correctOrder } = question;
  const [selectedSequence, setSelectedSequence] = useState<SequenceItem[]>([]);
  const [availableItems, setAvailableItems] = useState<SequenceItem[]>([]);

  useEffect(() => {
    // Initialize available items and selected sequence based on userAnswer
    const initialUserOrder = Array.isArray(userAnswer) ? userAnswer as string[] : [];
    const initialSelected: SequenceItem[] = [];
    const initialAvailable: SequenceItem[] = [...items];

    initialUserOrder.forEach(itemId => {
      const item = items.find(i => i.id === itemId);
      if (item) {
        initialSelected.push(item);
        const itemIndexInAvailable = initialAvailable.findIndex(i => i.id === itemId);
        if (itemIndexInAvailable > -1) {
          initialAvailable.splice(itemIndexInAvailable, 1);
        }
      }
    });
    setSelectedSequence(initialSelected);
    setAvailableItems(initialAvailable);
  }, [items, userAnswer]);

  const handleSelectItem = (item: SequenceItem) => {
    if (showCorrectAnswer) return;
    const newSelectedSequence = [...selectedSequence, item];
    setSelectedSequence(newSelectedSequence);
    setAvailableItems(availableItems.filter(i => i.id !== item.id));
    onAnswerChange(newSelectedSequence.map(i => i.id));
  };

  const handleRemoveFromSequence = (itemToRemove: SequenceItem, index: number) => {
    if (showCorrectAnswer) return;
    const newSelectedSequence = selectedSequence.filter((_, i) => i !== index);
    setSelectedSequence(newSelectedSequence);
    setAvailableItems([...availableItems, itemToRemove].sort((a,b) => items.findIndex(i => i.id === a.id) - items.findIndex(i => i.id === b.id)));
    onAnswerChange(newSelectedSequence.length > 0 ? newSelectedSequence.map(i => i.id) : null);
  };

  const handleResetSequence = () => {
    if (showCorrectAnswer) return;
    setSelectedSequence([]);
    setAvailableItems([...items]);
    onAnswerChange(null);
  };
  
  const getFeedbackIcon = (index: number) => {
    if (!showCorrectAnswer || !Array.isArray(userAnswer) || userAnswer.length <= index) return null;
    const userItemId = (userAnswer as string[])[index];
    const correctItemId = correctOrder[index];
    return userItemId === correctItemId ? 
      <CheckCircle className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" /> : 
      <XCircle className="h-4 w-4 text-destructive ml-2 flex-shrink-0" />;
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl mb-1 font-body">
          <MarkdownRenderer content={prompt} />
        </CardTitle>
        {points && <CardDescription className="text-sm text-muted-foreground">{t('common.points', '{{count}} points', { count: points })}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        <div className="space-y-3">
          <Label className="font-semibold">{t('practiceFlow.player.sequence.instruction', 'Arrange the following items in the correct order:')}</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {availableItems.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                onClick={() => handleSelectItem(item)}
                className="justify-start text-left h-auto py-2 px-3 whitespace-normal"
                disabled={showCorrectAnswer}
              >
                <MarkdownRenderer content={item.content} />
              </Button>
            ))}
          </div>
           {availableItems.length === 0 && selectedSequence.length > 0 && (
             <p className="text-sm text-muted-foreground">{t('practiceFlow.player.sequence.allSelected', 'All items have been selected. Click on an item in "Your selected order" to deselect it.')}</p>
           )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="font-semibold">{t('practiceFlow.player.sequence.userOrderTitle', 'Your selected order:')}</Label>
            <Button variant="ghost" size="sm" onClick={handleResetSequence} disabled={showCorrectAnswer || selectedSequence.length === 0}>
              <RotateCcw className="mr-2 h-3.5 w-3.5" /> {t('common.reset', 'Reset')}
            </Button>
          </div>
          {selectedSequence.length === 0 ? (
            <p className="text-sm text-muted-foreground p-3 border border-dashed rounded-md">{t('practiceFlow.player.sequence.noneSelected', 'No items selected yet. Click on the items above to start.')}</p>
          ) : (
            <ul className="space-y-2">
              {selectedSequence.map((item, index) => (
                <li
                  key={item.id}
                  onClick={() => handleRemoveFromSequence(item, index)}
                  className={`flex items-center justify-between p-3 border rounded-md whitespace-normal ${
                    showCorrectAnswer ? 
                    ((userAnswer as string[])?.[index] === correctOrder[index] ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10') :
                    'bg-muted/30 cursor-pointer hover:border-destructive/50'
                  } transition-colors`}
                >
                  <div className="flex-grow flex items-center">
                    <span className="font-semibold mr-2">{index + 1}.</span>
                    <MarkdownRenderer content={item.content} />
                  </div>
                  {showCorrectAnswer ? getFeedbackIcon(index) : <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive flex-shrink-0" />}
                </li>
              ))}
            </ul>
          )}
        </div>

        {showCorrectAnswer && (
          <div className="mt-4 space-y-2">
            <div className="p-3 bg-accent/20 border border-accent rounded-md">
              <p className="text-sm font-semibold text-accent-foreground">{t('practiceFlow.results.correctOrderLabel', 'Correct Order:')}</p>
              <ol className="list-decimal list-inside text-sm text-accent-foreground/80 space-y-1 mt-1">
                {correctOrder.map(itemId => {
                  const item = items.find(i => i.id === itemId);
                  return (
                    <li key={itemId}>
                      <MarkdownRenderer content={item ? item.content : 'Item not found'} />
                    </li>
                  );
                })}
              </ol>
            </div>
            {explanation && (
              <div className="mt-2 p-3 bg-muted/30 border border-muted rounded-md">
                <p className="text-sm font-semibold">{t('practiceFlow.results.explanationTitle', 'Explanation')}:</p>
                <MarkdownRenderer content={explanation} className="text-sm text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};