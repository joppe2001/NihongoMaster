import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StrokeAnimation } from './StrokeAnimation';
import { getStrokeData } from '@/data/strokeData';

interface KanaItem {
  id: number;
  character: string;
  romaji: string;
  row_group: string;
  stroke_count: number;
}

interface KanaStudyCardProps {
  kana: KanaItem;
  allKana: KanaItem[];
  onSelect: (k: KanaItem) => void;
}

export function KanaStudyCard({ kana, allKana, onSelect }: KanaStudyCardProps) {
  // Track index internally to avoid stale-closure issues
  const [currentIdx, setCurrentIdx] = useState(() =>
    allKana.findIndex((k) => k.id === kana.id)
  );
  const [direction, setDirection] = useState(0);
  // Monotonic counter to guarantee AnimatePresence key always changes
  const [renderKey, setRenderKey] = useState(0);

  // Sync index if parent changes kana externally (e.g. clicking grid)
  useEffect(() => {
    const idx = allKana.findIndex((k) => k.id === kana.id);
    if (idx !== currentIdx) {
      setCurrentIdx(idx);
      setRenderKey((k) => k + 1);
    }
  }, [kana.id, allKana, currentIdx]);

  const currentKana = allKana[currentIdx] ?? kana;
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < allKana.length - 1;
  const hasStrokeData = getStrokeData(currentKana.character) !== null;

  const goNext = useCallback(() => {
    if (currentIdx >= allKana.length - 1) return;
    const nextIdx = currentIdx + 1;
    setDirection(1);
    setCurrentIdx(nextIdx);
    setRenderKey((k) => k + 1);
    onSelect(allKana[nextIdx]);
  }, [currentIdx, allKana, onSelect]);

  const goPrev = useCallback(() => {
    if (currentIdx <= 0) return;
    const prevIdx = currentIdx - 1;
    setDirection(-1);
    setCurrentIdx(prevIdx);
    setRenderKey((k) => k + 1);
    onSelect(allKana[prevIdx]);
  }, [currentIdx, allKana, onSelect]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : dir < 0 ? -120 : 0,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -120 : dir < 0 ? 120 : 0,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={renderKey}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.8 }}
          className="bg-bg-secondary rounded-2xl border border-border p-12 text-center"
        >
          {/* Stroke animation or static character */}
          {hasStrokeData ? (
            <div className="flex justify-center mb-4">
              <StrokeAnimation
                character={currentKana.character}
                size={220}
                speed={0.7}
                loop={true}
              />
            </div>
          ) : (
            <span className="text-[120px] character-display text-text-primary leading-none inline-block">
              {currentKana.character}
            </span>
          )}

          <p className="text-4xl font-bold text-accent mt-4">
            {currentKana.romaji}
          </p>

          <p className="text-sm text-text-secondary mt-2">
            {currentKana.stroke_count} stroke{currentKana.stroke_count !== 1 ? 's' : ''}
          </p>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={goPrev}
              disabled={!hasPrev}
              className="px-6 py-2 rounded-lg bg-bg-muted text-text-primary disabled:opacity-30 cursor-pointer hover:bg-bg-subtle transition-colors"
            >
              Previous
            </button>
            <button
              onClick={goNext}
              disabled={!hasNext}
              className="px-6 py-2 rounded-lg bg-accent text-white disabled:opacity-30 cursor-pointer hover:opacity-90 transition-opacity"
            >
              Next
            </button>
          </div>

          <p className="text-xs text-text-secondary mt-4">
            {currentIdx + 1} / {allKana.length}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
