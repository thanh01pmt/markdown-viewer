// packages/interactive-quiz-kit/src/react-ui/components/ui/DragAndDropQuestionUI.tsx

'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { DragAndDropQuestion, DraggableItem as DraggableItemType, UserAnswerType } from '../../../types'; // Giả sử types giống component cũ
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DropAnimation,
  defaultDropAnimation,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { createPortal } from 'react-dom';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../elements/card';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { cn } from '../../../utils/utils';
import { GripVertical, Undo, RotateCcw } from 'lucide-react';
import { Button } from '../elements/button'; // Giả sử có Button từ shadcn/ui

function shouldHandleEvent(element: HTMLElement | null) {
  let cur = element;
  while (cur) {
    if (cur.dataset && cur.dataset.noDnd) {
      return false;
    }
    cur = cur.parentElement;
  }
  return true;
}

const DraggableItemView = React.forwardRef<HTMLDivElement, any>(({
  item,
  isOverlay,
  showCorrectAnswer,
  ariaLabel,
  style,
  attributes,
  listeners
}: any, ref) => {
  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        "bg-background p-3 border rounded-lg flex items-center gap-3 cursor-grab active:cursor-grabbing select-none",
        "shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-ring",
        isOverlay && "shadow-2xl rotate-3 scale-105",
        showCorrectAnswer && "cursor-default opacity-80"
      )}
      role="button"
      aria-label={ariaLabel || `Draggable item: ${item.content}`}
      tabIndex={showCorrectAnswer ? -1 : 0}
      {...(showCorrectAnswer ? {} : { ...attributes, ...listeners })}
    >
      {!showCorrectAnswer && <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
      <div className="flex-1 pointer-events-none">
        <MarkdownRenderer content={item.content} />
      </div>
    </div>
  );
});
DraggableItemView.displayName = 'DraggableItemView';

// Draggable Item với accessibility cải thiện
const DraggableItem = ({
  item,
  showCorrectAnswer,
  ariaLabel
}: {
  item: DraggableItemType,
  showCorrectAnswer?: boolean,
  ariaLabel?: string
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: showCorrectAnswer,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <DraggableItemView
      ref={setNodeRef}
      item={item}
      showCorrectAnswer={showCorrectAnswer}
      ariaLabel={ariaLabel}
      style={style}
      attributes={attributes}
      listeners={listeners}
    />
  );
};

const DragOverlayItem = ({ item }: { item: DraggableItemType }) => {
  return <DraggableItemView item={item} isOverlay={true} />;
};

// Droppable Zone với feedback và accessibility
const DroppableZone = ({
  id,
  label,
  items,
  showCorrectAnswer,
  correctItemsSet,
  userItemsSet,
  isBank = false,
  onHover = false,
}: {
  id: string;
  label: string;
  items: DraggableItemType[];
  showCorrectAnswer: boolean;
  correctItemsSet?: Set<string>;
  userItemsSet?: Set<string>;
  isBank?: boolean;
  onHover?: boolean;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  let borderColor = 'border-muted';
  let bgColor = 'bg-muted/20';

  if (showCorrectAnswer && !isBank) {
    const isCorrect = correctItemsSet && userItemsSet &&
      correctItemsSet.size === userItemsSet.size &&
      [...correctItemsSet].every(id => userItemsSet.has(id));
    borderColor = isCorrect ? 'border-green-500' : 'border-destructive';
    bgColor = isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';
  } else if (isOver && !showCorrectAnswer) {
    borderColor = 'border-primary';
    bgColor = 'bg-primary/10';
  }

  const safeItems = items || [];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-4 border-2 border-dashed rounded-xl min-h-[140px] transition-all",
        borderColor,
        bgColor
      )}
      role="region"
      aria-label={`Drop zone: ${label || 'Item bank'}`}
    >
      {label && (
        <h3 className="font-semibold mb-3 text-center text-sm">
          <MarkdownRenderer content={label} />
        </h3>
      )}
      <SortableContext items={safeItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {safeItems.map(item => (
            <DraggableItem
              key={item.id}
              item={item}
              showCorrectAnswer={showCorrectAnswer}
              ariaLabel={`Item ${item.content} in ${label || 'bank'}`}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

// Main Component
const UNASSIGNED_CONTAINER_ID = 'unassigned_items_bank';

const dropAnimation: DropAnimation = {
  ...defaultDropAnimation,
};

interface DragAndDropQuestionUIProps {
  question: DragAndDropQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null;
  showCorrectAnswer?: boolean;
}

export const DragAndDropQuestionUI: React.FC<DragAndDropQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer = false,
}) => {
  const { t } = useTranslation();
  
  const { prompt, draggableItems, dropZones, points, explanation, answerMap } = question;

  const isValidPayload = Array.isArray(draggableItems) && Array.isArray(dropZones);

  const [containers, setContainers] = useState<Record<string, string[]>>(() => {
    if (!isValidPayload) return {};
    return {
      [UNASSIGNED_CONTAINER_ID]: draggableItems.map(i => i.id),
      ...dropZones.reduce((acc, zone) => ({ ...acc, [zone.id]: [] }), {}),
    };
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, string[]>[]>([]); // Để undo

  // Sensors: Sử dụng delay thay vì distance để tránh offset khi drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event, { currentCoordinates }) => {
        // Hỗ trợ arrow keys cho sắp xếp
        return currentCoordinates;
      },
    })
  );

  const resetContainers = useCallback(() => {
    const initial = {
      [UNASSIGNED_CONTAINER_ID]: draggableItems.map(i => i.id),
      ...dropZones.reduce((acc, zone) => ({ ...acc, [zone.id]: [] }), {}),
    };
    setContainers(initial);
    setHistory([]);
    onAnswerChange(null);
  }, [draggableItems, dropZones, onAnswerChange]);

  // Khởi tạo từ userAnswer
  useEffect(() => {
    if (!userAnswer || typeof userAnswer !== 'object' || Array.isArray(userAnswer) || Object.keys(userAnswer).length === 0) {
      const initial = {
        [UNASSIGNED_CONTAINER_ID]: draggableItems.map(i => i.id),
        ...dropZones.reduce((acc, zone) => ({ ...acc, [zone.id]: [] }), {}),
      };
      setContainers(initial);
      setHistory([]);
      return;
    }

    const userAnswerObj = userAnswer as Record<string, string[]>;
    const assigned = new Set<string>();

    const newContainers: Record<string, string[]> = {
      ...dropZones.reduce((acc, zone) => ({ ...acc, [zone.id]: [] }), {}),
      [UNASSIGNED_CONTAINER_ID]: [],
    };

    Object.entries(userAnswerObj).forEach(([zoneId, itemIds]) => {
      if (newContainers[zoneId] !== undefined) {
        newContainers[zoneId] = itemIds;
        itemIds.forEach(id => assigned.add(id));
      }
    });

    newContainers[UNASSIGNED_CONTAINER_ID] = draggableItems
      .map(i => i.id)
      .filter(id => !assigned.has(id));

    setContainers(newContainers);
    // Remove history reset here to allow Undo to work
  }, [userAnswer, draggableItems, dropZones]);

  const findContainer = useCallback((id: string): string | undefined => {
    return Object.keys(containers).find(key => containers[key].includes(id));
  }, [containers]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const emitAnswerChange = useCallback((currentContainers: Record<string, string[]>) => {
    const userAnswerToEmit: Record<string, string[]> = {};
    let hasAnswer = false;

    dropZones.forEach(zone => {
      const items = currentContainers[zone.id];
      if (items && items.length > 0) {
        userAnswerToEmit[zone.id] = items;
        hasAnswer = true;
      }
    });

    onAnswerChange(hasAnswer ? userAnswerToEmit : null);
  }, [dropZones, onAnswerChange]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    const activeContainer = findContainer(activeIdStr);
    if (!activeContainer) return;

    let overContainer = findContainer(overIdStr);
    if (!overContainer) {
      if (containers[overIdStr] !== undefined) {
        overContainer = overIdStr;
      } else {
        return;
      }
    }

    // Lưu history trước thay đổi
    setHistory(prev => [...prev, { ...containers }]);

    if (activeContainer === overContainer) {
      if (findContainer(overIdStr)) {
        const oldIndex = containers[activeContainer].indexOf(activeIdStr);
        const newIndex = containers[overContainer].indexOf(overIdStr);

        const newContainers = {
          ...containers,
          [activeContainer]: arrayMove(containers[activeContainer], oldIndex, newIndex),
        };

        setContainers(newContainers);
        emitAnswerChange(newContainers);
      }
    } else {
      const newContainers = { ...containers };
      const activeItems = [...newContainers[activeContainer]];
      const overItems = [...newContainers[overContainer]];

      const activeIndex = activeItems.indexOf(activeIdStr);
      activeItems.splice(activeIndex, 1);

      const overIndex = overItems.indexOf(overIdStr);
      const newIndex = overIndex >= 0 ? overIndex : overItems.length;

      overItems.splice(newIndex, 0, activeIdStr);

      newContainers[activeContainer] = activeItems;
      newContainers[overContainer] = overItems;

      setContainers(newContainers);
      emitAnswerChange(newContainers);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prevState = history[history.length - 1];
      setContainers(prevState);
      setHistory(prev => prev.slice(0, -1));

      const userAnswerToEmit: Record<string, string[]> = {};
      let hasAnswer = false;

      dropZones.forEach(zone => {
        const items = prevState[zone.id];
        if (items && items.length > 0) {
          userAnswerToEmit[zone.id] = items;
          hasAnswer = true;
        }
      });

      onAnswerChange(hasAnswer ? userAnswerToEmit : null);
    }
  };

  const activeItem = useMemo(
    () => draggableItems.find(i => i.id === activeId),
    [activeId, draggableItems]
  );

  const correctAnswersMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    answerMap.forEach(({ dropZoneId, draggableId }) => {
      if (!map.has(dropZoneId)) map.set(dropZoneId, new Set());
      map.get(dropZoneId)!.add(draggableId);
    });
    return map;
  }, [answerMap]);

  if (!isValidPayload) {
    return (
      <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
        <p className="font-semibold text-destructive">{t('invalidQuestionPayload', 'Invalid question payload')}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t('invalidDragAndDropDescription', 'This drag and drop question is missing required draggable items or drop zones.')}
        </p>
      </div>
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
        <div style={{ touchAction: 'none' }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dropZones.map(zone => (
                  <DroppableZone
                    key={zone.id}
                    id={zone.id}
                    label={zone.label}
                    items={
                      containers[zone.id]?.map(id =>
                        draggableItems.find(i => i.id === id)
                      ).filter(Boolean) as DraggableItemType[]
                    }
                    showCorrectAnswer={showCorrectAnswer}
                    correctItemsSet={correctAnswersMap.get(zone.id)}
                    userItemsSet={new Set(containers[zone.id] || [])}
                  />
                ))}
              </div>

              <div className="md:col-span-1">
                <h3 className="font-semibold text-center mb-3 text-lg">Items to classify and sort</h3>
                <DroppableZone
                  id={UNASSIGNED_CONTAINER_ID}
                  label=""
                  isBank
                  items={
                    containers[UNASSIGNED_CONTAINER_ID]?.map(id =>
                      draggableItems.find(i => i.id === id)
                    ).filter(Boolean) as DraggableItemType[]
                  }
                  showCorrectAnswer={showCorrectAnswer}
                />
              </div>
            </div>

            {typeof document !== 'undefined' &&
              createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                  {activeItem ? <DragOverlayItem item={activeItem} /> : null}
                </DragOverlay>,
                document.body
              )}
          </DndContext>
        </div>
        {!showCorrectAnswer && (
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={handleUndo} disabled={history.length === 0}>
              <Undo className="h-4 w-4 mr-2" /> Undo
            </Button>
            <Button variant="outline" onClick={resetContainers}>
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </div>
        )}

        {showCorrectAnswer && explanation && (
          <div className="mt-6 p-4 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300">
            <strong className="font-semibold text-amber-900 dark:text-amber-200">Explanation:</strong>
            <MarkdownRenderer content={explanation} className="text-sm mt-1 text-amber-800 dark:text-amber-300" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};