import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ResultIcon } from '@/components/shared/ResultIcon';
import { QuizFeedback } from '@/components/kana/QuizFeedback';
import { AudioButton } from '@/hooks/useAudio';
import { useUserStore } from '@/stores/userStore';
import { awardXp, recordReviewSession } from '@/services/progressService';
import type { SentenceExercise } from '@/data/sentenceExercises';

// ─── Helpers ─────────────────────────────────────────────────

// (kanji detection removed — readings now come from wordReadings data)

interface Tile {
  id: string;
  word: string;
  originalSlotIndex: number;
  reading?: string;
}

function isOverElement(
  ref: React.RefObject<HTMLElement | null>,
  point: { x: number; y: number }
): boolean {
  const el = ref.current;
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top - 20 && // generous top margin for easier drops
    point.y <= rect.bottom + 20
  );
}

/** Find which index a point would insert at, based on tile midpoints */
function getInsertIndex(
  ref: React.RefObject<HTMLElement | null>,
  point: { x: number; y: number }
): number {
  const el = ref.current;
  if (!el) return 0;
  const children = Array.from(el.querySelectorAll('[data-tile="true"]'));
  for (let i = 0; i < children.length; i++) {
    const rect = children[i].getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    if (point.x < midX) return i;
  }
  return children.length;
}

// ─── Main Component ──────────────────────────────────────────

interface SentenceBuilderProps {
  exercises: SentenceExercise[];
  onComplete: () => void;
}

export function SentenceBuilder({ exercises, onComplete }: SentenceBuilderProps) {
  const { user, addXp } = useUserStore();
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<Tile[]>([]);
  const [slots, setSlots] = useState<(Tile | null)[]>([]);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [draggingTile, setDraggingTile] = useState<string | null>(null);
  // The index in the answer area where a gap should appear
  const [hoverInsertIdx, setHoverInsertIdx] = useState<number | null>(null);
  // Which tile ID is being dragged from which zone
  const [dragSource, setDragSource] = useState<'bank' | 'answer' | null>(null);

  const answerRef = useRef<HTMLDivElement>(null);
  const bankRef = useRef<HTMLDivElement>(null);

  const current = exercises[index];
  const isFinished = index >= exercises.length;

  useEffect(() => {
    if (!current) return;
    const readings = current.wordReadings ?? {};
    const allWords = [...current.words, ...(current.distractors ?? [])];
    const tiles: Tile[] = allWords.map((word, i) => ({
      id: `${index}-${i}`,
      word,
      originalSlotIndex: i,
      reading: readings[word] ?? undefined,
    }));
    const shuffled = [...tiles].sort(() => Math.random() - 0.5);
    setSlots(shuffled);
    setPlaced([]);
    setResult(null);
    setHoverInsertIdx(null);
  }, [index, current]);

  // ── Continuous drag tracking ────────────────────────────────
  const handleDragMove = useCallback(
    (point: { x: number; y: number }) => {
      if (result) return;
      if (isOverElement(answerRef, point)) {
        const idx = getInsertIndex(answerRef, point);
        setHoverInsertIdx(idx);
      } else {
        setHoverInsertIdx(null);
      }
    },
    [result]
  );

  // ── Drag end: BANK → ANSWER ────────────────────────────────
  const handleBankDragEnd = useCallback(
    (
      tile: Tile,
      slotIdx: number,
      _event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ) => {
      if (result) return;
      const point = info.point;
      setHoverInsertIdx(null);

      if (isOverElement(answerRef, point)) {
        const insertIdx = getInsertIndex(answerRef, point);
        setPlaced((prev) => {
          const next = [...prev];
          next.splice(insertIdx, 0, tile);
          return next;
        });
        setSlots((prev) => {
          const next = [...prev];
          next[slotIdx] = null;
          return next;
        });
      }
    },
    [result]
  );

  // ── Drag end: ANSWER → reorder or back to bank ─────────────
  const handleAnswerDragEnd = useCallback(
    (
      tile: Tile,
      placedIdx: number,
      _event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ) => {
      if (result) return;
      const point = info.point;
      setHoverInsertIdx(null);

      if (isOverElement(bankRef, point)) {
        // Back to bank
        setPlaced((prev) => prev.filter((_, i) => i !== placedIdx));
        setSlots((prev) => {
          const next = [...prev];
          for (let i = 0; i < next.length; i++) {
            if (next[i] === null) {
              next[i] = tile;
              return next;
            }
          }
          return [...next, tile];
        });
      } else if (isOverElement(answerRef, point)) {
        // Reorder
        const insertIdx = getInsertIndex(answerRef, point);
        setPlaced((prev) => {
          const without = prev.filter((_, i) => i !== placedIdx);
          const adjusted =
            insertIdx > placedIdx ? insertIdx - 1 : insertIdx;
          const clamped = Math.min(adjusted, without.length);
          const next = [...without];
          next.splice(clamped, 0, tile);
          return next;
        });
      }
    },
    [result]
  );

  // ── Click handlers (tap fallback) ──────────────────────────
  const handleTileClick = useCallback(
    (tile: Tile, slotIdx: number) => {
      if (result) return;
      setPlaced((prev) => [...prev, tile]);
      setSlots((prev) => {
        const next = [...prev];
        next[slotIdx] = null;
        return next;
      });
    },
    [result]
  );

  const handlePlacedClick = useCallback(
    (tile: Tile, placedIdx: number) => {
      if (result) return;
      setPlaced((prev) => prev.filter((_, i) => i !== placedIdx));
      setSlots((prev) => {
        const next = [...prev];
        for (let i = 0; i < next.length; i++) {
          if (next[i] === null) {
            next[i] = tile;
            return next;
          }
        }
        return [...next, tile];
      });
    },
    [result]
  );

  const checkAnswer = useCallback(async () => {
    if (!current || result) return;
    const userSentence = placed.map((t) => t.word).join('');
    const correctSentence = current.words.join('');
    const isCorrect = userSentence === correctSentence;
    setResult(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setXpEarned((x) => x + 10);
    }
  }, [current, placed, result]);

  const advance = useCallback(() => setIndex((i) => i + 1), []);

  useEffect(() => {
    if (!isFinished || !user) return;
    async function save() {
      if (!user) return;
      const xp = correctCount * 10;
      const accuracy =
        exercises.length > 0
          ? Math.round((correctCount / exercises.length) * 100)
          : 0;
      await recordReviewSession(
        user.id,
        exercises.length,
        0,
        0,
        accuracy,
        xp
      );
      await awardXp(user.id, xp);
      addXp(xp);
    }
    save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  // ── Render ─────────────────────────────────────────────────

  if (exercises.length === 0)
    return (
      <div className="text-center py-12 text-text-secondary">
        No exercises available for this scenario.
      </div>
    );

  if (isFinished) {
    const accuracy = Math.round((correctCount / exercises.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-secondary rounded-2xl border border-border p-12 text-center"
      >
        <ResultIcon accuracy={accuracy} />
        <h3 className="text-2xl font-bold text-text-primary mb-2">
          Practice Complete!
        </h3>
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
          <div>
            <p className="text-3xl font-bold text-matcha-500">{correctCount}</p>
            <p className="text-xs text-text-secondary">Correct</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-accent">{accuracy}%</p>
            <p className="text-xs text-text-secondary">Accuracy</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gold-500">+{xpEarned}</p>
            <p className="text-xs text-text-secondary">XP</p>
          </div>
        </div>
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-accent text-white rounded-lg cursor-pointer"
        >
          Done
        </button>
      </motion.div>
    );
  }

  if (!current) return null;
  const locked = result !== null;

  // Build the answer area children with a gap spacer
  const answerChildren: React.ReactNode[] = [];
  const showGap = hoverInsertIdx !== null && draggingTile !== null;

  for (let i = 0; i <= placed.length; i++) {
    // Insert gap spacer at the hover index
    if (showGap && i === hoverInsertIdx) {
      answerChildren.push(
        <motion.div
          key="insert-gap"
          layout
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 40, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 600, damping: 35 }}
          className="h-[44px] rounded-lg border-2 border-dashed border-accent/50 bg-accent/10 shrink-0"
        />
      );
    }
    // Insert tile
    if (i < placed.length) {
      const tile = placed[i];
      answerChildren.push(
        <DraggableTile
          key={tile.id}
          tile={tile}
          zone="answer"
          locked={locked}
          resultState={result}
          isDragging={draggingTile === tile.id}
          onDragStart={() => {
            setDraggingTile(tile.id);
            setDragSource('answer');
          }}
          onDrag={(_e, info) => handleDragMove(info.point)}
          onDragEnd={(e, info) => {
            setDraggingTile(null);
            setDragSource(null);
            setHoverInsertIdx(null);
            handleAnswerDragEnd(tile, i, e, info);
          }}
          onClick={() => handlePlacedClick(tile, i)}
        />
      );
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="bg-bg-secondary rounded-2xl border border-border p-8 pb-24 select-none"
        >
          {/* Progress */}
          <div className="flex items-center gap-3 mb-6 max-w-xs mx-auto">
            <div className="flex-1 h-2 bg-bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{
                  width: `${((index + 1) / exercises.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs text-text-secondary">
              {index + 1}/{exercises.length}
            </span>
          </div>

          {/* Scenario + prompt */}
          <div className="text-center mb-6">
            {current.scenario && (
              <p className="text-xs text-text-tertiary mb-2">{current.scenario}</p>
            )}
            <p className="text-lg font-semibold text-text-primary">
              {current.prompt}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {current.english}
            </p>
          </div>

          {/* ── ANSWER AREA ── */}
          <div
            ref={answerRef}
            className={cn(
              'min-h-[68px] flex flex-wrap gap-2 items-center justify-center p-3 rounded-xl border-2 mb-5 transition-colors duration-200',
              draggingTile && dragSource === 'bank'
                ? 'border-accent/60 bg-accent/5 border-solid'
                : 'border-dashed border-border bg-bg-primary'
            )}
          >
            {placed.length === 0 && !draggingTile && (
              <span className="text-sm text-text-secondary/40 py-3">
                Tap or drag words to build the sentence
              </span>
            )}
            <AnimatePresence mode="popLayout">
              {answerChildren}
            </AnimatePresence>
          </div>

          {/* ── WORD BANK ── */}
          <div
            ref={bankRef}
            className={cn(
              'flex flex-wrap gap-2 justify-center mb-6 p-2 rounded-xl min-h-[48px] transition-colors duration-200',
              draggingTile && dragSource === 'answer'
                ? 'bg-bg-muted/60 border border-dashed border-border'
                : ''
            )}
          >
            {slots.map((tile, slotIdx) => (
              <div key={`slot-${slotIdx}`}>
                {tile ? (
                  <DraggableTile
                    tile={tile}
                    zone="bank"
                    locked={locked}
                    resultState={null}
                    isDragging={draggingTile === tile.id}
                    onDragStart={() => {
                      setDraggingTile(tile.id);
                      setDragSource('bank');
                    }}
                    onDrag={(_e, info) => handleDragMove(info.point)}
                    onDragEnd={(e, info) => {
                      setDraggingTile(null);
                      setDragSource(null);
                      setHoverInsertIdx(null);
                      handleBankDragEnd(tile, slotIdx, e, info);
                    }}
                    onClick={() => handleTileClick(tile, slotIdx)}
                  />
                ) : (
                  <div className="px-3 py-2 rounded-lg border-2 border-dashed border-border/30 min-w-[44px] h-[44px]" />
                )}
              </div>
            ))}
          </div>

          {/* Check */}
          {!locked && placed.length > 0 && (
            <div className="text-center">
              <button
                onClick={checkAnswer}
                className="px-8 py-2.5 bg-accent text-white rounded-xl font-medium cursor-pointer"
              >
                Check
              </button>
            </div>
          )}

          {result === 'incorrect' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-text-secondary mt-3"
            >
              <div className="flex items-center justify-center gap-2">
                <span>Correct: <strong className="text-text-primary jp-text">{current.japanese}</strong></span>
                <AudioButton text={current.japanese} showSlow />
              </div>
              <span className="block text-xs text-text-secondary/60 mt-0.5 jp-text">
                {current.reading}
              </span>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {result && (
        <QuizFeedback
          isVisible={result !== null}
          isCorrect={result === 'correct'}
          correctAnswer={current.japanese}
          onContinue={advance}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Draggable Tile
// ─────────────────────────────────────────────────────────────

function DraggableTile({
  tile,
  zone,
  locked,
  resultState,
  isDragging,
  onDragStart,
  onDrag,
  onDragEnd,
  onClick,
}: {
  tile: Tile;
  zone: 'bank' | 'answer';
  locked: boolean;
  resultState: 'correct' | 'incorrect' | null;
  isDragging: boolean;
  onDragStart: () => void;
  onDrag: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => void;
  onDragEnd: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => void;
  onClick: () => void;
}) {
  const isAnswer = zone === 'answer';
  const didDrag = useRef(false);

  return (
    <motion.div
      data-tile="true"
      layout
      layoutId={`tile-${tile.id}`}
      drag={!locked}
      dragSnapToOrigin
      dragElastic={0.08}
      dragMomentum={false}
      onDragStart={() => {
        didDrag.current = true;
        onDragStart();
      }}
      onDrag={onDrag}
      onDragEnd={(e, info) => {
        onDragEnd(e, info);
        // Reset after a tick so the click handler can check
        setTimeout(() => {
          didDrag.current = false;
        }, 50);
      }}
      onClick={(e) => {
        if (!didDrag.current) onClick();
        e.stopPropagation();
      }}
      whileHover={locked ? {} : { scale: 1.06, y: -2 }}
      whileTap={locked ? {} : { scale: 0.96 }}
      whileDrag={{
        scale: 1.12,
        zIndex: 50,
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        cursor: 'grabbing',
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'px-3 py-1.5 rounded-lg font-medium jp-text select-none touch-none flex flex-col items-center min-w-[44px]',
        locked ? '' : 'cursor-grab active:cursor-grabbing',
        isAnswer &&
          resultState === 'correct' &&
          'bg-[var(--color-feedback-success-bg)] text-[var(--color-feedback-success-text)]',
        isAnswer &&
          resultState === 'incorrect' &&
          'bg-[var(--color-feedback-error-bg)] text-[var(--color-feedback-error-text)]',
        isAnswer && !resultState && 'bg-accent/10 text-accent',
        !isAnswer &&
          'bg-bg-primary border border-border text-text-primary hover:border-accent hover:bg-accent/5',
        isDragging && 'opacity-40'
      )}
    >
      {tile.reading && (
        <span className="text-[9px] opacity-60 leading-tight pointer-events-none">
          {tile.reading}
        </span>
      )}
      <span className="text-base leading-tight pointer-events-none">
        {tile.word}
      </span>
    </motion.div>
  );
}
