import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { AchievementNotification } from '@/components/shared/AchievementNotification';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { LevelUpAnimation, getLevel } from '@/components/shared/LevelUpAnimation';
import { checkAndUnlockAchievements } from '@/services/achievementService';
import type { UnlockedAchievement } from '@/services/achievementService';
import { useAppStore } from '@/stores/settingsStore';
import { useUserStore } from '@/stores/userStore';
import { getDatabase, query, execute } from '@/lib/db';
import { calculateStreak, updateUserStreak } from '@/services/progressService';
import { seedKanaData } from '@/data/seedKana';
import { seedKanjiData } from '@/data/seedKanji';
import { seedVocabData } from '@/data/seedVocab';
import { seedGrammarData } from '@/data/seedGrammar';
import { seedSentenceBank } from '@/data/seedSentences';
import { initializeTheme, migrateOldTheme } from '@/services/themeService';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { useVoicevoxStore } from '@/stores/voicevoxStore';
import type { PageId, AppSettings } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy-load all page components for faster initial render
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const HiraganaPage = lazy(() => import('@/pages/HiraganaPage').then((m) => ({ default: m.HiraganaPage })));
const KatakanaPage = lazy(() => import('@/pages/KatakanaPage').then((m) => ({ default: m.KatakanaPage })));
const KanjiPage = lazy(() => import('@/pages/KanjiPage').then((m) => ({ default: m.KanjiPage })));
const VocabularyPage = lazy(() => import('@/pages/VocabularyPage').then((m) => ({ default: m.VocabularyPage })));
const GrammarPage = lazy(() => import('@/pages/GrammarPage').then((m) => ({ default: m.GrammarPage })));
const PracticePage = lazy(() => import('@/pages/PracticePage').then((m) => ({ default: m.PracticePage })));
const ReadingPage = lazy(() => import('@/pages/ReadingPage').then((m) => ({ default: m.ReadingPage })));
const TypingPage = lazy(() => import('@/pages/TypingPage').then((m) => ({ default: m.TypingPage })));
const ReviewPage = lazy(() => import('@/pages/ReviewPage').then((m) => ({ default: m.ReviewPage })));
const ProgressPage = lazy(() => import('@/pages/ProgressPage').then((m) => ({ default: m.ProgressPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

const PAGE_COMPONENTS: Record<PageId, React.ComponentType> = {
  dashboard: DashboardPage,
  hiragana: HiraganaPage,
  katakana: KatakanaPage,
  kanji: KanjiPage,
  vocabulary: VocabularyPage,
  grammar: GrammarPage,
  practice: PracticePage,
  reading: ReadingPage,
  typing: TypingPage,
  review: ReviewPage,
  progress: ProgressPage,
  settings: SettingsPage,
};

function App() {
  const { currentPage, setDbReady, isDbReady } = useAppStore();
  const { setUser, setLoading, user, isOnboarded, settings } = useUserStore();
  const animationsEnabled = settings.animationsEnabled;
  const [initError, setInitError] = useState<string | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<UnlockedAchievement[]>([]);
  const [currentNotification, setCurrentNotification] = useState<UnlockedAchievement | null>(null);
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);
  const [prevLevel, setPrevLevel] = useState<number | null>(null);

  // Process achievement queue one at a time
  useEffect(() => {
    if (!currentNotification && achievementQueue.length > 0) {
      setCurrentNotification(achievementQueue[0]);
      setAchievementQueue((q) => q.slice(1));
    }
  }, [currentNotification, achievementQueue]);

  const dismissNotification = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  // Check achievements + level-ups on page change (debounced)
  useEffect(() => {
    if (!user || !isDbReady) return;

    // Track level changes
    const currentLevel = getLevel(user.xp);
    if (prevLevel !== null && currentLevel > prevLevel) {
      setLevelUpLevel(currentLevel);
    }
    setPrevLevel(currentLevel);

    const timer = setTimeout(async () => {
      try {
        const newlyUnlocked = await checkAndUnlockAchievements(user.id);
        if (newlyUnlocked.length > 0) {
          setAchievementQueue((q) => [...q, ...newlyUnlocked]);
        }
      } catch {
        // Non-critical
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentPage, user, isDbReady, user?.xp, prevLevel]);

  useEffect(() => {
    async function initialize() {
      try {
        // Initialize database
        await getDatabase();
        setDbReady(true);

        // Seed content data (parallel — different tables, no conflicts)
        await Promise.all([
          seedKanaData(),
          seedKanjiData(),
          seedVocabData(),
          seedGrammarData(),
          seedSentenceBank(),
        ]);

        // Check for existing user or create default
        const users = await query<{ id: number; name: string; source_language: string; current_level: number; daily_goal_minutes: number; new_cards_per_day: number; xp: number; streak_days: number; last_study_date: string | null; created_at: string }>(
          'SELECT * FROM users LIMIT 1'
        );

        if (users.length === 0) {
          // Create default user
          await execute(
            'INSERT INTO users (name, source_language, current_level) VALUES ($1, $2, $3)',
            ['Learner', 'en', 5]
          );
          const newUsers = await query<{ id: number; name: string; source_language: string; current_level: number; daily_goal_minutes: number; new_cards_per_day: number; xp: number; streak_days: number; last_study_date: string | null; created_at: string }>(
            'SELECT * FROM users LIMIT 1'
          );
          if (newUsers.length > 0) {
            const u = newUsers[0];
            setUser({
              id: u.id,
              name: u.name,
              sourceLanguage: u.source_language,
              currentLevel: u.current_level as 1 | 2 | 3 | 4 | 5,
              dailyGoalMinutes: u.daily_goal_minutes,
              newCardsPerDay: u.new_cards_per_day,
              xp: u.xp,
              streakDays: u.streak_days,
              lastStudyDate: u.last_study_date,
              createdAt: u.created_at,
            });
          }
        } else {
          const u = users[0];
          setUser({
            id: u.id,
            name: u.name,
            sourceLanguage: u.source_language,
            currentLevel: u.current_level as 1 | 2 | 3 | 4 | 5,
            dailyGoalMinutes: u.daily_goal_minutes,
            newCardsPerDay: u.new_cards_per_day,
            xp: u.xp,
            streakDays: u.streak_days,
            lastStudyDate: u.last_study_date,
            createdAt: u.created_at,
          });
        }

        // Recalculate streak on app launch
        try {
          const loadedUsers = await query<{ id: number }>('SELECT id FROM users LIMIT 1');
          if (loadedUsers.length > 0) {
            const streak = await calculateStreak(loadedUsers[0].id);
            await updateUserStreak(loadedUsers[0].id, streak);
          }
        } catch {
          // Non-critical — streak will show last saved value
        }

        // Load and apply all persisted settings
        try {
          const allSettings = await query<{ key: string; value: string }>(
            "SELECT key, value FROM settings WHERE key IN ('colorTheme','colorMode','showFurigana','fontSize','animationsEnabled','soundEnabled','newCardsPerDay','dailyReviewLimit','sourceLanguage','ttsProvider','openaiApiKey','openaiTtsVoice','voicevoxBaseUrl','voicevoxSpeakerId')"
          );
          const settingsMap = Object.fromEntries(allSettings.map((r) => [r.key, r.value]));

          const patch: Partial<AppSettings> = {};

          if (settingsMap.colorTheme) patch.colorTheme = settingsMap.colorTheme as AppSettings['colorTheme'];
          if (settingsMap.colorMode) patch.colorMode = settingsMap.colorMode as AppSettings['colorMode'];
          if (settingsMap.showFurigana) patch.showFurigana = settingsMap.showFurigana === 'true';
          if (settingsMap.fontSize) patch.fontSize = settingsMap.fontSize as AppSettings['fontSize'];
          if (settingsMap.animationsEnabled) patch.animationsEnabled = settingsMap.animationsEnabled === 'true';
          if (settingsMap.soundEnabled) patch.soundEnabled = settingsMap.soundEnabled === 'true';
          if (settingsMap.newCardsPerDay) patch.newCardsPerDay = Number(settingsMap.newCardsPerDay);
          if (settingsMap.dailyReviewLimit) patch.dailyReviewLimit = Number(settingsMap.dailyReviewLimit);
          if (settingsMap.sourceLanguage) patch.sourceLanguage = settingsMap.sourceLanguage;
          if (settingsMap.ttsProvider) patch.ttsProvider = settingsMap.ttsProvider as AppSettings['ttsProvider'];
          if (settingsMap.openaiApiKey) patch.openaiApiKey = settingsMap.openaiApiKey;
          if (settingsMap.openaiTtsVoice) patch.openaiTtsVoice = settingsMap.openaiTtsVoice as AppSettings['openaiTtsVoice'];
          if (settingsMap.voicevoxBaseUrl) patch.voicevoxBaseUrl = settingsMap.voicevoxBaseUrl;
          if (settingsMap.voicevoxSpeakerId) patch.voicevoxSpeakerId = Number(settingsMap.voicevoxSpeakerId);

          if (Object.keys(patch).length > 0) {
            useUserStore.getState().updateSettings(patch);
          }

          // Handle theme migration from old single 'theme' field if no new keys found
          if (!settingsMap.colorTheme && !settingsMap.colorMode) {
            const oldThemeResult = await query<{ value: string }>(
              "SELECT value FROM settings WHERE key = 'theme'"
            );
            if (oldThemeResult.length > 0) {
              const migrated = migrateOldTheme(oldThemeResult[0].value);
              useUserStore.getState().updateSettings(migrated);
              await execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('colorTheme', $1)", [migrated.colorTheme]);
              await execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('colorMode', $1)", [migrated.colorMode]);
            } else {
              initializeTheme(DEFAULT_SETTINGS.colorTheme, DEFAULT_SETTINGS.colorMode);
            }
          }
        } catch {
          initializeTheme(DEFAULT_SETTINGS.colorTheme, DEFAULT_SETTINGS.colorMode);
        }

        // Check onboarding status — also auto-complete for existing users with data
        try {
          const onboardingResult = await query<{ value: string }>(
            "SELECT value FROM settings WHERE key = 'onboarding_complete'"
          );
          if (onboardingResult.length > 0 && onboardingResult[0].value === 'true') {
            useUserStore.getState().setOnboarded(true);
          } else {
            // If user already has SRS cards or progress, they're an existing user — skip onboarding
            const existingData = await query<{ count: number }>(
              'SELECT COUNT(*) as count FROM srs_cards'
            );
            if ((existingData[0]?.count ?? 0) > 0) {
              await execute(
                "INSERT OR REPLACE INTO settings (key, value) VALUES ('onboarding_complete', 'true')",
                []
              );
              useUserStore.getState().setOnboarded(true);
            }
          }
        } catch {
          // First launch — onboarding not complete
        }

        setLoading(false);

        // Init VOICEVOX status (non-blocking — runs in background)
        useVoicevoxStore.getState().init();
      } catch (err) {
        const message = err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : JSON.stringify(err);
        console.error('Init error:', err);
        setInitError(message);
        setLoading(false);
      }
    }

    initialize();
  }, [setDbReady, setUser, setLoading]);

  if (initError) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <div className="text-center max-w-md p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Initialization Error
          </h1>
          <p className="text-text-secondary mb-6">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isDbReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <div className="text-center">
          <div className="text-6xl character-display mb-4">日</div>
          <p className="text-text-secondary animate-pulse">Loading NihongoMaster...</p>
        </div>
      </div>
    );
  }

  const CurrentPageComponent = PAGE_COMPONENTS[currentPage];

  // Show onboarding wizard on first launch (after DB is ready and user exists)
  if (!isOnboarded && user && isDbReady) {
    return <OnboardingWizard onComplete={() => {}} />;
  }

  const pageTransition = animationsEnabled
    ? { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }
    : { duration: 0 };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      {/* Global overlays */}
      <AchievementNotification achievement={currentNotification} onDismiss={dismissNotification} />
      <LevelUpAnimation newLevel={levelUpLevel} onDismiss={() => setLevelUpLevel(null)} />
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 relative">
          {/* Ambient background gradient */}
          <div className="fixed top-0 right-0 w-[600px] h-[600px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 10%, rgba(108, 99, 255, 0.06), transparent 60%)', zIndex: 0 }} />
          <div className="fixed bottom-0 left-[30%] w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 40% 90%, rgba(214, 107, 138, 0.04), transparent 60%)', zIndex: 0 }} />
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentPage}
              initial={animationsEnabled ? { opacity: 0, y: 12, scale: 0.995 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={animationsEnabled ? { opacity: 0, y: -8, scale: 0.998 } : undefined}
              transition={pageTransition}
            >
              <Suspense fallback={
                <div className="flex items-center justify-center py-20">
                  <p className="text-text-secondary animate-pulse text-sm">Loading...</p>
                </div>
              }>
                <CurrentPageComponent />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
    </div>
  );
}

export default App;
