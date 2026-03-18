import { useState, useEffect, useCallback, useMemo } from 'react';
import { AudioButton } from '@/hooks/useAudio';
import { HighlightableText } from '@/components/shared/HighlightableText';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import {
  getGrammarByLevel,
  searchGrammar,
  startStudyingGrammarLevel,
} from '@/services/grammarService';
import type { GrammarDetail } from '@/services/grammarService';
import type { JlptLevelId } from '@/lib/types';
import * as Dialog from '@radix-ui/react-dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { GrammarLesson } from '@/components/grammar/GrammarLesson';
import { MasteryIndicator } from '@/components/kana/MasteryIndicator';
import { getGrammarGroupsForLevel, type GrammarGroup } from '@/data/grammarGroups';
import { getMasteryForGrammar, getMasteryLevel, type GrammarMastery } from '@/services/grammarMasteryService';
import { StudyModeSelector } from '@/components/study/StudyModeSelector';
import { FlashcardMode } from '@/components/study/FlashcardMode';
import { LearnMode } from '@/components/study/LearnMode';
import { TestMode } from '@/components/study/TestMode';
import { MatchMode } from '@/components/study/MatchMode';
import type { StudyItem, StudyMode } from '@/components/study/types';
import { useStarredStore } from '@/stores/starredStore';
import { Star } from '@/lib/icons';
import { SrsLevelStatus } from '@/components/shared/SrsLevelStatus';

export function GrammarPage() {
  const { user } = useUserStore();
  const [grammarList, setGrammarList] = useState<GrammarDetail[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<JlptLevelId>(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrammar, setSelectedGrammar] = useState<GrammarDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'browse' | 'learn' | 'lesson' | 'study-select' | 'study-flashcards' | 'study-learn' | 'study-test' | 'study-match'>('browse');
  const [lessonGroup, setLessonGroup] = useState<GrammarGroup | null>(null);
  const [grammarMastery, setGrammarMastery] = useState<Map<number, GrammarMastery>>(new Map());

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getGrammarByLevel(selectedLevel);
      setGrammarList(data);
      setIsLoading(false);
      if (user && data.length > 0) {
        const mastery = await getMasteryForGrammar(user.id, data.map((g) => g.id));
        setGrammarMastery(mastery);
      }
    }
    load();
  }, [selectedLevel, user]);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length === 0) {
      const data = await getGrammarByLevel(selectedLevel);
      setGrammarList(data);
    } else {
      const results = await searchGrammar(q.trim());
      setGrammarList(results);
    }
  }, [selectedLevel]);

  const { isStarred: isGrammarStarred } = useStarredStore();

  // Build StudyItems from current grammar list
  const studyItems = useMemo((): StudyItem[] =>
    grammarList.map((g) => ({
      id: String(g.id),
      term: g.pattern,
      termExtra: g.formation,
      definition: g.meaning['en'] ?? g.pattern,
      definitionExtra: g.examples[0]?.japanese,
      contentType: 'grammar' as const,
    })),
  [grammarList]);

  const handleStartStudy = async () => {
    if (!user) return;
    await startStudyingGrammarLevel(user.id, selectedLevel);
  };

  const isInActiveLesson = viewMode === 'lesson' || viewMode === 'study-flashcards' || viewMode === 'study-learn' || viewMode === 'study-test' || viewMode === 'study-match';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Grammar"
        subtitle="Learn Japanese grammar patterns"
        jpTitle="文法"
        theme="gold"
        action={
          !isInActiveLesson ? (
            <div className="flex gap-1.5">
              <button
                onClick={() => setViewMode('learn')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                  (viewMode === 'learn') ? 'bg-white text-gold-600' : 'bg-white/20 text-white/80 hover:bg-white/30'
                )}
              >
                Learn
              </button>
              <button
                onClick={() => setViewMode('browse')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                  viewMode === 'browse' ? 'bg-white text-gold-600' : 'bg-white/20 text-white/80 hover:bg-white/30'
                )}
              >
                Browse
              </button>
              <button
                onClick={() => setViewMode('study-select')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                  viewMode === 'study-select' ? 'bg-white text-gold-600' : 'bg-white/20 text-white/80 hover:bg-white/30'
                )}
              >
                Quiz
              </button>
            </div>
          ) : undefined
        }
      />

      {/* Level Selector — hidden during active lessons/quizzes */}
      {!isInActiveLesson && (
        <div className="flex gap-2">
          {([5, 4, 3, 2, 1] as JlptLevelId[]).map((level) => (
            <button
              key={level}
              onClick={() => { setSelectedLevel(level); setSearchQuery(''); }}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer',
                selectedLevel === level
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-bg-secondary border border-border text-text-secondary hover:text-text-primary'
              )}
            >
              N{level}
            </button>
          ))}
        </div>
      )}

      {/* Browse Mode */}
      {viewMode === 'browse' && (
        <>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by pattern, meaning, or formation..."
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-secondary text-text-primary text-sm outline-none focus:border-accent"
          />
          <SrsLevelStatus
            userId={user?.id}
            contentType="grammar"
            contentLabel="grammar"
            level={selectedLevel}
            onAdd={handleStartStudy}
          />
          {isLoading ? (
            <div className="text-center py-12 text-text-secondary">Loading...</div>
          ) : grammarList.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              No grammar patterns found for N{selectedLevel}. Content coming soon.
            </div>
          ) : (
            <div className="space-y-3">
              {grammarList.map((g) => {
                const meaning = g.meaning['en'] ?? '';
                const firstExample = g.examples[0];
                const m = grammarMastery.get(g.id);
                const mLevel = m ? getMasteryLevel(m.correctCount, m.incorrectCount) : 0;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGrammar(g)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border hover:border-accent hover:shadow-sm transition-all cursor-pointer group',
                      mLevel >= 3 ? 'bg-[var(--color-feedback-success-bg)] border-[var(--color-feedback-success-border)]' : 'bg-bg-secondary border-border'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <span className="text-lg font-bold text-accent jp-text group-hover:underline">{g.pattern}</span>
                        <p className="text-sm text-text-secondary mt-0.5">{meaning}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isGrammarStarred('grammar', String(g.id)) && (
                          <Star size={13} className="text-gold-500 fill-gold-500" />
                        )}
                        {mLevel > 0 && <MasteryIndicator level={mLevel} size="sm" />}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-subtle text-text-secondary">{g.formation}</span>
                      </div>
                    </div>
                    {firstExample && (
                      <div className="mt-2 pl-3 border-l-2 border-accent/20">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm text-text-primary jp-text">{firstExample.japanese}</p>
                          <AudioButton text={firstExample.japanese} />
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">{firstExample.translations['en'] ?? ''}</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Learn Mode — Group selector */}
      {viewMode === 'learn' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Choose a grammar group to learn</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getGrammarGroupsForLevel(selectedLevel).map((group) => {
              const groupGrammar = grammarList.filter((g) => group.patterns.includes(g.pattern));
              if (groupGrammar.length === 0) return null;
              const masteredCount = groupGrammar.filter((g) => {
                const m = grammarMastery.get(g.id);
                return m && m.masteryLevel >= 3;
              }).length;
              const isComplete = masteredCount === groupGrammar.length;
              return (
                <motion.button
                  key={group.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setLessonGroup(group); setViewMode('lesson'); }}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all cursor-pointer card-interactive',
                    isComplete ? 'border-matcha-400 bg-[var(--color-feedback-success-bg)]' : 'border-border bg-bg-secondary hover:border-accent/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-text-primary">{group.label}</span>
                    {isComplete && <span className="text-xs text-matcha-600">Done</span>}
                  </div>
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {groupGrammar.map((g) => (
                      <span key={g.id} className="text-xs jp-text text-accent bg-accent/5 rounded px-1.5 py-0.5">{g.pattern}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-text-tertiary">{masteredCount}/{groupGrammar.length} mastered</span>
                  </div>
                  <div className="h-1 bg-bg-subtle rounded-full overflow-hidden mt-2">
                    <div className={cn('h-full rounded-full transition-all', isComplete ? 'bg-matcha-500' : 'bg-gold-500')} style={{ width: `${groupGrammar.length > 0 ? (masteredCount / groupGrammar.length) * 100 : 0}%` }} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lesson Mode */}
      {viewMode === 'lesson' && lessonGroup && (() => {
        const groupGrammar = grammarList.filter((g) => lessonGroup.patterns.includes(g.pattern));
        return (
          <GrammarLesson
            patterns={groupGrammar}
            allGrammar={grammarList}
            onComplete={async () => {
              setViewMode('learn');
              setLessonGroup(null);
              if (user) { const m = await getMasteryForGrammar(user.id, grammarList.map((g) => g.id)); setGrammarMastery(m); }
            }}
            onBack={() => { setViewMode('learn'); setLessonGroup(null); }}
          />
        );
      })()}

      {/* ── Quizlet-style Study Modes ── */}
      {viewMode === 'study-select' && (
        <StudyModeSelector
          itemCount={studyItems.length}
          onSelect={(mode: StudyMode) => setViewMode(`study-${mode}` as typeof viewMode)}
          onBack={() => setViewMode('browse')}
        />
      )}
      {viewMode === 'study-flashcards' && (
        <FlashcardMode items={studyItems} onBack={() => setViewMode('study-select')} />
      )}
      {viewMode === 'study-learn' && (
        <LearnMode items={studyItems} onBack={() => setViewMode('study-select')} />
      )}
      {viewMode === 'study-test' && (
        <TestMode items={studyItems} onBack={() => setViewMode('study-select')} />
      )}
      {viewMode === 'study-match' && (
        <MatchMode items={studyItems} onBack={() => setViewMode('study-select')} />
      )}

      {/* Detail Modal */}
      <GrammarDetailModal
        grammar={selectedGrammar}
        isOpen={selectedGrammar !== null}
        onClose={() => setSelectedGrammar(null)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Grammar Detail Modal
// ─────────────────────────────────────────────────────────────

function GrammarDetailModal({
  grammar,
  isOpen,
  onClose,
}: {
  grammar: GrammarDetail | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!grammar) return null;

  const meaning = grammar.meaning['en'] ?? '';

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-bg-secondary rounded-2xl border border-border shadow-2xl p-8 focus:outline-none max-h-[85vh] overflow-y-auto"
              >
                <Dialog.Close asChild>
                  <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-subtle flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 1l12 12M13 1L1 13" />
                    </svg>
                  </button>
                </Dialog.Close>

                {/* Pattern */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-accent jp-text">
                    {grammar.pattern}
                  </span>
                  <AudioButton text={grammar.pattern} />
                </div>

                {/* Meaning */}
                <p className="text-center text-lg text-text-primary font-medium mb-4">
                  {meaning}
                </p>

                {/* Formation */}
                <div className="bg-bg-primary rounded-xl p-4 mb-4">
                  <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                    Formation
                  </p>
                  <p className="text-sm text-text-primary font-mono">
                    {grammar.formation}
                  </p>
                </div>

                {/* Examples */}
                <div className="space-y-3 mb-4">
                  <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                    Examples
                  </p>
                  {grammar.examples.map((ex, i) => {
                    const exHlId = `grammar-ex-${grammar.pattern}-${i}`;
                    return (
                    <div key={i} className="bg-bg-primary rounded-xl p-4 border-l-3 border-accent/30">
                      <div className="flex items-start gap-1.5">
                        <HighlightableText text={ex.japanese} highlightId={exHlId} className="text-base font-medium text-text-primary flex-1" />
                        <AudioButton text={ex.japanese} showSlow highlightId={exHlId} />
                      </div>
                      {ex.reading && ex.reading !== ex.japanese && (
                        <p className="text-sm text-accent/60 jp-text mt-0.5">
                          {ex.reading}
                        </p>
                      )}
                      <p className="text-sm text-text-secondary mt-1">
                        {ex.translations['en'] ?? ''}
                      </p>
                    </div>
                    );
                  })}
                </div>

                {/* Notes */}
                {grammar.notes && (
                  <div className="bg-[var(--color-feedback-info-bg)] border border-[var(--color-feedback-info-border)] rounded-xl p-3 mb-4">
                    <p className="text-xs text-[var(--color-feedback-info-text)] font-semibold mb-1">Note</p>
                    <p className="text-sm text-[var(--color-feedback-info-text)]">
                      {grammar.notes}
                    </p>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-bg-muted text-text-primary rounded-xl font-medium cursor-pointer hover:bg-bg-subtle transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
