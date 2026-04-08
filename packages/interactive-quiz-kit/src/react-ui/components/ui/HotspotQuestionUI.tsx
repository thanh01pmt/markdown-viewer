// FILE: src/lib/interactive-quiz-kit/react-ui/components/ui/HotspotQuestionUI.tsx
// ================================================================================
// VERSION 2 - INTEGRATED MarkdownRenderer

'use client';
import React, { useState, useEffect } from 'react';
import type { HotspotQuestion, HotspotArea, UserAnswerType } from '../../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../elements/card';
import { MarkdownRenderer } from '../common/MarkdownRenderer'; // *** NEW IMPORT ***
import { cn } from '../../../utils/utils';
import { useTranslation } from 'react-i18next';

interface HotspotQuestionUIProps {
  question: HotspotQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null; // string[] for selected hotspot IDs
  showCorrectAnswer?: boolean;
}

export const HotspotQuestionUI: React.FC<HotspotQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer = false,
}) => {
  const { t } = useTranslation();
  const { prompt, imageUrl, imageAltText, hotspots, points, explanation, correctHotspotIds, id: questionId } = question;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (Array.isArray(userAnswer)) {
      setSelectedIds(userAnswer as string[]);
    } else {
      setSelectedIds([]);
    }
  }, [userAnswer]);

  const handleHotspotClick = (hotspotId: string) => {
    if (showCorrectAnswer) return;

    const newSelectedIds = selectedIds.includes(hotspotId)
      ? selectedIds.filter(id => id !== hotspotId)
      : [...selectedIds, hotspotId];
    
    setSelectedIds(newSelectedIds);
    onAnswerChange(newSelectedIds.length > 0 ? newSelectedIds : null);
  };

  const getHotspotStyle = (hotspot: HotspotArea): React.CSSProperties => {
    const style: React.CSSProperties = {
      position: 'absolute',
      border: '2px dashed transparent',
      cursor: showCorrectAnswer ? 'default' : 'pointer',
      transition: 'border-color 0.2s, background-color 0.2s',
    };

    if (hotspot.shape === 'rect') {
      style.left = `${hotspot.coords[0]}px`;
      style.top = `${hotspot.coords[1]}px`;
      style.width = `${hotspot.coords[2]}px`;
      style.height = `${hotspot.coords[3]}px`;
    } else if (hotspot.shape === 'circle') {
      style.left = `${hotspot.coords[0] - hotspot.coords[2]}px`;
      style.top = `${hotspot.coords[1] - hotspot.coords[2]}px`;
      style.width = `${hotspot.coords[2] * 2}px`;
      style.height = `${hotspot.coords[2] * 2}px`;
      style.borderRadius = '50%';
    }
    
    const isSelected = selectedIds.includes(hotspot.id);
    const safeCorrectAnswerIds = correctHotspotIds || [];
    const isCorrect = safeCorrectAnswerIds.includes(hotspot.id);

    if (showCorrectAnswer) {
      if (isCorrect && isSelected) {
        style.borderColor = 'hsl(var(--success-foreground, 142.1 70.6% 45.3%))';
        style.backgroundColor = 'hsla(var(--success-foreground, 142.1 70.6% 45.3%), 0.2)';
      } else if (!isCorrect && isSelected) {
        style.borderColor = 'hsl(var(--destructive))';
        style.backgroundColor = 'hsla(var(--destructive), 0.2)';
      } else if (isCorrect && !isSelected) {
        style.borderColor = 'hsl(var(--primary))';
        style.borderStyle = 'solid';
      }
    } else if (isSelected) {
      style.borderColor = 'hsl(var(--primary))';
      style.backgroundColor = 'hsla(var(--primary), 0.1)';
    } else {
       style.borderColor = 'hsla(var(--muted-foreground), 0.7)';
    }
    
    return style;
  };

  // Helper to strip HTML for the title attribute
  const getPlainText = (htmlString: string | undefined) => {
    if (!htmlString) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl mb-1 font-body">
          <MarkdownRenderer content={prompt} />
        </CardTitle>
        {points && <CardDescription className="text-sm text-muted-foreground">{t('common.points', '{{count}} points', { count: points })}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        <div className="relative w-full border border-muted rounded-md overflow-hidden" style={{ maxWidth: '100%', maxHeight: '500px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={imageUrl} 
            alt={imageAltText || "Hotspot image"} 
            className="block max-w-full max-h-full object-contain"
            data-ai-hint={question.imageAltText ? question.imageAltText.split(' ').slice(0,2).join(' ') : "diagram illustration"}
          />
          {hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              // *** CHANGED: Strip HTML for the title attribute ***
              title={getPlainText(hotspot.description) || `Hotspot ${hotspot.id}`}
              style={getHotspotStyle(hotspot)}
              onClick={() => handleHotspotClick(hotspot.id)}
              aria-pressed={selectedIds.includes(hotspot.id)}
              role="button"
              tabIndex={showCorrectAnswer ? -1 : 0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleHotspotClick(hotspot.id)}}
            >
            </div>
          ))}
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
        {showCorrectAnswer && (
           <div className="mt-4 space-y-2">
            <p className="font-semibold text-md">Correct Hotspots:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
                {(correctHotspotIds || []).map(id => {
                    const hotspot = hotspots.find(h => h.id === id);
                    return (
                      <li key={id}>
                        {/* *** CHANGED: Use MarkdownRenderer for the hotspot description in the answer key *** */}
                        <MarkdownRenderer content={hotspot?.description || hotspot?.id || 'N/A'} className="inline" />
                      </li>
                    );
                })}
            </ul>
           </div>
        )}
      </CardContent>
    </Card>
  );
};