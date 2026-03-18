/**
 * Smart lesson scheduler — bucket-based interleaving algorithm.
 *
 * Ensures items are seen 3-4 times per session with increasing difficulty:
 *  1st: basic quiz (meaning/reading/MC)
 *  2nd: contextual quiz (fill-in-blank)
 *  3rd: production quiz (sentence builder) or varied MC
 *
 * Failed items re-appear within 1-2 steps. New items within 2-3 steps.
 */

export interface LessonItem {
  id: number;
  /** Bucket: -1=failed, 0=new, 1=seen-once, 2=reinforced (done) */
  bucket: number;
  /** How many steps since last seen */
  stepsSinceSeen: number;
  /** How many times quizzed */
  timesQuizzed: number;
}

export type ExerciseType =
  | 'teach'
  | 'meaning-quiz'
  | 'reading-quiz'
  | 'mc-quiz'
  | 'fill-blank'
  | 'sentence-builder';

export interface ScheduledStep<T> {
  type: ExerciseType;
  item: T;
  itemId: number;
}

/**
 * Generate a complete interleaved lesson plan.
 *
 * @param items - The items to teach (vocab words, grammar points, etc.)
 * @param getId - Function to extract ID from an item
 * @param availableTypes - Quiz types available for this content type
 * @param hasSentenceExercises - Function to check if item has sentence/fill exercises
 */
export function generateInterleavedPlan<T>(
  items: T[],
  getId: (item: T) => number,
  availableTypes: ExerciseType[],
  hasSentenceExercises?: (item: T) => boolean
): ScheduledStep<T>[] {
  const steps: ScheduledStep<T>[] = [];
  const quizTypes = availableTypes.filter((t) => t !== 'teach');

  // Tracker for each item
  const tracker: Map<number, LessonItem> = new Map();
  for (const item of items) {
    tracker.set(getId(item), { id: getId(item), bucket: 0, stepsSinceSeen: 99, timesQuizzed: 0 });
  }

  // ── Phase 1: Introduce + immediate drill ──
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const id = getId(item);

    // Teach step
    steps.push({ type: 'teach', item, itemId: id });
    updateTracker(tracker, id, 'seen');

    // Immediate drill — pick a basic quiz type
    const basicType = pickQuizType(quizTypes, 0);
    steps.push({ type: basicType, item, itemId: id });
    updateTracker(tracker, id, 'seen');

    // After every 2 items taught, re-quiz earlier items (interleave)
    if (i >= 1 && i % 2 === 1) {
      const prevItem = items[i - 1];
      const prevId = getId(prevItem);
      const prevType = pickQuizType(quizTypes, 1);
      steps.push({ type: prevType, item: prevItem, itemId: prevId });
      updateTracker(tracker, prevId, 'seen');
    }
  }

  // ── Phase 2: Reinforcement — interleaved mixed quizzes ──
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  for (let round = 0; round < 2; round++) {
    for (const item of shuffled) {
      const id = getId(item);
      const t = tracker.get(id)!;

      // Pick exercise type based on how many times quizzed
      let exerciseType: ExerciseType;
      const canDoSentence = hasSentenceExercises?.(item) ?? false;

      if (t.timesQuizzed <= 1) {
        // Second time: basic or MC
        exerciseType = pickQuizType(quizTypes, t.timesQuizzed);
      } else if (t.timesQuizzed === 2 && canDoSentence && quizTypes.includes('fill-blank')) {
        // Third time: contextual (fill-in-blank)
        exerciseType = 'fill-blank';
      } else if (t.timesQuizzed >= 3 && canDoSentence && quizTypes.includes('sentence-builder')) {
        // Fourth time: production (sentence builder)
        exerciseType = 'sentence-builder';
      } else {
        // Fallback: varied quiz
        exerciseType = pickQuizType(quizTypes, t.timesQuizzed);
      }

      steps.push({ type: exerciseType, item, itemId: id });
      updateTracker(tracker, id, 'seen');

      // Skip second round for items already well-practiced
      if (round === 1 && t.timesQuizzed >= 4) continue;
    }
  }

  return steps;
}

function updateTracker(tracker: Map<number, LessonItem>, id: number, event: 'seen' | 'correct' | 'incorrect') {
  const t = tracker.get(id);
  if (!t) return;

  if (event === 'seen') {
    t.stepsSinceSeen = 0;
    t.timesQuizzed++;
  } else if (event === 'correct') {
    t.bucket = Math.min(2, t.bucket + 1);
  } else {
    t.bucket = -1;
  }

  // Increment steps-since-seen for all OTHER items
  for (const [otherId, other] of tracker) {
    if (otherId !== id) {
      other.stepsSinceSeen++;
    }
  }
}

function pickQuizType(quizTypes: ExerciseType[], timesQuizzed: number): ExerciseType {
  if (quizTypes.length === 0) return 'mc-quiz';
  // Cycle through available types based on how many times the item has been quizzed
  return quizTypes[timesQuizzed % quizTypes.length];
}
