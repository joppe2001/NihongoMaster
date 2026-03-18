import { useState, useEffect, useCallback, useMemo } from 'react';
import { query } from '@/lib/db';
import { cn } from '@/lib/utils';
import { KanaGrid } from '@/components/kana/KanaGrid';
import { KanaStudyCard } from '@/components/kana/KanaStudyCard';
import { KanaQuiz } from '@/components/kana/KanaQuiz';
import { KanaMultipleChoiceQuiz } from '@/components/kana/KanaMultipleChoiceQuiz';
import { KanaLesson, getKanaRowGroups } from '@/components/kana/KanaLesson';
import { KanaDetailModal } from '@/components/kana/KanaDetailModal';
import { DrawingCanvas } from '@/components/kana/DrawingCanvas';
import { StrokeAnimation } from '@/components/kana/StrokeAnimation';
import { PageHeader } from '@/components/shared/PageHeader';
import { useUserStore } from '@/stores/userStore';
import { getMasteryForKana, getRowGroupProgress } from '@/services/kanaMasteryService';
import type { KanaMastery, RowGroupProgress } from '@/services/kanaMasteryService';
import type { QuizState } from '@/components/kana/KanaQuiz';
import { StudyModeSelector } from '@/components/study/StudyModeSelector';
import { FlashcardMode } from '@/components/study/FlashcardMode';
import { LearnMode } from '@/components/study/LearnMode';
import { TestMode } from '@/components/study/TestMode';
import { MatchMode } from '@/components/study/MatchMode';
import type { StudyItem, StudyMode } from '@/components/study/types';
import { useStarredStore } from '@/stores/starredStore';

interface KanaItem {
  id: number;
  character: string;
  romaji: string;
  row_group: string;
  stroke_count: number;
}

type ViewMode = 'grid' | 'study' | 'learn' | 'lesson' | 'quiz' | 'quiz-mc' | 'quiz-select' | 'practice'
  | 'study-select' | 'study-flashcards' | 'study-learn' | 'study-test' | 'study-match';

export function HiraganaPage() {
  const { user } = useUserStore();
  const [kanaList, setKanaList] = useState<KanaItem[]>([]);
  const [selectedKana, setSelectedKana] = useState<KanaItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [modalKana, setModalKana] = useState<KanaItem | null>(null);
  const [mastery, setMastery] = useState<Map<number, KanaMastery>>(new Map());
  const [lessonChars, setLessonChars] = useState<KanaItem[]>([]);
  const [hasActiveLesson, setHasActiveLesson] = useState(false);
  const [_savedViewMode, setSavedViewMode] = useState<ViewMode | null>(null);
  const [rowProgress, setRowProgress] = useState<RowGroupProgress[]>([]);

  useEffect(() => {
    async function loadKana() {
      const data = await query<KanaItem>(
        "SELECT id, character, romaji, row_group, stroke_count FROM kana WHERE type = 'hiragana' ORDER BY sort_order"
      );
      setKanaList(data);
    }
    loadKana();
  }, []);

  // Load mastery data
  const loadMastery = useCallback(async () => {
    if (!user || kanaList.length === 0) return;
    const [m, rp] = await Promise.all([
      getMasteryForKana(user.id, kanaList.map((k) => k.id)),
      getRowGroupProgress(user.id, 'hiragana'),
    ]);
    setMastery(m);
    setRowProgress(rp);
  }, [user, kanaList]);

  useEffect(() => { loadMastery(); }, [loadMastery]);

  const [practiceIndex, setPracticeIndex] = useState(0);

  const { getStarredSet } = useStarredStore();
  const kanaStarredIds = getStarredSet('kana');

  // Build StudyItems for Quizlet-style modes
  const studyItems = useMemo((): StudyItem[] =>
    kanaList.map((k) => ({
      id: String(k.id),
      term: k.character,
      definition: k.romaji,
      contentType: 'kana' as const,
    })),
  [kanaList]);

  const handleModeSwitch = (mode: ViewMode) => {
    // If switching away from an active lesson, save that we have one
    if (viewMode === 'lesson' && mode !== 'lesson') {
      setSavedViewMode(viewMode);
    }
    // If clicking "Learn" and we have an active lesson, resume it
    if (mode === 'learn' && hasActiveLesson) {
      setViewMode('lesson');
      return;
    }
    setViewMode(mode);
    if (mode === 'quiz') {
      setViewMode('study-select'); // go straight to new Quizlet-style selector
    }
    if (mode === 'learn') {
      setViewMode('learn');
    }
    if (mode === 'study' && !selectedKana && kanaList.length > 0) {
      setSelectedKana(kanaList[0]);
    }
    if (mode === 'practice') {
      setPracticeIndex(0);
    }
  };

  const handleGridClick = (kana: KanaItem) => {
    setModalKana(kana);
  };

  const handleStudyFromModal = (kana: KanaItem) => {
    setModalKana(null);
    setSelectedKana(kana);
    setViewMode('study');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Colorful Header */}
      <PageHeader
        title="Hiragana"
        subtitle={`${kanaList.length} characters — The foundation of Japanese writing`}
        jpTitle="ひらがな"
        theme="sakura"
        action={
          <div className="flex gap-1.5">
            {(['grid', 'learn', 'quiz', 'practice'] as ('grid' | 'learn' | 'quiz' | 'practice')[]).map((mode) => {
              const isLearnActive = mode === 'learn' && (viewMode === 'learn' || viewMode === 'lesson' || viewMode === 'study');
              const isQuizActive = mode === 'quiz' && (viewMode === 'quiz-select' || viewMode === 'quiz' || viewMode === 'quiz-mc' || viewMode.startsWith('study'));
              const isActive = mode === viewMode || isLearnActive || isQuizActive;
              return (
                <button
                  key={mode}
                  onClick={() => handleModeSwitch(mode)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                    isActive
                      ? 'bg-white text-sakura-600'
                      : 'bg-white/20 text-white/80 hover:bg-white/30 hover:text-white'
                  )}
                >
                  {mode === 'practice' ? 'Write' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              );
            })}
          </div>
        }
      />

      {/* Mastery summary */}
      {viewMode === 'grid' && mastery.size > 0 && (
        <p className="text-xs text-text-secondary">
          {[...mastery.values()].filter((m) => m.masteryLevel >= 5).length}/{kanaList.length} mastered
        </p>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <KanaGrid
          kanaList={kanaList}
          onSelectKana={handleGridClick}
          type="hiragana"
          mastery={mastery}
          starredIds={kanaStarredIds}
        />
      )}

      {/* Learn: Row selector */}
      {viewMode === 'learn' && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Choose a row to learn. Each lesson introduces characters one by one, then quizzes you.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {getKanaRowGroups(kanaList).map(({ group, label, chars }) => {
              const rp = rowProgress.find((r) => r.rowGroup === group);
              const masteredCount = rp?.masteredCount ?? chars.filter((c) => (mastery.get(c.id)?.masteryLevel ?? 0) >= 3).length;
              const totalChars = rp?.totalChars ?? chars.length;
              const accuracy = rp?.avgAccuracy ?? 0;
              const allMastered = masteredCount >= totalChars;
              return (
                <button
                  key={group}
                  onClick={() => { setLessonChars(chars); setHasActiveLesson(true); setViewMode('lesson'); }}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all cursor-pointer hover:shadow-md',
                    allMastered
                      ? 'border-matcha-300 bg-[var(--color-feedback-success-bg)] hover:border-matcha-400'
                      : 'border-border bg-bg-secondary hover:border-accent'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg font-bold jp-text text-text-primary">
                      {chars.map((c) => c.character).join(' ')}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-text-secondary">{label}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-text-secondary/60">
                      {masteredCount}/{totalChars} learned {allMastered && ' ✓'}
                    </p>
                    {accuracy > 0 && (
                      <p className="text-[10px] text-accent/60">{accuracy}%</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active lesson — rendered but hidden when on other tabs to preserve state */}
      {hasActiveLesson && (
        <div style={{ display: viewMode === 'lesson' ? 'block' : 'none' }}>
          <KanaLesson
            characters={lessonChars}
            allKana={kanaList}
            onComplete={() => { setHasActiveLesson(false); setSavedViewMode(null); setViewMode('learn'); loadMastery(); }}
            onBack={() => { setHasActiveLesson(false); setSavedViewMode(null); setViewMode('learn'); loadMastery(); }}
          />
        </div>
      )}

      {/* Study View */}
      {viewMode === 'study' && selectedKana && (
        <KanaStudyCard
          kana={selectedKana}
          allKana={kanaList}
          onSelect={setSelectedKana}
        />
      )}

      {viewMode === 'study' && !selectedKana && (
        <div className="text-center py-20 text-text-secondary">
          <p className="text-6xl character-display mb-4">あ</p>
          <p>Select a character from the Grid view to study it</p>
        </div>
      )}

      {/* ── Quizlet-style Study Mode Selector (replaces old quiz-select) ── */}
      {(viewMode === 'quiz-select' || viewMode === 'study-select') && (
        <StudyModeSelector
          itemCount={studyItems.length}
          onSelect={(mode: StudyMode) => setViewMode(`study-${mode}` as ViewMode)}
          onBack={() => setViewMode('grid')}
        />
      )}

      {/* ── Flashcards ── */}
      {viewMode === 'study-flashcards' && (
        <FlashcardMode items={studyItems} onBack={() => setViewMode('study-select')} />
      )}

      {/* ── Learn (adaptive) ── */}
      {viewMode === 'study-learn' && (
        <LearnMode items={studyItems} onBack={() => setViewMode('study-select')} />
      )}

      {/* ── Test ── */}
      {viewMode === 'study-test' && (
        <TestMode items={studyItems} onBack={() => setViewMode('study-select')} />
      )}

      {/* ── Match ── */}
      {viewMode === 'study-match' && (
        <MatchMode items={studyItems} onBack={() => setViewMode('study-select')} />
      )}

      {/* Legacy: Kana type-answer quiz (still reachable from lesson flow) */}
      {viewMode === 'quiz' && quizState && (
        <KanaQuiz state={quizState} setState={(s) => { setQuizState(s); if (!s) { setViewMode('grid'); loadMastery(); } }} />
      )}

      {/* Legacy: Kana MC quiz */}
      {viewMode === 'quiz-mc' && (
        <KanaMultipleChoiceQuiz allKana={kanaList} onComplete={() => { setViewMode('grid'); loadMastery(); }} />
      )}

      {/* Practice (Drawing) View */}
      {viewMode === 'practice' && kanaList.length > 0 && (
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            {/* Reference: stroke animation */}
            <div className="flex flex-col items-center">
              <p className="text-xs text-text-secondary mb-2">Reference</p>
              <StrokeAnimation character={kanaList[practiceIndex]?.character ?? 'あ'} size={140} speed={0.75} loop />
            </div>
            {/* Drawing canvas */}
            <div className="flex flex-col items-center">
              <p className="text-xs text-text-secondary mb-2">Your writing</p>
              <DrawingCanvas character={kanaList[practiceIndex]?.character ?? 'あ'} size={280} />
            </div>
          </div>
          {/* Character info */}
          <div className="text-center">
            <p className="text-sm text-text-secondary">
              <span className="text-lg font-bold text-text-primary jp-text">{kanaList[practiceIndex]?.character}</span>
              {' — '}
              <span className="font-medium">{kanaList[practiceIndex]?.romaji}</span>
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Character {practiceIndex + 1} of {kanaList.length}
            </p>
          </div>
          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={() => setPracticeIndex((i) => Math.max(0, i - 1))}
              disabled={practiceIndex === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-bg-secondary border border-border text-text-secondary hover:text-text-primary cursor-pointer disabled:opacity-30 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPracticeIndex((i) => Math.min(kanaList.length - 1, i + 1))}
              disabled={practiceIndex >= kanaList.length - 1}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white cursor-pointer disabled:opacity-30 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal (opens on grid click) */}
      <KanaDetailModal
        kana={modalKana}
        isOpen={modalKana !== null}
        onClose={() => setModalKana(null)}
        onStudy={handleStudyFromModal}
        type="hiragana"
      />
    </div>
  );
}
