import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioButton } from '@/hooks/useAudio';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ResultIcon, IconBadge } from '@/components/shared/ResultIcon';
import { useAppStore } from '@/stores/settingsStore';
import { useUserStore } from '@/stores/userStore';
import { getDueCards, submitReview, getCardContent, createCards } from '@/services/srsService';
import type { CardContent } from '@/services/srsService';
import { recordReviewSession, calculateSessionXp, awardXp, calculateStreak, updateUserStreak } from '@/services/progressService';
import { query, execute } from '@/lib/db';
import type { SrsCard, ReviewRating } from '@/lib/types';

interface ReviewCardDisplay {
  srsCard: SrsCard;
  content: CardContent;
}

// Content type labels/colors for the badge
const CONTENT_BADGES: Record<string, { label: string; color: string }> = {
  kana: { label: 'Kana', color: 'bg-sakura-500' },
  kanji: { label: 'Kanji', color: 'bg-indigo-500' },
  vocab: { label: 'Vocab', color: 'bg-matcha-500' },
  grammar: { label: 'Grammar', color: 'bg-gold-500' },
};

// Approximate intervals for each rating, shown on the buttons
function getIntervalHint(card: SrsCard, rating: ReviewRating): string {
  if (card.state === 'new' || card.state === 'learning' || card.state === 'relearning') {
    // Learning cards have short intervals
    switch (rating) {
      case 1: return '1m';
      case 2: return '6m';
      case 3: return '10m';
      case 4: return '1d';
    }
  }
  // Review cards — estimate from stability
  const stability = card.stability || 1;
  switch (rating) {
    case 1: return '10m';
    case 2: return formatDays(Math.max(1, stability * 0.5));
    case 3: return formatDays(Math.max(1, stability));
    case 4: return formatDays(Math.max(1, stability * 1.5));
  }
}

function formatDays(days: number): string {
  if (days < 1) return `${Math.round(days * 24 * 60)}m`;
  if (days < 1.5) return '1d';
  if (days < 30) return `${Math.round(days)}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

export function ReviewPage() {
  const { setCurrentPage } = useAppStore();
  const { user, addXp, updateStreak: setStoreStreak } = useUserStore();
  const [cards, setCards] = useState<ReviewCardDisplay[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerShown, setIsAnswerShown] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, newLearned: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const cardStartTime = useRef(Date.now());
  const sessionStartTime = useRef(Date.now());

  // Check if user has seen the SRS explanation
  useEffect(() => {
    async function checkOnboarding() {
      try {
        const rows = await query<{ value: string }>(
          "SELECT value FROM settings WHERE key = 'review_onboarding_seen'"
        );
        if (rows.length === 0) {
          setShowOnboarding(true);
        }
      } catch {
        // If query fails, don't block
      }
    }
    checkOnboarding();
  }, []);

  const dismissOnboarding = async () => {
    setShowOnboarding(false);
    try {
      await execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('review_onboarding_seen', 'true')",
        []
      );
    } catch {
      // Non-critical
    }
  };

  useEffect(() => {
    async function loadCards() {
      if (!user) { setIsLoading(false); return; }

      try {
        // Only create SRS cards for kana the user has actually studied
        // (exists in kana_mastery with at least one correct answer)
        const studiedButNoCard = await query<{ id: number }>(
          `SELECT km.kana_id as id FROM kana_mastery km
           LEFT JOIN srs_cards sc ON sc.content_type = 'kana' AND sc.content_id = km.kana_id AND sc.user_id = $1
           WHERE km.user_id = $1 AND km.correct_count > 0 AND sc.id IS NULL`,
          [user.id]
        );
        if (studiedButNoCard.length > 0) {
          await createCards(user.id, 'kana', studiedButNoCard.map((k) => k.id));
        }

        const dueCards = await getDueCards(user.id, 20);

        const displayCards: ReviewCardDisplay[] = [];
        for (const card of dueCards) {
          const content = await getCardContent(card);
          if (content) {
            displayCards.push({ srsCard: card, content });
          }
        }

        setCards(displayCards);
      } catch (err) {
        console.error('Failed to load review cards:', err);
      }
      setIsLoading(false);
      sessionStartTime.current = Date.now();
      cardStartTime.current = Date.now();
    }

    loadCards();
  }, [user]);

  const currentCard = cards[currentIndex];
  const isComplete = currentIndex >= cards.length;

  const handleKeyboard = useCallback((e: KeyboardEvent) => {
    if (isComplete || !currentCard) return;
    if (e.key === ' ' && !isAnswerShown) {
      e.preventDefault();
      setIsAnswerShown(true);
    }
    if (isAnswerShown && e.key >= '1' && e.key <= '4') {
      e.preventDefault();
      handleRating(parseInt(e.key) as ReviewRating);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, currentCard, isAnswerShown]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyboard]);

  const handleRating = async (rating: ReviewRating) => {
    if (!currentCard || !user) return;

    const elapsed = Date.now() - cardStartTime.current;
    const isCorrect = rating >= 3;
    const isNew = currentCard.srsCard.reps === 0;

    try {
      await submitReview(currentCard.srsCard, rating, elapsed);
    } catch (err) {
      console.error('Failed to submit review:', err);
    }

    setSessionStats((prev) => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      newLearned: prev.newLearned + (isNew ? 1 : 0),
    }));
    setCurrentIndex((prev) => prev + 1);
    setIsAnswerShown(false);
    cardStartTime.current = Date.now();
  };

  // Save session on complete
  useEffect(() => {
    if (!isComplete || !user || sessionStats.reviewed === 0) return;

    async function saveSession() {
      if (!user) return;
      const timeSpent = Math.round((Date.now() - sessionStartTime.current) / 1000);
      const accuracy = sessionStats.reviewed > 0
        ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
        : 0;
      const xp = calculateSessionXp(sessionStats.reviewed, sessionStats.correct, sessionStats.newLearned);

      try {
        await recordReviewSession(user.id, sessionStats.reviewed, sessionStats.newLearned, timeSpent, accuracy, xp);
        await awardXp(user.id, xp);
        addXp(xp);

        const streak = await calculateStreak(user.id);
        await updateUserStreak(user.id, streak);
        setStoreStreak(streak);
      } catch (err) {
        console.error('Failed to save session:', err);
      }
    }

    saveSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  // ─── SRS Onboarding Overlay ──────────────────────────────

  if (showOnboarding) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-bg-secondary rounded-2xl border border-border p-8 shadow-soft"
        >
          <div className="text-center mb-6">
            <IconBadge icon="brain" />
            <h2 className="text-2xl font-bold text-text-primary">Spaced Repetition</h2>
            <p className="text-sm text-text-secondary mt-1">The science behind long-term memory</p>
          </div>

          <div className="space-y-4 mb-8">
            <InfoBlock
              title="How it works"
              text="Review shows you flashcards just before your brain would forget them. Each time you remember correctly, the interval grows longer. This is the most efficient way to memorize large amounts of material."
            />
            <InfoBlock
              title="The four ratings"
              text="After seeing the answer, rate how well you remembered. This adjusts when you'll see the card next:"
            />

            {/* Rating explanation cards */}
            <div className="grid grid-cols-2 gap-2">
              <RatingExplainer color="bg-sakura-500" label="Again" interval="~1 min" desc="Didn't remember at all — show it again very soon" />
              <RatingExplainer color="bg-gold-500" label="Hard" interval="~6 min" desc="Remembered, but it was a struggle" />
              <RatingExplainer color="bg-matcha-500" label="Good" interval="~10 min → days" desc="Remembered with some effort — the normal choice" />
              <RatingExplainer color="bg-indigo-500" label="Easy" interval="days → weeks" desc="Instant recall, no hesitation" />
            </div>

            <InfoBlock
              title="When to review"
              text="Cards appear on your dashboard when they're due. Doing reviews daily (even just 5 minutes) is much more effective than long sessions once a week."
            />
          </div>

          <button
            onClick={dismissOnboarding}
            className="w-full py-3 gradient-accent text-white rounded-xl font-medium cursor-pointer shadow-sm"
          >
            Got it — let's review
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Loading ────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-text-secondary">Loading review cards...</p>
      </div>
    );
  }

  // ─── Empty State ────────────────────────────────────────

  if (cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <ResultIcon accuracy={100} />
          <h2 className="text-2xl font-bold text-text-primary mb-2">All Caught Up!</h2>
          <p className="text-text-secondary mb-2">No cards are due for review right now.</p>
          <p className="text-sm text-text-tertiary mb-8 max-w-md mx-auto">
            New cards appear here as you learn kana, kanji, vocabulary, and grammar.
            The spaced repetition system will schedule them for review at the optimal time.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setCurrentPage('hiragana')}
              className="px-5 py-2.5 bg-accent text-white rounded-xl font-medium cursor-pointer hover:opacity-90"
            >
              Learn Hiragana
            </button>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="px-5 py-2.5 bg-bg-muted text-text-primary rounded-xl font-medium cursor-pointer hover:bg-bg-subtle transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Session Complete ───────────────────────────────────

  if (isComplete) {
    const accuracy = sessionStats.reviewed > 0
      ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
      : 0;
    const xp = calculateSessionXp(sessionStats.reviewed, sessionStats.correct, sessionStats.newLearned);

    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.2 }}
            className="text-6xl block mb-6"
          >
            <ResultIcon accuracy={accuracy} />
          </motion.div>
          <h2 className="text-2xl font-bold text-gradient-accent mb-1">Session Complete!</h2>
          <p className="text-sm text-text-tertiary mb-6">{accuracy >= 80 ? 'Amazing work!' : 'Keep going, you\'re improving!'}</p>
          <div className="grid grid-cols-4 gap-3 mb-8">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl p-4 gradient-sakura border border-[var(--color-feedback-error-border)]">
              <p className="text-3xl font-bold text-accent">{sessionStats.reviewed}</p>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Reviewed</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl p-4 gradient-matcha border border-[var(--color-feedback-success-border)]">
              <p className="text-3xl font-bold text-[var(--color-feedback-success-text)]">{sessionStats.correct}</p>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Correct</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-bg-secondary rounded-xl border border-border p-4">
              <p className="text-3xl font-bold text-text-primary">{accuracy}%</p>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Accuracy</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-xl p-4 gradient-gold border border-[var(--color-feedback-gold-border)]">
              <p className="text-3xl font-bold text-[var(--color-feedback-gold-text)]">+{xp}</p>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider">XP Earned</p>
            </motion.div>
          </div>
          <p className="text-xs text-text-tertiary mb-6">
            Cards you rated "Good" or "Easy" will return in a few days. Cards you found hard will come back sooner.
          </p>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCurrentPage('dashboard')}
            className="px-6 py-2.5 gradient-accent text-white rounded-xl font-medium cursor-pointer shadow-sm"
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ─── Active Review ──────────────────────────────────────

  const badge = CONTENT_BADGES[currentCard.content.contentType] ?? { label: 'Card', color: 'bg-accent' };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-text-primary">Review</h2>
          <button
            onClick={() => setShowOnboarding(true)}
            className="w-5 h-5 rounded-full bg-bg-muted flex items-center justify-center text-text-tertiary hover:text-text-primary cursor-pointer transition-colors"
            title="What is spaced repetition?"
          >
            <span className="text-[11px] font-bold">?</span>
          </button>
        </div>
        <span className="text-sm text-text-secondary tabular-nums">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-bg-subtle rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, var(--color-accent), var(--color-sakura-500))',
          }}
          animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-bg-secondary rounded-2xl border border-border p-12 text-center min-h-[350px] flex flex-col items-center justify-center shadow-soft relative overflow-hidden"
      >
        {/* Decorative circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-accent/[0.03] pointer-events-none" />

        {/* Content type badge */}
        <div className="absolute top-4 left-4">
          <span className={cn('text-[10px] font-bold text-white px-2 py-0.5 rounded-full', badge.color)}>
            {badge.label}
          </span>
          {currentCard.srsCard.reps === 0 && (
            <span className="ml-1.5 text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              New
            </span>
          )}
        </div>

        {/* Card front */}
        {currentCard.content.contentType === 'vocab' ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-6xl font-bold text-text-primary jp-text">{currentCard.content.word}</span>
              {currentCard.content.word && <AudioButton text={currentCard.content.word} showSlow />}
            </div>
            <p className="text-lg text-accent/60 jp-text mt-2">{currentCard.content.reading}</p>
          </div>
        ) : currentCard.content.contentType === 'grammar' ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-accent jp-text">{currentCard.content.pattern}</span>
              {currentCard.content.pattern && <AudioButton text={currentCard.content.pattern} />}
            </div>
            {currentCard.content.formation && (
              <p className="text-sm text-text-secondary mt-2 font-mono">{currentCard.content.formation}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="text-[100px] character-display text-text-primary leading-none jp-text">
              {currentCard.content.character}
            </span>
            <AudioButton text={currentCard.content.character} showSlow />
          </div>
        )}

        {!isAnswerShown ? (
          <motion.button
            onClick={() => setIsAnswerShown(true)}
            className="mt-10 px-8 py-3 gradient-accent text-white rounded-xl font-medium cursor-pointer shadow-sm glow-accent"
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(108,99,255,0.3)' }}
            whileTap={{ scale: 0.97 }}
            animate={{ boxShadow: ['0 0 12px rgba(108,99,255,0.15)', '0 0 20px rgba(108,99,255,0.25)', '0 0 12px rgba(108,99,255,0.15)'] }}
            transition={{ boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
          >
            Show Answer
            <span className="ml-2 text-xs text-white/50">space</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 w-full"
          >
            {/* Answer */}
            {currentCard.content.contentType === 'kana' && (
              <p className="text-3xl font-bold text-accent mb-8">
                {currentCard.content.romaji}
              </p>
            )}
            {currentCard.content.contentType === 'kanji' && (
              <div className="mb-8 space-y-2">
                <p className="text-2xl font-bold text-accent">
                  {(currentCard.content.meanings ?? []).join(', ')}
                </p>
                <p className="text-sm text-text-secondary jp-text">
                  On: {(currentCard.content.onReadings ?? []).join('、') || '—'} | Kun: {(currentCard.content.kunReadings ?? []).join('、') || '—'}
                </p>
              </div>
            )}
            {currentCard.content.contentType === 'vocab' && (
              <div className="mb-8 space-y-2">
                <p className="text-2xl font-bold text-accent">
                  {(currentCard.content.meanings ?? []).join(', ')}
                </p>
                <p className="text-xs text-text-secondary px-2 py-0.5 rounded bg-bg-subtle inline-block">
                  {currentCard.content.partOfSpeech}
                </p>
              </div>
            )}
            {currentCard.content.contentType === 'grammar' && (
              <div className="mb-8 space-y-2">
                <p className="text-2xl font-bold text-accent">
                  {(currentCard.content.meanings ?? []).join(', ')}
                </p>
                {currentCard.content.notes && (
                  <p className="text-xs text-text-secondary italic max-w-sm mx-auto">
                    {currentCard.content.notes}
                  </p>
                )}
              </div>
            )}

            {/* How well did you know this? */}
            <p className="text-[11px] text-text-tertiary mb-3">How well did you remember?</p>

            {/* Rating buttons with interval hints */}
            <div className="flex gap-2.5 justify-center">
              {([
                { rating: 1 as ReviewRating, label: 'Again', key: '1', bg: 'bg-sakura-500 hover:bg-sakura-600' },
                { rating: 2 as ReviewRating, label: 'Hard', key: '2', bg: 'bg-gold-500 hover:bg-gold-600' },
                { rating: 3 as ReviewRating, label: 'Good', key: '3', bg: 'bg-matcha-500 hover:bg-matcha-600' },
                { rating: 4 as ReviewRating, label: 'Easy', key: '4', bg: 'bg-indigo-500 hover:bg-indigo-600' },
              ]).map((btn) => (
                <motion.button
                  key={btn.rating}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRating(btn.rating)}
                  className={cn(
                    'flex flex-col items-center px-5 py-2 rounded-xl font-medium text-sm cursor-pointer text-white transition-all shadow-sm hover:shadow-md min-w-[72px]',
                    btn.bg,
                  )}
                >
                  <span>{btn.label}</span>
                  <span className="text-[10px] text-white/50 mt-0.5">
                    ~{getIntervalHint(currentCard.srsCard, btn.rating)}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Keyboard hint */}
            <p className="text-[10px] text-text-tertiary/50 mt-3">Press 1-4 to rate</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-bg-primary rounded-xl p-4">
      <p className="text-sm font-semibold text-text-primary mb-1">{title}</p>
      <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
    </div>
  );
}

function RatingExplainer({ color, label, interval, desc }: {
  color: string; label: string; interval: string; desc: string;
}) {
  return (
    <div className="flex items-start gap-2.5 bg-bg-primary rounded-lg p-3">
      <div className={cn('w-3 h-3 rounded-full shrink-0 mt-0.5', color)} />
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">{label}</span>
          <span className="text-[10px] text-text-tertiary">{interval}</span>
        </div>
        <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
