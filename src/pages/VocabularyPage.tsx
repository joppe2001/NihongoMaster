import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ResultIcon } from '@/components/shared/ResultIcon';
import { MasteryIndicator } from '@/components/kana/MasteryIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import {
  getVocabByLevel,
  searchVocab,
  startStudyingVocabLevel,
} from '@/services/vocabService';
import { QuizFeedback } from '@/components/kana/QuizFeedback';
import { XP_REWARDS } from '@/lib/constants';
import { awardXp, recordReviewSession } from '@/services/progressService';
import type { VocabDetail } from '@/services/vocabService';
import type { JlptLevelId } from '@/lib/types';
import { AudioButton } from '@/hooks/useAudio';
import * as Dialog from '@radix-ui/react-dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { VocabLesson } from '@/components/vocab/VocabLesson';
import { getVocabGroupsForLevel, type VocabGroup } from '@/data/vocabGroups';
import { getMasteryForVocab, type VocabMastery } from '@/services/vocabMasteryService';
import { StudyModeSelector } from '@/components/study/StudyModeSelector';
import { FlashcardMode } from '@/components/study/FlashcardMode';
import { LearnMode } from '@/components/study/LearnMode';
import { TestMode } from '@/components/study/TestMode';
import { MatchMode } from '@/components/study/MatchMode';
import type { StudyItem, StudyMode } from '@/components/study/types';
import { useStarredStore } from '@/stores/starredStore';
import { Star } from '@/lib/icons';
import { SrsLevelStatus } from '@/components/shared/SrsLevelStatus';

type ViewMode = 'browse' | 'quiz-select' | 'quiz-meaning' | 'quiz-reading' | 'quiz-mc' | 'learn' | 'lesson'
  | 'study-select' | 'study-flashcards' | 'study-learn' | 'study-test' | 'study-match';

const POS_LABELS: Record<string, string> = {
  'noun': 'Noun',
  'verb': 'Verb',
  'i-adjective': 'i-Adj',
  'na-adjective': 'na-Adj',
  'adverb': 'Adverb',
  'pronoun': 'Pronoun',
  'expression': 'Expression',
  'particle': 'Particle',
};

const POS_COLORS: Record<string, string> = {
  'noun': '#3b82f6',
  'verb': '#22c55e',
  'i-adjective': '#a855f7',
  'na-adjective': '#ec4899',
  'adverb': '#f59e0b',
  'pronoun': '#06b6d4',
  'expression': '#64748b',
  'particle': '#ef4444',
};

const JLPT_COLORS: Record<number, string> = {
  5: '#22c55e',  // green  — easiest
  4: '#3b82f6',  // blue
  3: '#f59e0b',  // amber
  2: '#f97316',  // orange
  1: '#ef4444',  // red    — hardest
};

export function VocabularyPage() {
  const { user } = useUserStore();
  const [vocabList, setVocabList] = useState<VocabDetail[]>([]);
  const [filteredList, setFilteredList] = useState<VocabDetail[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<JlptLevelId>(5);
  const [selectedPos, setSelectedPos] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVocab, setSelectedVocab] = useState<VocabDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [lessonGroup, setLessonGroup] = useState<VocabGroup | null>(null);
  const [vocabMastery, setVocabMastery] = useState<Map<number, VocabMastery>>(new Map());

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getVocabByLevel(selectedLevel);
      setVocabList(data);
      setFilteredList(data);
      setIsLoading(false);
      if (user && data.length > 0) {
        const mastery = await getMasteryForVocab(user.id, data.map((v) => v.id));
        setVocabMastery(mastery);
      }
    }
    load();
  }, [selectedLevel, user]);

  // Re-fetch mastery whenever the page becomes visible again (e.g. after typing practice)
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== 'visible' || !user || vocabList.length === 0) return;
      getMasteryForVocab(user.id, vocabList.map((v) => v.id)).then(setVocabMastery);
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [user, vocabList]);

  // Filter by POS
  useEffect(() => {
    if (selectedPos === 'all') {
      setFilteredList(vocabList);
    } else {
      setFilteredList(vocabList.filter((v) => v.partOfSpeech === selectedPos));
    }
  }, [selectedPos, vocabList]);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length === 0) {
      const data = await getVocabByLevel(selectedLevel);
      setVocabList(data);
    } else {
      const results = await searchVocab(q.trim());
      // Only show words that belong to the currently selected level tab
      const scoped = results.filter((v) => v.jlptLevel === selectedLevel);
      setVocabList(scoped);
      // Reload mastery for the fresh result set
      if (user && scoped.length > 0) {
        const mastery = await getMasteryForVocab(user.id, scoped.map((v) => v.id));
        setVocabMastery(mastery);
      }
    }
  }, [selectedLevel, user]);

  const handleStartStudy = async () => {
    if (!user) return;
    await startStudyingVocabLevel(user.id, selectedLevel);
  };

  const { isStarred: isVocabStarred } = useStarredStore();

  // Build StudyItems from current filtered list (for Quizlet-style modes)
  const studyItems = useMemo((): StudyItem[] =>
    filteredList.map((v) => ({
      id: String(v.id),
      term: v.word,
      termExtra: v.reading,
      definition: (v.meanings['en'] ?? []).join(', ') || v.word,
      definitionExtra: POS_LABELS[v.partOfSpeech] ?? v.partOfSpeech,
      audio: v.word,
      contentType: 'vocab' as const,
    })),
  [filteredList]);

  // Get unique POS values from current data
  const posOptions = [...new Set(vocabList.map((v) => v.partOfSpeech))].sort();

  const isInActiveLesson = viewMode === 'lesson' || viewMode === 'study-flashcards' || viewMode === 'study-learn' || viewMode === 'study-test' || viewMode === 'study-match' || viewMode === 'quiz-meaning' || viewMode === 'quiz-reading' || viewMode === 'quiz-mc';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Vocabulary"
        subtitle="Build your Japanese word bank"
        jpTitle="語彙"
        theme="matcha"
        action={
          !isInActiveLesson ? (
            <div className="flex gap-1.5">
              <button
                onClick={() => setViewMode('learn')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                  viewMode === 'learn' ? 'bg-white text-matcha-600' : 'bg-white/20 text-white/80 hover:bg-white/30'
                )}
              >
                Learn
              </button>
              <button
                onClick={() => setViewMode('browse')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                  viewMode === 'browse' ? 'bg-white text-matcha-600' : 'bg-white/20 text-white/80 hover:bg-white/30'
                )}
              >
                Browse
              </button>
              <button
                onClick={() => setViewMode('study-select')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                  viewMode === 'study-select' || viewMode === 'quiz-select' ? 'bg-white text-matcha-600' : 'bg-white/20 text-white/80 hover:bg-white/30'
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
              onClick={() => { setSelectedLevel(level); setSearchQuery(''); setSelectedPos('all'); }}
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

      {/* ── Quizlet-style Study Mode Selector ── */}
      {viewMode === 'study-select' && (
        <StudyModeSelector
          itemCount={studyItems.length}
          onSelect={(mode: StudyMode) => setViewMode(`study-${mode}` as ViewMode)}
          onBack={() => setViewMode('browse')}
        />
      )}

      {/* ── Flashcards ── */}
      {viewMode === 'study-flashcards' && (
        <FlashcardMode
          items={studyItems}
          onBack={() => setViewMode('study-select')}
        />
      )}

      {/* ── Learn (adaptive MC → written) ── */}
      {viewMode === 'study-learn' && (
        <LearnMode
          items={studyItems}
          onBack={() => setViewMode('study-select')}
        />
      )}

      {/* ── Test (mixed, graded) ── */}
      {viewMode === 'study-test' && (
        <TestMode
          items={studyItems}
          onBack={() => setViewMode('study-select')}
        />
      )}

      {/* ── Match (timed game) ── */}
      {viewMode === 'study-match' && (
        <MatchMode
          items={studyItems}
          onBack={() => setViewMode('study-select')}
        />
      )}

      {/* Legacy Quiz Mode Selector (kept for backward compat, hidden behind study-select now) */}
      {viewMode === 'quiz-select' && (
        <StudyModeSelector
          itemCount={studyItems.length}
          onSelect={(mode: StudyMode) => setViewMode(`study-${mode}` as ViewMode)}
          onBack={() => setViewMode('browse')}
        />
      )}

      {/* Legacy Vocab Quizzes — still work if navigated directly */}
      {(viewMode === 'quiz-meaning' || viewMode === 'quiz-reading') && (
        <VocabTypeQuiz
          vocabList={vocabList}
          quizType={viewMode === 'quiz-meaning' ? 'meaning' : 'reading'}
          onDone={() => setViewMode('browse')}
        />
      )}
      {viewMode === 'quiz-mc' && (
        <VocabMCQuiz vocabList={vocabList} onDone={() => setViewMode('browse')} />
      )}

      {/* Browse content */}
      {viewMode === 'browse' && <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by word, reading, or meaning..."
        className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-secondary text-text-primary text-sm outline-none focus:border-accent"
      />}

      {/* Part-of-Speech Filter */}
      {viewMode === 'browse' && <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setSelectedPos('all')}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer',
            selectedPos === 'all'
              ? 'bg-accent text-white'
              : 'bg-bg-secondary border border-border text-text-secondary hover:text-text-primary'
          )}
        >
          All ({vocabList.length})
        </button>
        {posOptions.map((pos) => {
          const count = vocabList.filter((v) => v.partOfSpeech === pos).length;
          return (
            <button
              key={pos}
              onClick={() => setSelectedPos(pos)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer',
                selectedPos === pos
                  ? 'text-white'
                  : 'bg-bg-secondary border border-border text-text-secondary hover:text-text-primary'
              )}
              style={selectedPos === pos ? { backgroundColor: POS_COLORS[pos] ?? '#64748b' } : {}}
            >
              {POS_LABELS[pos] ?? pos} ({count})
            </button>
          );
        })}
      </div>}

      {/* SRS status + enroll/remove */}
      {viewMode === 'browse' && (
        <SrsLevelStatus
          userId={user?.id}
          contentType="vocab"
          contentLabel="vocabulary"
          level={selectedLevel}
          onAdd={handleStartStudy}
        />
      )}

      {/* Word List */}
      {viewMode === 'browse' && (isLoading ? (
        <div className="text-center py-12 text-text-secondary">Loading...</div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          No vocabulary found for N{selectedLevel}. Content coming soon.
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredList.map((v) => {
            const meanings = v.meanings['en'] ?? [];
            const mastery = vocabMastery.get(v.id);
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVocab(v)}
                className="w-full flex items-center gap-4 p-3 rounded-xl bg-bg-secondary border border-border hover:border-accent hover:shadow-sm transition-all cursor-pointer text-left group"
              >
                {/* Word */}
                <span className="text-lg font-semibold text-text-primary min-w-[120px] jp-text group-hover:text-accent transition-colors">
                  {v.word}
                </span>
                {/* Reading */}
                <span className="text-sm text-accent/70 min-w-[100px] jp-text">
                  {v.reading}
                </span>
                {/* JLPT level badge */}
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold shrink-0 tabular-nums"
                  style={{ backgroundColor: JLPT_COLORS[v.jlptLevel] ?? '#64748b' }}
                >
                  N{v.jlptLevel}
                </span>
                {/* POS badge */}
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium shrink-0"
                  style={{ backgroundColor: POS_COLORS[v.partOfSpeech] ?? '#64748b' }}
                >
                  {POS_LABELS[v.partOfSpeech] ?? v.partOfSpeech}
                </span>
                {/* Meaning */}
                <span className="text-sm text-text-secondary flex-1 truncate">
                  {meanings.join(', ')}
                </span>
                {/* Starred indicator */}
                {isVocabStarred('vocab', String(v.id)) && (
                  <Star size={13} className="shrink-0 text-gold-500 fill-gold-500" />
                )}
                {/* Mastery indicator (dots) — shown only when the user has attempted this word */}
                {mastery && mastery.masteryLevel > 0 && (
                  <div className="shrink-0">
                    <MasteryIndicator level={mastery.masteryLevel} size="sm" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}

      {/* Learn Mode — Group selector */}
      {viewMode === 'learn' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Choose a group to learn</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {getVocabGroupsForLevel(selectedLevel).map((group) => {
              // Filter vocab for this group
              const groupVocab = vocabList.filter((v) => {
                if (group.tags && v.tags.some((t) => group.tags!.includes(t))) return true;
                if (group.pos && group.pos.includes(v.partOfSpeech)) return true;
                return false;
              }).slice(0, group.maxItems ?? 10);
              if (groupVocab.length === 0) return null;

              const masteredCount = groupVocab.filter((v) => {
                const m = vocabMastery.get(v.id);
                return m && m.masteryLevel >= 3;
              }).length;
              const isComplete = masteredCount === groupVocab.length;

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
                    <span className="text-xs font-semibold text-text-secondary">{group.label}</span>
                    {isComplete && <span className="text-xs text-matcha-600">Done</span>}
                  </div>
                  <p className="text-[11px] text-text-tertiary mb-2">{groupVocab.length} words</p>
                  <div className="flex gap-1 flex-wrap mb-2">
                    {groupVocab.slice(0, 5).map((v) => (
                      <span key={v.id} className="text-xs jp-text text-text-primary bg-bg-primary rounded px-1">{v.word}</span>
                    ))}
                    {groupVocab.length > 5 && <span className="text-xs text-text-tertiary">+{groupVocab.length - 5}</span>}
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-text-tertiary">{masteredCount}/{groupVocab.length} mastered</span>
                  </div>
                  <div className="h-1 bg-bg-subtle rounded-full overflow-hidden mt-2">
                    <div className={cn('h-full rounded-full transition-all', isComplete ? 'bg-matcha-500' : 'bg-accent')} style={{ width: `${groupVocab.length > 0 ? (masteredCount / groupVocab.length) * 100 : 0}%` }} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lesson Mode */}
      {viewMode === 'lesson' && lessonGroup && (() => {
        const groupVocab = vocabList.filter((v) => {
          if (lessonGroup.tags && v.tags.some((t) => lessonGroup.tags!.includes(t))) return true;
          if (lessonGroup.pos && lessonGroup.pos.includes(v.partOfSpeech)) return true;
          return false;
        }).slice(0, lessonGroup.maxItems ?? 10);
        return (
          <VocabLesson
            words={groupVocab}
            allVocab={vocabList}
            onComplete={async () => {
              setViewMode('learn');
              setLessonGroup(null);
              if (user) { const m = await getMasteryForVocab(user.id, vocabList.map((v) => v.id)); setVocabMastery(m); }
            }}
            onBack={() => { setViewMode('learn'); setLessonGroup(null); }}
          />
        );
      })()}

      {/* Detail Modal */}
      <VocabDetailModal
        vocab={selectedVocab}
        isOpen={selectedVocab !== null}
        onClose={() => setSelectedVocab(null)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Vocabulary Detail Modal
// ─────────────────────────────────────────────────────────────

function VocabDetailModal({
  vocab,
  isOpen,
  onClose,
}: {
  vocab: VocabDetail | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!vocab) return null;

  const meanings = vocab.meanings['en'] ?? [];

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
                className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-bg-secondary rounded-2xl border border-border shadow-2xl p-8 focus:outline-none"
              >
                <Dialog.Close asChild>
                  <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-subtle flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 1l12 12M13 1L1 13" />
                    </svg>
                  </button>
                </Dialog.Close>

                {/* POS badge */}
                <div className="flex justify-center mb-4">
                  <span
                    className="px-3 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: POS_COLORS[vocab.partOfSpeech] ?? '#64748b' }}
                  >
                    {POS_LABELS[vocab.partOfSpeech] ?? vocab.partOfSpeech}
                  </span>
                </div>

                {/* Word + Audio */}
                <div className="text-center mb-1 flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold text-text-primary jp-text">
                    {vocab.word}
                  </span>
                   <AudioButton text={vocab.word} showSlow />
                </div>

                {/* Reading */}
                <p className="text-center text-xl text-accent jp-text mb-4">
                  {vocab.reading}
                </p>

                {/* Meanings */}
                <div className="bg-bg-primary rounded-xl p-4 mb-4">
                  <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-2">
                    Meanings
                  </p>
                  <ul className="space-y-1">
                    {meanings.map((m, i) => (
                      <li key={i} className="text-sm text-text-primary flex items-start gap-2">
                        <span className="text-accent font-bold mt-0.5">{i + 1}.</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                {vocab.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {vocab.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-bg-subtle text-[10px] font-medium text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
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

// ─────────────────────────────────────────────────────────────
// Vocab Type Quiz (Meaning / Reading)
// ─────────────────────────────────────────────────────────────

function VocabTypeQuiz({
  vocabList,
  quizType,
  onDone,
}: {
  vocabList: VocabDetail[];
  quizType: 'meaning' | 'reading';
  onDone: () => void;
}) {
  const { user, addXp } = useUserStore();
  const [questions] = useState(() =>
    [...vocabList].sort(() => Math.random() - 0.5).slice(0, 20)
  );
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const current = questions[index];
  const isFinished = index >= questions.length;

  const checkAnswer = () => {
    if (!current || result) return;
    const trimmed = answer.trim().toLowerCase();
    let isCorrect = false;

    if (quizType === 'meaning') {
      const meanings = current.meanings['en'] ?? [];
      isCorrect = meanings.some((m) => m.toLowerCase() === trimmed);
    } else {
      isCorrect = trimmed === current.reading;
    }

    setResult(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setXpEarned((x) => x + XP_REWARDS.quiz_correct);
    }
  };

  const next = () => {
    setIndex((i) => i + 1);
    setAnswer('');
    setResult(null);
  };

  // Save XP on completion
  useEffect(() => {
    if (!isFinished || !user) return;
    async function save() {
      if (!user) return;
      const xp = correctCount * XP_REWARDS.quiz_correct;
      const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
      await recordReviewSession(user.id, questions.length, 0, 0, accuracy, xp);
      await awardXp(user.id, xp);
      addXp(xp);
    }
    save();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  if (questions.length === 0) {
    return <div className="text-center py-12 text-text-secondary">No vocabulary available for quiz.</div>;
  }

  if (isFinished) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-bg-secondary rounded-2xl border border-border p-12 text-center">
        <ResultIcon accuracy={accuracy} />
        <h3 className="text-2xl font-bold text-text-primary mb-2">Quiz Complete!</h3>
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-6">
          <div><p className="text-3xl font-bold text-matcha-500">{correctCount}</p><p className="text-xs text-text-secondary">Correct</p></div>
          <div><p className="text-3xl font-bold text-sakura-500">{questions.length - correctCount}</p><p className="text-xs text-text-secondary">Missed</p></div>
          <div><p className="text-3xl font-bold text-accent">{accuracy}%</p><p className="text-xs text-text-secondary">Accuracy</p></div>
          <div><p className="text-3xl font-bold text-gold-500">+{xpEarned}</p><p className="text-xs text-text-secondary">XP</p></div>
        </div>
        <button onClick={onDone} className="px-6 py-2 bg-accent text-white rounded-lg cursor-pointer">Done</button>
      </motion.div>
    );
  }

  if (!current) return null;

  const meanings = current.meanings['en'] ?? [];
  const isReading = quizType === 'reading';

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-bg-secondary rounded-2xl border border-border p-12 text-center pb-24"
        >
          <div className="flex items-center gap-3 mb-8 max-w-xs mx-auto">
            <div className="flex-1 h-2 bg-bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
            </div>
            <span className="text-xs text-text-secondary">{index + 1}/{questions.length}</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl font-bold text-text-primary jp-text inline-block">{current.word}</span>
            <AudioButton text={current.word} showSlow />
          </div>
          {isReading && (
            <p className="text-text-secondary/70 mt-1 text-sm">{meanings.join(', ')}</p>
          )}
          <p className="text-text-secondary mt-3 mb-4 text-sm">
            {isReading ? 'Type the hiragana reading' : 'Type the English meaning'}
          </p>

          <div className="max-w-xs mx-auto">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { result ? next() : checkAnswer(); } }}
              disabled={result !== null}
              autoFocus
              className={cn(
                'w-full text-center text-xl py-3 px-4 rounded-xl border-2 outline-none transition-colors',
                isReading && 'jp-text',
                result === 'correct' && 'border-matcha-500 bg-matcha-50 text-matcha-700',
                result === 'incorrect' && 'border-sakura-500 bg-sakura-50 text-sakura-700',
                !result && 'border-border focus:border-accent bg-bg-primary text-text-primary'
              )}
              placeholder={isReading ? 'reading...' : 'meaning...'}
            />
          </div>

          {!result && (
            <button onClick={checkAnswer} disabled={!answer.trim()} className="mt-6 px-8 py-2.5 bg-accent text-white rounded-xl font-medium disabled:opacity-30 cursor-pointer">
              Check
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {result && (
        <QuizFeedback
          isVisible={result !== null}
          isCorrect={result === 'correct'}
          correctAnswer={isReading ? current.reading : meanings.join(', ')}
          onContinue={next}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Vocab Multiple Choice Quiz
// ─────────────────────────────────────────────────────────────

function VocabMCQuiz({
  vocabList,
  onDone,
}: {
  vocabList: VocabDetail[];
  onDone: () => void;
}) {
  const { user, addXp } = useUserStore();
  const [questions] = useState(() =>
    [...vocabList].sort(() => Math.random() - 0.5).slice(0, 20)
  );
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<VocabDetail[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const current = questions[index];
  const isFinished = index >= questions.length;

  // Generate choices for current question
  useEffect(() => {
    if (!current) return;
    const distractors = vocabList
      .filter((v) => v.id !== current.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    setChoices([current, ...distractors].sort(() => Math.random() - 0.5));
  }, [index, current, vocabList]);

  const handleSelect = (choiceIdx: number) => {
    if (result) return;
    const chosen = choices[choiceIdx];
    const isCorrect = chosen.id === current.id;
    setSelected(choiceIdx);
    setResult(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setXpEarned((x) => x + XP_REWARDS.quiz_correct);
    }
  };

  const next = () => {
    setIndex((i) => i + 1);
    setSelected(null);
    setResult(null);
  };

  // Keyboard: 1-4 for choices
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isFinished) return;
      if (!result && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        handleSelect(parseInt(e.key) - 1);
      }
      if (result && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // Save XP on completion
  useEffect(() => {
    if (!isFinished || !user) return;
    async function save() {
      if (!user) return;
      const xp = correctCount * XP_REWARDS.quiz_correct;
      const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
      await recordReviewSession(user.id, questions.length, 0, 0, accuracy, xp);
      await awardXp(user.id, xp);
      addXp(xp);
    }
    save();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  if (questions.length === 0) {
    return <div className="text-center py-12 text-text-secondary">No vocabulary available for quiz.</div>;
  }

  if (isFinished) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-bg-secondary rounded-2xl border border-border p-12 text-center">
        <ResultIcon accuracy={accuracy} />
        <h3 className="text-2xl font-bold text-text-primary mb-2">Quiz Complete!</h3>
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-6">
          <div><p className="text-3xl font-bold text-matcha-500">{correctCount}</p><p className="text-xs text-text-secondary">Correct</p></div>
          <div><p className="text-3xl font-bold text-sakura-500">{questions.length - correctCount}</p><p className="text-xs text-text-secondary">Missed</p></div>
          <div><p className="text-3xl font-bold text-accent">{accuracy}%</p><p className="text-xs text-text-secondary">Accuracy</p></div>
          <div><p className="text-3xl font-bold text-gold-500">+{xpEarned}</p><p className="text-xs text-text-secondary">XP</p></div>
        </div>
        <button onClick={onDone} className="px-6 py-2 bg-accent text-white rounded-lg cursor-pointer">Done</button>
      </motion.div>
    );
  }

  if (!current) return null;
  const meanings = current.meanings['en'] ?? [];

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-bg-secondary rounded-2xl border border-border p-12 text-center pb-24"
        >
          <div className="flex items-center gap-3 mb-8 max-w-xs mx-auto">
            <div className="flex-1 h-2 bg-bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
            </div>
            <span className="text-xs text-text-secondary">{index + 1}/{questions.length}</span>
          </div>

          <p className="text-2xl font-bold text-accent mb-1">{meanings.join(', ')}</p>
          <p className="text-text-secondary text-sm mb-6">Which word matches this meaning?</p>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {choices.map((choice, i) => {
              const isSelected = selected === i;
              const isCorrectChoice = choice.id === current.id;
              let cls = 'border-border hover:border-accent';
              if (result) {
                if (isCorrectChoice) cls = 'border-matcha-500 bg-[var(--color-feedback-success-bg)]';
                else if (isSelected) cls = 'border-sakura-500 bg-[var(--color-feedback-error-bg)]';
                else cls = 'border-border opacity-40';
              }
              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(i)}
                  disabled={result !== null}
                  className={cn('p-4 rounded-xl border-2 transition-all cursor-pointer text-center', cls)}
                >
                  <span className="text-2xl font-semibold text-text-primary jp-text">{choice.word}</span>
                  <span className="block text-xs text-text-secondary jp-text mt-0.5">{choice.reading}</span>
                  <span className="block text-[10px] text-text-secondary/50 mt-1">{i + 1}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {result && (
        <QuizFeedback
          isVisible={result !== null}
          isCorrect={result === 'correct'}
          correctAnswer={`${current.word} (${current.reading})`}
          onContinue={next}
        />
      )}
    </div>
  );
}
