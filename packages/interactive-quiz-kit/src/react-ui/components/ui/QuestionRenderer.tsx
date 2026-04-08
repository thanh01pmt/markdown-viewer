// FILE: src/lib/interactive-quiz-kit/react-ui/components/ui/QuestionRenderer.tsx
// ================================================================================
// UPDATED: Fixed a TypeScript error where metaKeys was inferred as `never[]`.

'use client';
import React, { useMemo } from 'react';
import type { QuizQuestion, UserAnswerType, QuestionTypeStrings, BaseQuestion } from '../../../types';
import { MultipleChoiceQuestionUI } from './MultipleChoiceQuestionUI';
import { TrueFalseQuestionUI } from './TrueFalseQuestionUI';
import { MultipleResponseQuestionUI } from './MultipleResponseQuestionUI';
import { ShortAnswerQuestionUI } from './ShortAnswerQuestionUI';
import { NumericQuestionUI } from './NumericQuestionUI';
import { FillInTheBlanksQuestionUI } from './FillInTheBlanksQuestionUI';
import { SequenceQuestionUI } from './SequenceQuestionUI';
import { MatchingQuestionUI } from './MatchingQuestionUI';
import { DragAndDropQuestionUI } from './DragAndDropQuestionUI';
import { HotspotQuestionUI } from './HotspotQuestionUI';
import { BlocklyProgrammingQuestionUI, type BlocklyProgrammingQuestionUIRef } from './BlocklyProgrammingQuestionUI';
import { ScratchProgrammingQuestionUI, type ScratchProgrammingQuestionUIRef } from './ScratchProgrammingQuestionUI';
import { CodingQuestionUI } from './CodingQuestionUI';
import { useTranslation } from 'react-i18next';
import { generateUniqueId } from '../../../utils/idGenerators';

// Define a specific type for the keys of the meta object to avoid `keyof` issues with optional properties.
type MetaKey =
  | 'learningObjectiveCodes'
  | 'topicCodes'
  | 'categoryCodes'
  | 'subjectCodes'
  | 'fieldCodes'
  | 'conceptCodes'
  | 'gradeLevelCodes';

type SingleMetaKey = 'bloomLevelCode' | 'contextCode' | 'knowledgeDimensionCode';


function normalizeLegacyFIB(adapted: any): void {
  if (adapted.sentenceWithPlaceholders && adapted.blanks && (!adapted.segments || !adapted.answers)) {
    const sentenceWithPlaceholders = adapted.sentenceWithPlaceholders as string;
    const blanks = adapted.blanks as Record<string, any>;

    const segments: any[] = [];
    const answers: any[] = [];
    const placeholderMap: Record<string, string> = {};

    Object.keys(blanks).forEach((placeholder) => {
      const blankId = generateUniqueId('blank_');
      placeholderMap[placeholder] = blankId;
      answers.push({
        blankId,
        acceptedValues: blanks[placeholder].acceptedValues || [],
        options: blanks[placeholder].options,
      });
    });

    const regex = /\{\{([^}]+)\}\}/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(sentenceWithPlaceholders)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          content: sentenceWithPlaceholders.substring(lastIndex, match.index),
        });
      }
      const placeholder = match[1].trim();
      const blankId = placeholderMap[placeholder];
      if (blankId) {
        segments.push({ type: 'blank', id: blankId });
      } else {
        segments.push({ type: 'text', content: match[0] });
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < sentenceWithPlaceholders.length) {
      segments.push({
        type: 'text',
        content: sentenceWithPlaceholders.substring(lastIndex),
      });
    }

    adapted.segments = segments;
    adapted.answers = answers;
    if (typeof adapted.isCaseSensitive === 'undefined') {
      adapted.isCaseSensitive = false;
    }
    delete adapted.sentenceWithPlaceholders;
    delete adapted.blanks;
  }
}

function normalizeLegacyDND(adapted: any): void {
  if (Array.isArray(adapted.draggableItems) && adapted.draggableItems.length > 0 && typeof adapted.draggableItems[0] === 'string') {
    const oldItems = adapted.draggableItems as string[];
    const oldZones = Array.isArray(adapted.dropZones) ? (adapted.dropZones as any[]) : [];
    const oldAnswerMap = adapted.answerMap as Record<string, string[]> | undefined;

    const draggableItems = oldItems.map((content) => ({
      id: generateUniqueId('drag_'),
      content: content.trim(),
    }));

    const dropZones: any[] = [];
    oldZones.forEach((zone) => {
      if (typeof zone === 'string') {
        dropZones.push({
          id: generateUniqueId('zone_'),
          label: zone.trim(),
        });
      } else if (zone && zone.id) {
        dropZones.push(zone);
      }
    });

    const answerMap: any[] = [];
    if (oldAnswerMap && !Array.isArray(oldAnswerMap)) {
      dropZones.forEach((zone) => {
        const itemsForThisZone = oldAnswerMap[zone.label] || [];
        itemsForThisZone.forEach((itemContent: string) => {
          const draggableItem = draggableItems.find((d) => d.content === itemContent);
          if (draggableItem) {
            answerMap.push({
              draggableId: draggableItem.id,
              dropZoneId: zone.id,
            });
          }
        });
      });
    }

    adapted.draggableItems = draggableItems;
    adapted.dropZones = dropZones;
    if (answerMap.length > 0 || (oldAnswerMap && !Array.isArray(oldAnswerMap))) {
      adapted.answerMap = answerMap;
    }
  }
}

function normalizeMalformedMatching(adapted: any): void {
  if (Array.isArray(adapted.options) && adapted.options.length === 1 && typeof adapted.options[0].content === 'string' && adapted.options[0].content.includes('|')) {
    const singleOptionContent = adapted.options[0].content;
    const parts = singleOptionContent.split('|').map((p: string) => p.trim()).filter(Boolean);
    const newOptions: any[] = [];
    const newAnswerMap: any[] = [];
    const prompts = Array.isArray(adapted.prompts) ? adapted.prompts : [];
    
    // We need a helper to safely strip HTML tags if the prompt has them
    const stripHtml = (html: string) => html ? html.replace(/<[^>]*>?/gm, '').trim() : '';

    parts.forEach((part: string, index: number) => {
      const newOptionId = generateUniqueId('opt_');
      let optionContent = part;
      let matchedPromptId = null;

      for (const prompt of prompts) {
        const promptText = stripHtml(prompt.content);
        if (promptText && optionContent.startsWith(promptText + ':')) {
          matchedPromptId = prompt.id;
          optionContent = optionContent.substring(promptText.length + 1).trim();
          break;
        }
      }

      if (!matchedPromptId && index < prompts.length) {
        matchedPromptId = prompts[index].id;
      }

      newOptions.push({
        id: newOptionId,
        content: optionContent,
      });

      if (matchedPromptId) {
        newAnswerMap.push({
          promptId: matchedPromptId,
          optionId: newOptionId,
        });
      }
    });

    adapted.options = newOptions;
    if (newAnswerMap.length === prompts.length) {
       adapted.correctAnswerMap = newAnswerMap;
    } else if (newAnswerMap.length > 0 && (!adapted.correctAnswerMap || adapted.correctAnswerMap.length <= 1)) {
       adapted.correctAnswerMap = newAnswerMap;
    }
  }
}

/**
 * Adapter function to convert legacy question structures to the current QuizQuestion format.
 * This ensures backward compatibility with older data stored in the database.
 * @param question - The original question object (could be old or new format).
 * @returns A question object conforming to the latest QuizQuestion type.
 */
export function adaptLegacyQuestion(question: any): QuizQuestion {
    // We deep clone to avoid mutating the original prop which might be from a store
    const adapted = JSON.parse(JSON.stringify(question)) as any;

    if (!adapted.questionTypeCode && adapted.questionType) {
        adapted.questionTypeCode = (adapted.questionType as string).toUpperCase() as QuestionTypeStrings;
        delete adapted.questionType;
    }

    // 2. Rename `difficulty` to `difficultyCode` and convert to uppercase
    if (adapted.difficulty) {
        adapted.difficultyCode = (adapted.difficulty as string).toUpperCase().replace(' ', '_');
        delete adapted.difficulty;
    }

    // 3. Consolidate metadata into a `meta` object
    const meta: NonNullable<BaseQuestion['meta']> = adapted.meta || {};
    const metaKeys: MetaKey[] = [
        'learningObjectiveCodes', 'topicCodes', 'categoryCodes',
        'subjectCodes', 'fieldCodes', 'conceptCodes', 'gradeLevelCodes'
    ];

    metaKeys.forEach(key => {
        if (Array.isArray(adapted[key])) {
            if (!meta[key]) {
                meta[key] = [];
            }
            meta[key]!.push(...adapted[key]);
            delete adapted[key];
        }
    });

    const singleKeys: SingleMetaKey[] = ['bloomLevelCode', 'contextCode', 'knowledgeDimensionCode'];
    singleKeys.forEach(key => {
        if (typeof adapted[key] === 'string' && adapted[key]) {
            meta[key] = adapted[key] as string;
            delete adapted[key];
        }
    });

    if (Object.keys(meta).length > 0) {
        adapted.meta = meta;
    }

    if (adapted.questionTypeCode === 'FILL_IN_THE_BLANKS') {
        normalizeLegacyFIB(adapted);
    } else if (adapted.questionTypeCode === 'DRAG_AND_DROP') {
        normalizeLegacyDND(adapted);
    } else if (adapted.questionTypeCode === 'MATCHING') {
        normalizeMalformedMatching(adapted);
    }

    return adapted as QuizQuestion;
}


interface QuestionRendererProps {
  question: QuizQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null;
  showCorrectAnswer?: boolean;
}

type ProgrammingQuestionUIRef = BlocklyProgrammingQuestionUIRef | ScratchProgrammingQuestionUIRef;

export const QuestionRenderer = React.forwardRef<
  ProgrammingQuestionUIRef, 
  QuestionRendererProps
>(({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer = false,
}, ref) => {
  const { t } = useTranslation();

  // Use a memoized adapter to ensure data is always in the correct, modern format.
  const adaptedQuestion = useMemo(() => adaptLegacyQuestion(question), [question]);
  
  const commonProps = {
    question: adaptedQuestion, 
    onAnswerChange, 
    userAnswer,
    showCorrectAnswer,
  };

  switch (adaptedQuestion.questionTypeCode) {
    case 'MULTIPLE_CHOICE':
      return <MultipleChoiceQuestionUI {...commonProps} question={adaptedQuestion} />;
    case 'TRUE_FALSE':
      return <TrueFalseQuestionUI {...commonProps} question={adaptedQuestion} />;
    case 'MULTIPLE_RESPONSE':
      return <MultipleResponseQuestionUI {...commonProps} question={adaptedQuestion} />;
    case 'SHORT_ANSWER':
      return <ShortAnswerQuestionUI {...commonProps} question={adaptedQuestion} />;
    case 'NUMERIC':
      return <NumericQuestionUI {...commonProps} question={adaptedQuestion} />;
    case 'FILL_IN_THE_BLANKS':
      return <FillInTheBlanksQuestionUI {...commonProps} question={adaptedQuestion} />;
    case 'SEQUENCE':
      return <SequenceQuestionUI {...commonProps} question={adaptedQuestion} />;
    case 'MATCHING':
      return <MatchingQuestionUI {...commonProps} question={adaptedQuestion} />;
    case 'DRAG_AND_DROP':
      return <DragAndDropQuestionUI {...commonProps} question={adaptedQuestion} />;
    case 'HOTSPOT':
      return <HotspotQuestionUI {...commonProps} question={adaptedQuestion} />;
    case 'BLOCKLY_PROGRAMMING':
      return <BlocklyProgrammingQuestionUI {...commonProps} question={adaptedQuestion} ref={ref as React.Ref<BlocklyProgrammingQuestionUIRef>} />;
    case 'SCRATCH_PROGRAMMING':
      return <ScratchProgrammingQuestionUI {...commonProps} question={adaptedQuestion} ref={ref as React.Ref<ScratchProgrammingQuestionUIRef>} />;
    case 'CODING':
      return <CodingQuestionUI {...commonProps} question={adaptedQuestion} />;
    default:
      return (
        <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
          <p className="font-semibold text-destructive">{t('unsupportedQuestionType')}</p>
          <p className="text-sm text-muted-foreground">
            {t('unsupportedQuestionTypeDescription')}
          </p>
          <pre className="mt-2 p-2 bg-muted rounded text-xs font-code overflow-x-auto">
            {JSON.stringify(adaptedQuestion, null, 2)}
          </pre>
        </div>
      );
  }
});

QuestionRenderer.displayName = 'QuestionRenderer';