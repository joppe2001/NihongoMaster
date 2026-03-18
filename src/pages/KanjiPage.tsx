import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { AudioButton } from '@/hooks/useAudio';

import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { getKanjiByLevel, searchKanji, startStudyingKanjiLevel } from '@/services/kanjiService';
import { StrokeAnimation } from '@/components/kana/StrokeAnimation';
import { getStrokeData } from '@/data/strokeData';
import { RADICALS_N5 } from '@/data/radicals';
import { KANJI_COMPOUNDS } from '@/data/kanjiCompounds';
import type { KanjiDetail } from '@/services/kanjiService';
import { PageHeader } from '@/components/shared/PageHeader';
import { KanjiLesson } from '@/components/kanji/KanjiLesson';
import { MasteryIndicator } from '@/components/kana/MasteryIndicator';
import { getGroupsForLevel, type KanjiGroup } from '@/data/kanjiGroups';
import { getMasteryForKanji, type KanjiMastery } from '@/services/kanjiMasteryService';
import { getMasteryLevel } from '@/services/kanaMasteryService';
import type { JlptLevelId } from '@/lib/types';
import * as Dialog from '@radix-ui/react-dialog';
import { StudyModeSelector } from '@/components/study/StudyModeSelector';
import { FlashcardMode } from '@/components/study/FlashcardMode';
import { LearnMode } from '@/components/study/LearnMode';
import { TestMode } from '@/components/study/TestMode';
import { MatchMode } from '@/components/study/MatchMode';
import type { StudyItem, StudyMode } from '@/components/study/types';
import { useStarredStore } from '@/stores/starredStore';
import { Star } from '@/lib/icons';
import { SrsLevelStatus } from '@/components/shared/SrsLevelStatus';

type ViewMode = 'browse' | 'quiz' | 'radicals' | 'learn' | 'lesson'
  | 'study-select' | 'study-flashcards' | 'study-learn' | 'study-test' | 'study-match';

const LEVEL_COLORS: Record<number, string> = {
  5: '#22c55e', 4: '#3b82f6', 3: '#a855f7', 2: '#f59e0b', 1: '#ef4444',
};

export function KanjiPage() {
  const { user } = useUserStore();
  const [kanjiList, setKanjiList] = useState<KanjiDetail[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<JlptLevelId>(5);
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [selectedKanji, setSelectedKanji] = useState<KanjiDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Learn mode state
  const [lessonGroup, setLessonGroup] = useState<KanjiGroup | null>(null);
  const [kanjiMastery, setKanjiMastery] = useState<Map<number, KanjiMastery>>(new Map());

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getKanjiByLevel(selectedLevel);
      setKanjiList(data);
      setIsLoading(false);
      // Load mastery data
      if (user && data.length > 0) {
        const mastery = await getMasteryForKanji(user.id, data.map((k) => k.id));
        setKanjiMastery(mastery);
      }
    }
    load();
  }, [selectedLevel, user]);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length === 0) {
      const data = await getKanjiByLevel(selectedLevel);
      setKanjiList(data);
    } else {
      const results = await searchKanji(q.trim());
      setKanjiList(results);
    }
  }, [selectedLevel]);

  const handleStartStudy = async () => {
    if (!user) return;
    await startStudyingKanjiLevel(user.id, selectedLevel);
  };

  const { isStarred: isKanjiStarred } = useStarredStore();

  // Build StudyItems from current kanji list
  const studyItems = useMemo((): StudyItem[] =>
    kanjiList.map((k) => {
      const meanings = k.meanings['en'] ?? [];
      const readings = [...k.kunReadings, ...k.onReadings].filter(Boolean);
      return {
        id: String(k.id),
        term: k.character,
        termExtra: readings.slice(0, 3).join('、') || undefined,
        definition: meanings.join(', ') || k.character,
        definitionExtra: k.mnemonic ?? undefined,
        contentType: 'kanji' as const,
      };
    }),
  [kanjiList]);

  const isInActiveLesson = viewMode === 'lesson' || viewMode === 'study-flashcards' || viewMode === 'study-learn' || viewMode === 'study-test' || viewMode === 'study-match';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Colorful Header */}
      <PageHeader
        title="Kanji"
        subtitle={`${kanjiList.length} kanji — JLPT N${selectedLevel}`}
        jpTitle="漢字"
        theme="gold"
        action={
          !isInActiveLesson ? (
            <div className="flex gap-1.5 flex-wrap">
              {[
                { id: 'learn', label: 'Learn', active: viewMode === 'learn', onClick: () => setViewMode('learn') },
                { id: 'browse', label: 'Browse', active: viewMode === 'browse', onClick: () => setViewMode('browse') },
                { id: 'quiz', label: 'Quiz', active: viewMode === 'quiz' || viewMode === 'study-select', onClick: () => setViewMode('study-select') },
                { id: 'radicals', label: 'Radicals', active: viewMode === 'radicals', onClick: () => setViewMode('radicals') },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={btn.onClick}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                    btn.active
                      ? 'bg-white text-gold-600'
                      : 'bg-white/20 text-white/80 hover:bg-white/30 hover:text-white'
                  )}
                >
                  {btn.label}
                </button>
              ))}
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
                  ? 'text-white shadow-sm'
                  : 'bg-bg-secondary border border-border text-text-secondary hover:text-text-primary'
              )}
              style={selectedLevel === level ? { backgroundColor: LEVEL_COLORS[level] } : {}}
            >
              N{level}
            </button>
          ))}
        </div>
      )}

      {/* Browse Mode */}
      {viewMode === 'browse' && (
        <>
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by kanji, reading, or meaning..."
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-secondary text-text-primary text-sm outline-none focus:border-accent"
          />

          {/* Mastery summary + SRS status */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            {kanjiMastery.size > 0 && (
              <span className="text-xs text-text-secondary">
                <span className="font-medium text-matcha-600">{[...kanjiMastery.values()].filter((m) => m.masteryLevel >= 3).length}</span>
                <span className="text-text-tertiary">/{kanjiList.length} mastered</span>
              </span>
            )}
            <SrsLevelStatus
              userId={user?.id}
              contentType="kanji"
              contentLabel="kanji"
              level={selectedLevel}
              onAdd={handleStartStudy}
            />
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-text-secondary">Loading...</div>
          ) : kanjiList.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              No kanji found for N{selectedLevel}. Content coming soon.
            </div>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {kanjiList.map((k) => {
                const primaryReading = k.kunReadings[0]?.split('.')[0] ?? k.onReadings[0] ?? '';
                const meaning = (k.meanings['en'] ?? [])[0] ?? '';
                const m = kanjiMastery.get(k.id);
                const mLevel = m ? getMasteryLevel(m.correctCount, m.incorrectCount) : 0;
                return (
                  <button
                    key={k.id}
                    onClick={() => setSelectedKanji(k)}
                    className={cn(
                      'rounded-xl border flex flex-col items-center justify-center cursor-pointer group hover:shadow-lg hover:scale-105 hover:border-accent transition-all py-2 px-1 relative',
                      mLevel >= 5
                        ? 'bg-[var(--color-feedback-gold-bg)] border-[var(--color-feedback-gold-border)]'
                        : mLevel >= 3
                          ? 'bg-[var(--color-feedback-success-bg)] border-[var(--color-feedback-success-border)]'
                          : 'bg-bg-secondary border-border'
                    )}
                    title={`${k.character} — ${(k.meanings['en'] ?? []).join(', ')}`}
                  >
                    {/* Star indicator */}
                    {isKanjiStarred('kanji', String(k.id)) && (
                      <Star size={9} className="absolute top-1 left-1 text-gold-500 fill-gold-500" />
                    )}
                    {/* Stroke count badge */}
                    <span className="absolute top-1 right-1.5 text-[8px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                      {k.strokeCount}画
                    </span>
                    {/* Character */}
                    <span className="text-2xl character-display text-text-primary group-hover:text-accent transition-colors jp-text leading-none">
                      {k.character}
                    </span>
                    {/* Primary reading */}
                    <span className="text-[9px] text-text-secondary mt-0.5 jp-text truncate max-w-full px-1">
                      {primaryReading}
                    </span>
                    {/* Meaning (on hover) */}
                    <span className="text-[8px] text-accent/70 opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-full px-1">
                      {meaning}
                    </span>
                    {/* Mastery dots */}
                    {mLevel > 0 && (
                      <div className="mt-1">
                        <MasteryIndicator level={mLevel} size="sm" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Quizlet-style Study Modes ── */}
      {viewMode === 'study-select' && (
        <StudyModeSelector
          itemCount={studyItems.length}
          onSelect={(mode: StudyMode) => setViewMode(`study-${mode}` as ViewMode)}
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

      {/* Radicals View */}
      {viewMode === 'radicals' && (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Radicals are the building blocks of kanji. Learn them to decode unfamiliar characters.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RADICALS_N5.map((r) => (
              <div key={r.radical} className="p-4 rounded-xl bg-bg-secondary border border-border hover:border-accent transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-accent jp-text w-14 text-center">{r.radical}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-primary">{r.meaning}</p>
                    <p className="text-xs text-text-secondary">{r.names.join(' / ')} &middot; {r.strokeCount} strokes</p>
                    <div className="flex gap-1.5 mt-1.5">
                      {r.exampleKanji.map((k) => (
                        <span key={k} className="text-base jp-text text-text-secondary bg-bg-primary rounded px-1.5 py-0.5 text-xs font-medium">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learn Mode — Group selector */}
      {viewMode === 'learn' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Choose a group to learn</h3>
            <span className="text-xs text-text-tertiary">
              {kanjiMastery.size > 0
                ? `${[...kanjiMastery.values()].filter((m) => m.masteryLevel >= 3).length} / ${kanjiList.length} mastered`
                : `${kanjiList.length} kanji available`}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {getGroupsForLevel(selectedLevel).map((group) => {
              const groupKanji = kanjiList.filter((k) => group.kanjiChars.includes(k.character));
              if (groupKanji.length === 0) return null;
              const masteredInGroup = groupKanji.filter((k) => {
                const m = kanjiMastery.get(k.id);
                return m && m.masteryLevel >= 3;
              }).length;
              const totalAnswered = groupKanji.reduce((sum, k) => {
                const m = kanjiMastery.get(k.id);
                return sum + (m ? m.correctCount + m.incorrectCount : 0);
              }, 0);
              const totalCorrect = groupKanji.reduce((sum, k) => {
                const m = kanjiMastery.get(k.id);
                return sum + (m ? m.correctCount : 0);
              }, 0);
              const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
              const isComplete = masteredInGroup === groupKanji.length;

              return (
                <motion.button
                  key={group.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setLessonGroup(group);
                    setViewMode('lesson');
                  }}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all cursor-pointer card-interactive',
                    isComplete
                      ? 'border-matcha-400 bg-[var(--color-feedback-success-bg)]'
                      : 'border-border bg-bg-secondary hover:border-accent/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-text-secondary">{group.label}</span>
                    {isComplete && <span className="text-xs text-matcha-600">Done</span>}
                  </div>
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {groupKanji.map((k) => {
                      const m = kanjiMastery.get(k.id);
                      const level = m ? getMasteryLevel(m.correctCount, m.incorrectCount) : 0;
                      return (
                        <span
                          key={k.id}
                          className={cn(
                            'text-lg jp-text character-display px-1 rounded transition-colors',
                            level >= 3 ? 'text-matcha-600 bg-[var(--color-feedback-success-bg)]' :
                            level >= 1 ? 'text-gold-600 bg-[var(--color-feedback-gold-bg)]' :
                            'text-text-primary'
                          )}
                        >
                          {k.character}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-text-tertiary">{masteredInGroup}/{groupKanji.length} mastered</span>
                    {totalAnswered > 0 && <span className="text-text-tertiary">{accuracy}% accuracy</span>}
                  </div>
                  {/* Micro progress bar */}
                  <div className="h-1 bg-bg-subtle rounded-full overflow-hidden mt-2">
                    <div
                      className={cn('h-full rounded-full transition-all', isComplete ? 'bg-matcha-500' : 'bg-accent')}
                      style={{ width: `${groupKanji.length > 0 ? (masteredInGroup / groupKanji.length) * 100 : 0}%` }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lesson Mode — Active lesson */}
      {viewMode === 'lesson' && lessonGroup && (
        <KanjiLesson
          characters={kanjiList.filter((k) => lessonGroup.kanjiChars.includes(k.character))}
          allKanji={kanjiList}
          onComplete={async () => {
            setViewMode('learn');
            setLessonGroup(null);
            // Refresh mastery
            if (user) {
              const mastery = await getMasteryForKanji(user.id, kanjiList.map((k) => k.id));
              setKanjiMastery(mastery);
            }
          }}
          onBack={() => {
            setViewMode('learn');
            setLessonGroup(null);
          }}
        />
      )}

      {/* Detail Modal */}
      <KanjiDetailModal
        kanji={selectedKanji}
        isOpen={selectedKanji !== null}
        onClose={() => setSelectedKanji(null)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Kanji Detail Modal
// ─────────────────────────────────────────────────────────────

function KanjiDetailModal({
  kanji,
  isOpen,
  onClose,
}: {
  kanji: KanjiDetail | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useUserStore();
  const [userMnemonic, setUserMnemonic] = useState('');
  const [mnemonicSaved, setMnemonicSaved] = useState(false);

  // Load user mnemonic when modal opens
  useEffect(() => {
    if (!kanji || !isOpen || !user) return;
    setMnemonicSaved(false);
    import('@/services/mnemonicService').then(({ getUserMnemonic }) => {
      getUserMnemonic(user.id, 'kanji', kanji.id).then((m) => {
        setUserMnemonic(m ?? '');
      });
    });
  }, [kanji, isOpen, user]);

  const handleSaveMnemonic = async () => {
    if (!user || !kanji) return;
    const { saveUserMnemonic, deleteUserMnemonic } = await import('@/services/mnemonicService');
    if (userMnemonic.trim()) {
      await saveUserMnemonic(user.id, 'kanji', kanji.id, userMnemonic.trim());
    } else {
      await deleteUserMnemonic(user.id, 'kanji', kanji.id);
    }
    setMnemonicSaved(true);
    setTimeout(() => setMnemonicSaved(false), 2000);
  };

  if (!kanji) return null;

  const meanings = kanji.meanings['en'] ?? [];

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
                className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-bg-secondary rounded-2xl border border-border shadow-2xl p-8 focus:outline-none"
              >
                <Dialog.Close asChild>
                  <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-subtle flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 1l12 12M13 1L1 13" />
                    </svg>
                  </button>
                </Dialog.Close>

                {/* Level badge */}
                <div className="flex justify-center mb-3">
                  <span
                    className="px-3 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: LEVEL_COLORS[kanji.jlptLevel] }}
                  >
                    N{kanji.jlptLevel}
                  </span>
                </div>

                {/* Character with stroke animation */}
                <div className="flex justify-center mb-4">
                  {getStrokeData(kanji.character) ? (
                    <StrokeAnimation
                      character={kanji.character}
                      size={160}
                      speed={Math.max(0.35, 0.7 - kanji.strokeCount * 0.03)}
                      loop={true}
                    />
                  ) : (
                    <span className="text-[100px] character-display text-text-primary leading-none jp-text">
                      {kanji.character}
                    </span>
                  )}
                </div>

                {/* Meanings + audio */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <p className="text-xl font-bold text-accent">
                    {meanings.join(', ')}
                  </p>
                  <AudioButton text={kanji.character} showSlow />
                </div>

                {/* Readings — color-coded, prominent */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-bg-primary rounded-xl p-4 border border-[var(--color-feedback-error-border)]">
                    <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider mb-2">
                      On'yomi (音読み) <span className="normal-case opacity-50">Chinese</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {kanji.onReadings.length > 0
                        ? kanji.onReadings.map((r, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-feedback-error-bg)] text-[var(--color-feedback-error-text)] text-base font-semibold jp-text">
                              {r}
                              <AudioButton text={r} />
                            </span>
                          ))
                        : <span className="text-text-secondary/40 text-base">—</span>}
                    </div>
                  </div>
                  <div className="bg-bg-primary rounded-xl p-4 border border-accent/20">
                    <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider mb-2">
                      Kun'yomi (訓読み) <span className="normal-case opacity-50">Japanese</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {kanji.kunReadings.length > 0
                        ? kanji.kunReadings.map((r, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-feedback-info-bg)] text-accent text-base font-semibold jp-text">
                              {r}
                              <AudioButton text={r} />
                            </span>
                          ))
                        : <span className="text-text-secondary/40 text-base">—</span>}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-bg-primary rounded-lg">
                    <p className="text-xs text-text-secondary">Strokes</p>
                    <p className="text-lg font-bold text-text-primary">{kanji.strokeCount}</p>
                  </div>
                  <div className="text-center p-2 bg-bg-primary rounded-lg">
                    <p className="text-xs text-text-secondary">Grade</p>
                    <p className="text-lg font-bold text-text-primary">{kanji.grade}</p>
                  </div>
                  <div className="text-center p-2 bg-bg-primary rounded-lg">
                    <p className="text-xs text-text-secondary">Radical</p>
                    <p className="text-lg font-bold text-text-primary jp-text">{kanji.radical}</p>
                  </div>
                </div>

                {/* Compound Words (熟語) */}
                {KANJI_COMPOUNDS[kanji.character] && KANJI_COMPOUNDS[kanji.character].length > 0 && (
                  <div className="bg-bg-primary rounded-xl p-4 mb-4">
                    <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-2">
                      Compound Words (熟語)
                    </p>
                    <div className="space-y-1.5">
                      {KANJI_COMPOUNDS[kanji.character].slice(0, 5).map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="inline-flex items-center gap-1 font-semibold text-text-primary jp-text min-w-[60px]">
                            {c.word}
                            <AudioButton text={c.word} />
                          </span>
                          <span className="text-accent/60 jp-text text-xs min-w-[70px]">{c.reading}</span>
                          <span className="text-text-secondary text-xs">{c.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mnemonic */}
                {kanji.mnemonic && (
                  <div className="bg-[var(--color-feedback-info-bg)] border border-[var(--color-feedback-info-border)] rounded-xl p-3 mb-4">
                    <p className="text-xs text-[var(--color-feedback-info-text)] font-semibold mb-1">Memory hint</p>
                    <p className="text-sm text-[var(--color-feedback-info-text)]">
                      {kanji.mnemonic}
                    </p>
                  </div>
                )}

                {/* User mnemonic */}
                <div className="bg-bg-primary rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-text-secondary font-semibold">Your Mnemonic</p>
                    {mnemonicSaved && <span className="text-[10px] text-matcha-500">Saved!</span>}
                  </div>
                  <textarea
                    value={userMnemonic}
                    onChange={(e) => setUserMnemonic(e.target.value)}
                    onBlur={handleSaveMnemonic}
                    placeholder="Add your own memory trick..."
                    className="w-full text-sm bg-transparent border border-border rounded-lg p-2 outline-none focus:border-accent resize-none text-text-primary placeholder:text-text-secondary/40"
                    rows={2}
                  />
                </div>

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

