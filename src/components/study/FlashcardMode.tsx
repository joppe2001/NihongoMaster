import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Star, ChevronLeft, ChevronRight, Eye, EyeOff } from '@/lib/icons';
import { useStarredStore } from '@/stores/starredStore';
import { AudioButton } from '@/hooks/useAudio';
import type { StudyModeProps, ContentType } from './types';

export function FlashcardMode({ items, onBack }: StudyModeProps) {
  // Infer content type from first item (all items in a session share the same type)
  const contentType: ContentType = items[0]?.contentType ?? 'vocab';
  const { toggleStar: storeToggle, isStarred: storeIsStarred, getStarredSet } = useStarredStore();

  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [deck, setDeck] = useState(items);
  const [direction, setDirection] = useState(0); // -1 left, 1 right
  const [showTermFirst, setShowTermFirst] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  // Shuffle/unshuffle
  useEffect(() => {
    if (isShuffled) {
      setDeck([...items].sort(() => Math.random() - 0.5));
    } else {
      setDeck(items);
    }
    setIndex(0);
    setIsFlipped(false);
  }, [isShuffled, items]);

  const current = deck[index];

  const goNext = useCallback(() => {
    if (index < deck.length - 1) {
      setDirection(1);
      setIndex((i) => i + 1);
      setIsFlipped(false);
    }
  }, [index, deck.length]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setDirection(-1);
      setIndex((i) => i - 1);
      setIsFlipped(false);
    }
  }, [index]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((f) => !f);
  }, []);

  const toggleStar = useCallback(() => {
    if (!current) return;
    storeToggle(contentType, current.id);
  }, [current, contentType, storeToggle]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          toggleFlip();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          toggleStar();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleFlip, goNext, goPrev, toggleStar]);

  if (!current) return null;

  const frontContent = showTermFirst
    ? { main: current.term, sub: current.termExtra }
    : { main: current.definition, sub: current.definitionExtra };
  const backContent = showTermFirst
    ? { main: current.definition, sub: current.definitionExtra }
    : { main: current.term, sub: current.termExtra };

  const isStarred = storeIsStarred(contentType, current.id);
  const starredCount = getStarredSet(contentType).size;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-secondary border border-border text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              Back
            </button>
          )}
          <span className="text-xs text-text-tertiary">
            {starredCount > 0 && `${starredCount} starred`}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Flip sides toggle */}
          <button
            onClick={() => { setShowTermFirst((v) => !v); setIsFlipped(false); }}
            className="p-2 rounded-lg bg-bg-secondary border border-border text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title={showTermFirst ? 'Showing term first' : 'Showing definition first'}
          >
            {showTermFirst ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          {/* Shuffle */}
          <button
            onClick={() => setIsShuffled((s) => !s)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
              isShuffled
                ? 'bg-accent/10 text-accent border border-accent/30'
                : 'bg-bg-secondary border border-border text-text-secondary hover:text-text-primary'
            )}
          >
            Shuffle
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="relative" style={{ perspective: '1200px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${index}-${isShuffled}`}
            ref={cardRef}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/*
              Flip container — needs:
              1. `relative` so absolute children have a containing block
              2. a fixed height so absolutely-positioned faces can fill it
              3. `preserve-3d` so child rotations compose correctly
            */}
            <div
              onClick={toggleFlip}
              className="cursor-pointer select-none relative min-h-[320px]"
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front face — absolute so it shares the same bounding box as the back */}
              <div
                className="absolute inset-0 rounded-2xl border-2 border-border bg-bg-secondary shadow-lg flex flex-col items-center justify-center p-12"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleStar(); }}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-bg-muted transition-colors cursor-pointer"
                >
                  <Star
                    size={20}
                    className={isStarred ? 'text-gold-500 fill-gold-500' : 'text-text-tertiary'}
                  />
                </button>

                <div className="flex items-center gap-2 justify-center">
                  <span className={cn(
                    'text-5xl font-bold text-text-primary leading-tight text-center',
                    showTermFirst && 'jp-text'
                  )}>
                    {frontContent.main}
                  </span>
                  {showTermFirst && (
                    <span onClick={(e) => e.stopPropagation()}>
                      <AudioButton text={frontContent.main} showSlow />
                    </span>
                  )}
                </div>
                {frontContent.sub && (
                  <span className="text-lg text-text-secondary mt-2 jp-text text-center">
                    {frontContent.sub}
                  </span>
                )}
                <span className="text-xs text-text-tertiary mt-6">Click or press Space to flip</span>
              </div>

              {/* Back face — same absolute overlay, pre-rotated 180° so it's hidden until flipped */}
              <div
                className="absolute inset-0 rounded-2xl border-2 border-accent/30 bg-bg-elevated shadow-lg flex flex-col items-center justify-center p-12"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleStar(); }}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-bg-muted transition-colors cursor-pointer"
                >
                  <Star
                    size={20}
                    className={isStarred ? 'text-gold-500 fill-gold-500' : 'text-text-tertiary'}
                  />
                </button>

                <div className="flex items-center gap-2 justify-center">
                  <span className={cn(
                    'text-4xl font-bold text-accent leading-tight text-center',
                    !showTermFirst && 'jp-text'
                  )}>
                    {backContent.main}
                  </span>
                  {!showTermFirst && (
                    <span onClick={(e) => e.stopPropagation()}>
                      <AudioButton text={backContent.main} showSlow />
                    </span>
                  )}
                </div>
                {backContent.sub && (
                  <span className="text-lg text-text-secondary mt-2 jp-text text-center">
                    {backContent.sub}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="p-3 rounded-xl bg-bg-secondary border border-border text-text-secondary hover:text-text-primary disabled:opacity-30 transition-all cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Progress */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">
            {index + 1} / {deck.length}
          </span>
          <div className="flex gap-0.5">
            {deck.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 rounded-full transition-all',
                  i === index ? 'w-4 bg-accent' : 'w-1.5 bg-bg-muted',
                  i < index && 'bg-accent/40'
                )}
              />
            ))}
          </div>
        </div>

        <button
          onClick={goNext}
          disabled={index >= deck.length - 1}
          className="p-3 rounded-xl bg-bg-secondary border border-border text-text-secondary hover:text-text-primary disabled:opacity-30 transition-all cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Keyboard hints */}
      <div className="flex justify-center gap-4 text-[10px] text-text-tertiary">
        <span>Space = flip</span>
        <span>Arrow keys = navigate</span>
        <span>S = star</span>
      </div>
    </div>
  );
}
