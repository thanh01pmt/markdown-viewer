// packages/interactive-quiz-kit/src/services/PointAllocationService.ts

import type { QuizQuestion } from '../types';
import type { StandardDifficulty } from '../types/misc';

type Difficulty = StandardDifficulty;

const DIFFICULTY_WEIGHTS: Record<Difficulty, number> = {
  'VERY_EASY': 1,
  'EASY': 2,
  'MEDIUM': 3,
  'HARD': 4,
  'VERY_HARD': 5,
};

/**
 * A headless service to dynamically allocate points to questions based on their difficultyCode,
 * ensuring the total points sum up to a specific target (usually 100).
 */
export class PointAllocationService {
  /**
   * Allocates points to a list of questions based on their difficulty.
   * This method ensures that the sum of all question points equals the totalPoints specified.
   * It uses the Largest Remainder Method to handle rounding issues and distribute points fairly.
   *
   * @param questions - An array of QuizQuestion objects. Each question must have a `difficultyCode` property.
   * @param totalPoints - The total number of points the entire quiz should be worth. Defaults to 100.
   * @returns A new array of QuizQuestion objects with the `points` property updated.
   */
  public static allocatePoints(
    questions: QuizQuestion[],
    totalPoints: number = 100
  ): QuizQuestion[] {
    if (!questions || questions.length === 0) {
      return [];
    }

    // 1. Calculate total weight
    const totalWeight = questions.reduce((sum, q) => {
      const difficulty = q.difficultyCode || 'MEDIUM'; // Default to Medium if not set
      return sum + (DIFFICULTY_WEIGHTS[difficulty as Difficulty] || DIFFICULTY_WEIGHTS.MEDIUM);
    }, 0);

    if (totalWeight === 0) {
      // If all questions have unknown difficulty or weights are zero, distribute evenly
      const pointsPerQuestion = Math.floor(totalPoints / questions.length);
      const remainder = totalPoints % questions.length;
      return questions.map((q, index) => ({
        ...q,
        points: pointsPerQuestion + (index < remainder ? 1 : 0),
      }));
    }

    // 2. Calculate initial points with decimals and their remainders
    const questionsWithRemainders = questions.map((q, index) => {
      const difficulty = q.difficultyCode || 'MEDIUM';
      const weight = DIFFICULTY_WEIGHTS[difficulty as Difficulty] || DIFFICULTY_WEIGHTS.MEDIUM;
      const exactPoints = (weight / totalWeight) * totalPoints;
      const basePoints = Math.floor(exactPoints);
      const remainder = exactPoints - basePoints;
      return { index, basePoints, remainder };
    });

    // 3. Calculate the sum of base points
    const sumOfBasePoints = questionsWithRemainders.reduce(
      (sum, item) => sum + item.basePoints,
      0
    );

    // 4. Determine how many points are left to distribute
    let pointsToDistribute = totalPoints - sumOfBasePoints;

    // 5. Sort questions by their remainder in descending order
    questionsWithRemainders.sort((a, b) => b.remainder - a.remainder);

    // 6. Distribute the remaining points to the questions with the largest remainders
    const finalPoints = new Array(questions.length);
    questionsWithRemainders.forEach(item => {
        finalPoints[item.index] = item.basePoints;
        if (pointsToDistribute > 0) {
            finalPoints[item.index]++;
            pointsToDistribute--;
        }
    });

    // 7. Create the new array of questions with updated points
    const updatedQuestions = questions.map((q, index) => ({
      ...q,
      points: finalPoints[index],
    }));

    return updatedQuestions;
  }
}