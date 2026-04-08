// FILE: src/lib/interactive-quiz-kit/services/evaluators/drag-and-drop-evaluator.ts
// ================================================================================
// VERSION 2 - REFACTORED FOR CATEGORIZATION LOGIC

import type { DragAndDropQuestion, UserAnswerType, AnswerDetail } from '../../types';
import type { QuestionEvaluator, EvaluationResult } from './base-evaluator';

export class DragAndDropEvaluator implements QuestionEvaluator {
  public async evaluate(question: DragAndDropQuestion, answer: UserAnswerType): Promise<EvaluationResult> {
    const points = question.points ?? 0;
    
    // --- 1. Build the correct answer map from the question definition ---
    // The result is a Map where: key = dropZoneId, value = Set of correct draggableIds
    const correctAnswers = new Map<string, Set<string>>();
    const allCorrectDraggableIds = new Set<string>();
    for (const mapping of question.answerMap) {
      if (!correctAnswers.has(mapping.dropZoneId)) {
        correctAnswers.set(mapping.dropZoneId, new Set());
      }
      correctAnswers.get(mapping.dropZoneId)!.add(mapping.draggableId);
      allCorrectDraggableIds.add(mapping.draggableId);
    }

    // --- 2. Process the user's answer ---
    const userAnswers = new Map<string, Set<string>>();
    if (typeof answer === 'object' && answer !== null && !Array.isArray(answer)) {
      const userAnswerObj = answer as Record<string, string[]>;
      for (const dropZoneId in userAnswerObj) {
        if (userAnswerObj[dropZoneId].length > 0) {
          userAnswers.set(dropZoneId, new Set(userAnswerObj[dropZoneId]));
        }
      }
    }

    // --- 3. Perform the evaluation ---
    let isCorrect = true;

    // A) Check if the number of answered zones matches the number of correct zones
    if (userAnswers.size !== correctAnswers.size) {
      isCorrect = false;
    } else {
      // B) Check each zone for correctness
      for (const [dropZoneId, correctDraggableIds] of correctAnswers.entries()) {
        const userDraggableIds = userAnswers.get(dropZoneId);

        // Fail if user didn't answer for this zone, or if the number of items is wrong
        if (!userDraggableIds || userDraggableIds.size !== correctDraggableIds.size) {
          isCorrect = false;
          break;
        }

        // Fail if any item in the user's answer is not in the correct answer set
        for (const userDraggableId of userDraggableIds) {
          if (!correctDraggableIds.has(userDraggableId)) {
            isCorrect = false;
            break;
          }
        }
        
        if (!isCorrect) break;
      }
    }
    
    // C) Final check for distractors: ensure no correct item was left unplaced
    // and no distractor item was placed in a correct zone.
    // This is implicitly handled by the checks above. If a user places a distractor
    // in a correct zone, the `userDraggableIds` set will not match the `correctDraggableIds` set.
    
    // --- 4. Format the correct answer for display ---
    const formattedCorrectAnswer: Record<string, string[]> = {};
    for (const [zoneId, draggableIds] of correctAnswers.entries()) {
      const zoneLabel = question.dropZones.find(z => z.id === zoneId)?.label || zoneId;
      const draggableContents = Array.from(draggableIds).map(dId => 
        question.draggableItems.find(d => d.id === dId)?.content || dId
      );
      formattedCorrectAnswer[zoneLabel] = draggableContents;
    }

    const correctAnswerDetail: AnswerDetail = {
      id: null,
      value: formattedCorrectAnswer,
    };

    return Promise.resolve({
      isCorrect,
      correctAnswer: correctAnswerDetail,
      pointsEarned: isCorrect ? points : 0,
    });
  }
}