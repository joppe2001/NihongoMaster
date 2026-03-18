import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { FuriganaText } from '@/components/shared/FuriganaText';
import { AudioButton } from '@/hooks/useAudio';
import { useUserStore } from '@/stores/userStore';
import { awardXp, recordReviewSession } from '@/services/progressService';
import { READING_STORIES } from '@/data/readingStories';
import type { ReadingStory } from '@/data/readingStories';
import { INTERACTIVE_STORIES } from '@/data/interactiveStories';
import type { InteractiveStory } from '@/data/interactiveStories';
import { InteractiveStoryReader } from '@/components/reading/InteractiveStoryReader';
import { PageHeader } from '@/components/shared/PageHeader';
import { BookOpen, Sparkles } from '@/lib/icons';

type PageTab = 'interactive' | 'mini';
type ReadingMode = 'list' | 'reading' | 'quiz';

const THEME_ICONS: Record<string, string> = {
  school: '🏫', adventure: '⚔', 'daily-life': '☀', fantasy: '✦', food: '🍙', travel: '🚅',
};

const DIFFICULTY_LABELS = ['', 'Beginner', 'Elementary', 'Intermediate', 'Upper-Int', 'Advanced'];
const FOCUS_LABELS: Record<string, string> = {
  hiragana: 'ひらがな heavy',
  katakana: 'カタカナ heavy',
  mixed: 'Mixed writing',
  kanji: '漢字 heavy',
};

export function ReadingPage() {
  const { user, addXp } = useUserStore();
  const [tab, setTab] = useState<PageTab>('interactive');

  // Mini-story state
  const [mode, setMode] = useState<ReadingMode>('list');
  const [selectedStory, setSelectedStory] = useState<ReadingStory | null>(null);
  const [currentSentence, setCurrentSentence] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizCorrect, setQuizCorrect] = useState(0);

  // Interactive story state
  const [activeStory, setActiveStory] = useState<InteractiveStory | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);

  const startMiniStory = (story: ReadingStory) => {
    setSelectedStory(story);
    setCurrentSentence(0);
    setShowTranslation(false);
    setMode('reading');
  };

  const nextSentence = () => {
    if (!selectedStory) return;
    if (currentSentence < selectedStory.sentences.length - 1) {
      setCurrentSentence((i) => i + 1);
      setShowTranslation(false);
    } else {
      setQuizIndex(0);
      setQuizAnswer(null);
      setQuizCorrect(0);
      setMode('quiz');
    }
  };

  const handleQuizAnswer = (answerIdx: number) => {
    if (!selectedStory || quizAnswer !== null) return;
    setQuizAnswer(answerIdx);
    if (answerIdx === selectedStory.questions[quizIndex].correctIndex) {
      setQuizCorrect((c) => c + 1);
    }
  };

  const nextQuizQuestion = async () => {
    if (!selectedStory) return;
    if (quizIndex < selectedStory.questions.length - 1) {
      setQuizIndex((i) => i + 1);
      setQuizAnswer(null);
    } else {
      if (user) {
        const xp = quizCorrect * 15;
        await recordReviewSession(user.id, selectedStory.questions.length, 0, 0, Math.round((quizCorrect / selectedStory.questions.length) * 100), xp);
        await awardXp(user.id, xp);
        addXp(xp);
      }
      setMode('list');
    }
  };

  const stripFurigana = (text: string) => text.replace(/\{([^|]+)\|[^}]+\}/g, '$1');

  const filteredInteractive = difficultyFilter
    ? INTERACTIVE_STORIES.filter((s) => s.difficulty === difficultyFilter)
    : INTERACTIVE_STORIES;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Reading"
        subtitle="Build comprehension with stories"
        jpTitle="読解"
        theme="indigo"
        action={
          activeStory ? (
            <button
              onClick={() => setActiveStory(null)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/20 text-white/80 hover:bg-white/30 cursor-pointer"
            >
              Back to stories
            </button>
          ) : mode !== 'list' ? (
            <button
              onClick={() => setMode('list')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/20 text-white/80 hover:bg-white/30 cursor-pointer"
            >
              Back to stories
            </button>
          ) : undefined
        }
      />

      {/* Tab selector (only when not in a story) */}
      {!activeStory && mode === 'list' && (
        <div className="flex gap-1 p-1 bg-bg-subtle rounded-xl w-fit">
          <button
            onClick={() => setTab('interactive')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
              tab === 'interactive' ? 'bg-bg-secondary shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <Sparkles size={14} />
            Interactive Stories
          </button>
          <button
            onClick={() => setTab('mini')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
              tab === 'mini' ? 'bg-bg-secondary shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <BookOpen size={14} />
            Mini Stories
          </button>
        </div>
      )}

      {/* ══════ Interactive Stories ══════ */}
      {tab === 'interactive' && !activeStory && mode === 'list' && (
        <div className="space-y-4">
          {/* Difficulty filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setDifficultyFilter(null)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all',
                !difficultyFilter ? 'bg-accent text-white' : 'bg-bg-subtle text-text-secondary hover:text-text-primary'
              )}
            >
              All Levels
            </button>
            {[1, 2, 3].map((d) => {
              const count = INTERACTIVE_STORIES.filter((s) => s.difficulty === d).length;
              if (count === 0) return null;
              return (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all',
                    difficultyFilter === d ? 'bg-accent text-white' : 'bg-bg-subtle text-text-secondary hover:text-text-primary'
                  )}
                >
                  {DIFFICULTY_LABELS[d]} ({count})
                </button>
              );
            })}
          </div>

          {/* Story grid — no entrance animations (prevents tab-switch glitch) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredInteractive.map((story) => (
              <button
                key={story.id}
                onClick={() => setActiveStory(story)}
                className="p-5 rounded-xl bg-bg-secondary border border-border hover:border-accent/50 hover:shadow-md transition-all cursor-pointer text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-text-primary jp-text group-hover:text-accent transition-colors">
                      {story.titleJp}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">{story.title}</p>
                  </div>
                  <span className="text-2xl">{THEME_ICONS[story.theme] ?? '📖'}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                    {DIFFICULTY_LABELS[story.difficulty]}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-subtle text-text-tertiary">
                    {FOCUS_LABELS[story.writingFocus]}
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    {story.sentences.length} sentences
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active interactive story reader */}
      {activeStory && (
        <InteractiveStoryReader
          story={activeStory}
          onBack={() => setActiveStory(null)}
        />
      )}

      {/* ══════ Mini Stories (existing functionality) ══════ */}
      {tab === 'mini' && mode === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {READING_STORIES.map((story) => (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => startMiniStory(story)}
              className="p-5 rounded-xl bg-bg-secondary border border-border hover:border-accent hover:shadow-md transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{story.icon}</span>
                <div>
                  <p className="text-base font-semibold text-text-primary jp-text">{stripFurigana(story.title)}</p>
                  <p className="text-xs text-text-secondary">{story.titleReading}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                  {story.sentences.length} sentences
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-muted text-text-secondary">
                  Level {story.difficulty}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Mini story reading mode */}
      {tab === 'mini' && mode === 'reading' && selectedStory && (
        <div className="bg-bg-secondary rounded-2xl border border-border p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedStory.icon}</span>
              <h3 className="text-lg font-bold text-text-primary jp-text">{stripFurigana(selectedStory.title)}</h3>
            </div>
            <button
              onClick={() => setShowFurigana((f) => !f)}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-bg-muted text-text-secondary cursor-pointer"
            >
              {showFurigana ? 'Hide' : 'Show'} furigana
            </button>
          </div>

          <div className="h-1.5 bg-bg-muted rounded-full overflow-hidden mb-6">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((currentSentence + 1) / selectedStory.sentences.length) * 100}%` }} />
          </div>

          <div className="space-y-4 mb-8">
            {selectedStory.sentences.slice(0, currentSentence + 1).map((s, i) => (
              <motion.div
                key={i}
                initial={i === currentSentence ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'p-4 rounded-xl',
                  i === currentSentence ? 'bg-bg-primary border border-accent/30' : 'bg-bg-primary/50 opacity-70'
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-lg leading-relaxed">
                      {showFurigana ? (
                        <FuriganaText text={s.japanese} className="text-text-primary" />
                      ) : (
                        <span className="text-text-primary jp-text">{stripFurigana(s.japanese)}</span>
                      )}
                    </p>
                    {(i < currentSentence || showTranslation) && (
                      <p className="text-sm text-text-secondary mt-1">{s.english}</p>
                    )}
                  </div>
                  <AudioButton text={stripFurigana(s.japanese)} highlightId={`read-${i}`} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            {!showTranslation && (
              <button
                onClick={() => setShowTranslation(true)}
                className="px-4 py-2 rounded-lg text-sm bg-bg-muted text-text-secondary hover:text-text-primary cursor-pointer"
              >
                Show translation
              </button>
            )}
            <button
              onClick={nextSentence}
              className="px-6 py-2 rounded-lg text-sm bg-accent text-white font-medium cursor-pointer"
            >
              {currentSentence < selectedStory.sentences.length - 1 ? 'Next sentence' : 'Start quiz'}
            </button>
          </div>
        </div>
      )}

      {/* Mini story quiz */}
      {tab === 'mini' && mode === 'quiz' && selectedStory && (
        <AnimatePresence mode="wait">
          {quizIndex < selectedStory.questions.length ? (
            <motion.div
              key={quizIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-bg-secondary rounded-2xl border border-border p-8"
            >
              <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">
                Question {quizIndex + 1}/{selectedStory.questions.length}
              </p>
              <p className="text-lg font-semibold text-text-primary mb-6">
                {selectedStory.questions[quizIndex].question}
              </p>

              <div className="space-y-2 mb-6">
                {selectedStory.questions[quizIndex].options.map((opt, i) => {
                  const isSelected = quizAnswer === i;
                  const isCorrect = i === selectedStory.questions[quizIndex].correctIndex;
                  let cls = 'border-border hover:border-accent';
                  if (quizAnswer !== null) {
                    if (isCorrect) cls = 'border-matcha-500 bg-[var(--color-feedback-success-bg)]';
                    else if (isSelected) cls = 'border-sakura-500 bg-[var(--color-feedback-error-bg)]';
                    else cls = 'border-border opacity-50';
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(i)}
                      disabled={quizAnswer !== null}
                      className={cn('w-full text-left px-4 py-3 rounded-xl border-2 transition-all cursor-pointer', cls)}
                    >
                      <span className="text-sm font-medium text-text-primary">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {quizAnswer !== null && (
                <div className="text-center">
                  <button onClick={nextQuizQuestion} className="px-6 py-2 bg-accent text-white rounded-lg cursor-pointer font-medium">
                    {quizIndex < selectedStory.questions.length - 1 ? 'Next question' : 'Finish'}
                  </button>
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      )}
    </div>
  );
}
