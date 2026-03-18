import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ConfettiEffect } from '@/components/kana/ConfettiEffect';
import type { StudyModeProps } from './types';

interface MatchTile {
  id: string;
  /** Which study item this tile belongs to */
  itemId: string;
  /** 'term' or 'definition' side */
  side: 'term' | 'definition';
  /** Text displayed on the tile */
  text: string;
  /** Whether this tile has been matched */
  matched: boolean;
}

/**
 * Quizlet-style Match game.
 * Shows a grid of face-up tiles — half terms, half definitions.
 * Tap pairs to match. Timer counts up. Celebration on completion.
 */
export function MatchMode({ items, onBack }: StudyModeProps) {
  const [tiles, setTiles] = useState<MatchTile[]>([]);
  const [selected, setSelected] = useState<string | null>(null); // tile id
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Initialize game
  const startGame = useCallback(() => {
    // Pick 6 random items (or fewer if less available)
    const count = Math.min(6, items.length);
    const selected = [...items].sort(() => Math.random() - 0.5).slice(0, count);

    const newTiles: MatchTile[] = [];
    for (const item of selected) {
      newTiles.push({
        id: `term-${item.id}`,
        itemId: item.id,
        side: 'term',
        text: item.term,
        matched: false,
      });
      newTiles.push({
        id: `def-${item.id}`,
        itemId: item.id,
        side: 'definition',
        text: item.definition,
        matched: false,
      });
    }

    setTiles(newTiles.sort(() => Math.random() - 0.5));
    setSelected(null);
    setWrongPair(null);
    setMatchedCount(0);
    setTotalPairs(count);
    setTimer(0);
    setIsRunning(true);
    setIsComplete(false);
    setAttempts(0);
  }, [items]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  // Timer
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 10); // 10ms increments
      }, 10);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${seconds}.${centis.toString().padStart(2, '0')}`;
  };

  const handleTileClick = useCallback((tileId: string) => {
    if (isComplete) return;

    const clickedTile = tiles.find((t) => t.id === tileId);
    if (!clickedTile || clickedTile.matched) return;

    // Clear wrong pair highlight
    if (wrongPair) {
      setWrongPair(null);
    }

    if (!selected) {
      // First selection
      setSelected(tileId);
    } else if (selected === tileId) {
      // Deselect
      setSelected(null);
    } else {
      // Second selection — check match
      const firstTile = tiles.find((t) => t.id === selected);
      if (!firstTile) return;

      setAttempts((a) => a + 1);

      if (firstTile.itemId === clickedTile.itemId && firstTile.side !== clickedTile.side) {
        // Match!
        setTiles((prev) =>
          prev.map((t) =>
            t.itemId === clickedTile.itemId ? { ...t, matched: true } : t
          )
        );
        const newMatched = matchedCount + 1;
        setMatchedCount(newMatched);

        if (newMatched === totalPairs) {
          setIsRunning(false);
          setIsComplete(true);
          if (!bestTime || timer < bestTime) {
            setBestTime(timer);
          }
        }
      } else {
        // No match — flash red
        setWrongPair([selected, tileId]);
        setTimeout(() => setWrongPair(null), 600);
      }

      setSelected(null);
    }
  }, [selected, tiles, matchedCount, totalPairs, isComplete, wrongPair, timer, bestTime]);

  // ── Completion Screen ──
  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-secondary rounded-2xl border border-border p-10 text-center"
      >
        <ConfettiEffect trigger={true} />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          className="w-20 h-20 rounded-full bg-matcha-500/15 flex items-center justify-center mx-auto mb-4"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-matcha-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </motion.div>

        <h3 className="text-2xl font-bold text-text-primary mb-1">Matched!</h3>
        <p className="text-sm text-text-secondary mb-6">All pairs found</p>

        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
          <div>
            <p className="text-3xl font-bold text-accent tabular-nums">{formatTime(timer)}s</p>
            <p className="text-xs text-text-secondary">Time</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-matcha-500">{totalPairs}</p>
            <p className="text-xs text-text-secondary">Pairs</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gold-500">{attempts}</p>
            <p className="text-xs text-text-secondary">Attempts</p>
          </div>
        </div>

        {bestTime !== null && (
          <p className="text-xs text-text-tertiary mb-4">
            Best time: {formatTime(bestTime)}s
          </p>
        )}

        <div className="flex gap-3 justify-center">
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-2.5 bg-bg-muted text-text-primary rounded-xl font-medium cursor-pointer"
            >
              Done
            </button>
          )}
          <button
            onClick={startGame}
            className="px-6 py-2.5 bg-accent text-white rounded-xl font-medium cursor-pointer"
          >
            Play Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="text-xs text-text-secondary hover:text-text-primary cursor-pointer">
              Back
            </button>
          )}
          <span className="text-sm font-semibold text-text-primary tabular-nums">
            {formatTime(timer)}s
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">
            {matchedCount}/{totalPairs} matched
          </span>
          <button
            onClick={startGame}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-bg-secondary border border-border text-text-secondary hover:text-text-primary cursor-pointer"
          >
            Restart
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          animate={{ width: `${(matchedCount / totalPairs) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Tile Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        <AnimatePresence>
          {tiles.map((tile) => {
            if (tile.matched) {
              return (
                <motion.div
                  key={tile.id}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeIn' }}
                  className="h-24 rounded-xl"
                />
              );
            }

            const isSelected = selected === tile.id;
            const isWrong = wrongPair?.includes(tile.id);

            return (
              <motion.button
                key={tile.id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isWrong ? [1, 0.95, 1.02, 0.98, 1] : 1,
                  opacity: 1,
                  x: isWrong ? [0, -4, 4, -3, 3, 0] : 0,
                }}
                transition={isWrong ? { duration: 0.4 } : { duration: 0.2 }}
                onClick={() => handleTileClick(tile.id)}
                className={cn(
                  'h-24 rounded-xl border-2 flex flex-col items-center justify-center p-2 cursor-pointer transition-colors',
                  tile.side === 'term' ? 'jp-text' : '',
                  isSelected && 'border-accent bg-accent/10 shadow-md',
                  isWrong && 'border-sakura-500 bg-[var(--color-feedback-error-bg)]',
                  !isSelected && !isWrong && 'border-border bg-bg-secondary hover:border-accent/40 hover:shadow-sm'
                )}
              >
                <span className={cn(
                  'text-sm font-semibold text-center leading-tight',
                  isSelected ? 'text-accent' : 'text-text-primary',
                  isWrong && 'text-sakura-600'
                )}>
                  {tile.text}
                </span>
                <span className={cn(
                  'text-[9px] mt-1',
                  tile.side === 'term' ? 'text-accent/40' : 'text-text-tertiary'
                )}>
                  {tile.side === 'term' ? 'term' : 'definition'}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
