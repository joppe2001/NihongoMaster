import { useState, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { exportAllData, importData, downloadJson, readJsonFile, resetProgress } from '@/services/dataService';
import { PageHeader } from '@/components/shared/PageHeader';
import { execute } from '@/lib/db';
import { clearAudioCache, getAudioCacheSize } from '@/services/ttsService';
import { useVoicevoxStore } from '@/stores/voicevoxStore';
import { OPENAI_TTS_VOICES } from '@/lib/constants';
import { VoicevoxSetup } from '@/components/voicevox/VoicevoxSetup';
import { VoicevoxVoicePicker } from '@/components/voicevox/VoicevoxVoicePicker';
import type { AppSettings, TtsProvider, OpenAiTtsVoice } from '@/lib/types';

async function persistSetting(key: string, value: string) {
  try {
    await execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)",
      [key, value]
    );
  } catch {
    // Non-critical — setting is applied in-memory regardless
  }
}

export function SettingsPage() {
  const { settings, updateSettings, user, setUser } = useUserStore();

  const handleSettingChange = async (patch: Partial<AppSettings>) => {
    updateSettings(patch);
    for (const [key, value] of Object.entries(patch)) {
      await persistSetting(key, String(value));
    }
  };
  const [exportStatus, setExportStatus] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [resetStatus, setResetStatus] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    if (!user) return;
    try {
      setExportStatus('Exporting...');
      const data = await exportAllData(user.id);
      const date = new Date().toISOString().slice(0, 10);
      downloadJson(data, `nihongo-backup-${date}.json`);
      setExportStatus('Exported!');
      setTimeout(() => setExportStatus(''), 3000);
    } catch (err) {
      setExportStatus('Export failed');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    const confirmed = window.confirm(
      'This will replace all your current progress with the backup data. Are you sure?'
    );
    if (!confirmed) { e.target.value = ''; return; }
    try {
      setImportStatus('Importing...');
      const payload = await readJsonFile(e.target.files[0]);
      await importData(user.id, payload);
      setImportStatus('Imported! Restart recommended.');
    } catch (err) {
      setImportStatus(err instanceof Error ? err.message : 'Import failed');
    }
    e.target.value = '';
  };

  const handleColorThemeChange = async (colorTheme: AppSettings['colorTheme']) => {
    updateSettings({ colorTheme });
    try {
      await execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('colorTheme', $1)",
        [colorTheme]
      );
    } catch {
      // Non-critical — theme is applied in-memory regardless
    }
  };

  const handleColorModeChange = async (colorMode: AppSettings['colorMode']) => {
    updateSettings({ colorMode });
    try {
      await execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('colorMode', $1)",
        [colorMode]
      );
    } catch {
      // Non-critical — mode is applied in-memory regardless
    }
  };

  const handleReset = async () => {
    if (!user) return;
    setShowResetConfirm(true);
  };

  const confirmReset = async () => {
    if (!user) return;
    try {
      setShowResetConfirm(false);
      setResetStatus('Resetting...');
      await resetProgress(user.id);
      setUser({ ...user, xp: 0, streakDays: 0, lastStudyDate: null });
      setResetStatus('Progress reset successfully.');
      setTimeout(() => setResetStatus(''), 5000);
    } catch (e) {
      console.error('Reset failed:', e);
      setResetStatus('Reset failed. Please try again.');
      setTimeout(() => setResetStatus(''), 5000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="Settings" subtitle="Customize your experience" jpTitle="設定" theme="accent" />

      {/* Study Settings */}
      <SettingsSection title="Study" delay={0}>
        <SettingRow label="New Cards Per Day" description="Maximum new cards to introduce daily">
          <select
            value={settings.newCardsPerDay}
            onChange={(e) => handleSettingChange({ newCardsPerDay: Number(e.target.value) })}
            className="px-3 py-1.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm"
          >
            {[5, 10, 15, 20, 25, 30, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </SettingRow>

        <SettingRow label="Daily Review Limit" description="Maximum reviews per day">
          <select
            value={settings.dailyReviewLimit}
            onChange={(e) => handleSettingChange({ dailyReviewLimit: Number(e.target.value) })}
            className="px-3 py-1.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm"
          >
            {[50, 100, 150, 200, 300, 500, 9999].map((n) => (
              <option key={n} value={n}>{n === 9999 ? 'Unlimited' : n}</option>
            ))}
          </select>
        </SettingRow>
      </SettingsSection>

      {/* Display Settings */}
      <SettingsSection title="Display" delay={0.1}>
        <SettingRow label="Show Furigana" description="Display reading hints above kanji">
          <Toggle
            checked={settings.showFurigana}
            onChange={(checked) => handleSettingChange({ showFurigana: checked })}
          />
        </SettingRow>

        <SettingRow label="Font Size" description="Text size for Japanese content">
          <div className="flex gap-2">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => handleSettingChange({ fontSize: size })}
                className={cn(
                  'px-3 py-1 rounded-lg text-sm capitalize cursor-pointer transition-colors',
                  settings.fontSize === size
                    ? 'bg-accent text-white'
                    : 'bg-bg-primary border border-border text-text-secondary'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow label="Animations" description="Enable UI animations and transitions">
          <Toggle
            checked={settings.animationsEnabled}
            onChange={(checked) => handleSettingChange({ animationsEnabled: checked })}
          />
        </SettingRow>

        <SettingRow label="Sound Effects" description="Play sounds for correct/incorrect answers">
          <Toggle
            checked={settings.soundEnabled}
            onChange={(checked) => handleSettingChange({ soundEnabled: checked })}
          />
        </SettingRow>
      </SettingsSection>

      {/* Voice / TTS Settings */}
      <VoiceSection settings={settings} handleSettingChange={handleSettingChange} />


      {/* Theme Settings */}
      <SettingsSection title="Theme" delay={0.15}>
        {/* Color Mode: Light / Dark / System */}
        <div className="px-6 py-5 border-b border-border">
          <p className="text-sm font-medium text-text-primary mb-1">Mode</p>
          <p className="text-xs text-text-secondary mb-3">Light, dark, or match your system</p>
          <div className="flex gap-2">
            {([
              { mode: 'system' as const, label: 'System', jp: '自動' },
              { mode: 'light' as const, label: 'Light', jp: '光' },
              { mode: 'dark' as const, label: 'Dark', jp: '闇' },
            ]).map(({ mode, label, jp }) => (
              <button
                key={mode}
                onClick={() => handleColorModeChange(mode)}
                className={cn(
                  'flex-1 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors',
                  settings.colorMode === mode
                    ? 'bg-accent text-white'
                    : 'bg-bg-primary border border-border text-text-secondary hover:border-accent/50'
                )}
              >
                <span className="text-[10px] opacity-60 mr-1">{jp}</span>{label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Theme: Twilight / Sakura / Matcha / Fuji / Momiji / Sora */}
        <div className="px-6 py-5">
          <p className="text-sm font-medium text-text-primary mb-1">Color Theme</p>
          <p className="text-xs text-text-secondary mb-4">Choose a color palette</p>
          {(() => {
            const effectiveDark = settings.colorMode === 'dark' || (settings.colorMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            return (
              <div className="grid grid-cols-3 gap-3">
                <ThemeCard label="Twilight" description="Deep indigo focus" jpLabel="宵" isActive={settings.colorTheme === 'twilight'} onClick={() => handleColorThemeChange('twilight')} preview="twilight" isDark={effectiveDark} />
                <ThemeCard label="Sakura" description="Cherry blossom" jpLabel="桜" isActive={settings.colorTheme === 'sakura'} onClick={() => handleColorThemeChange('sakura')} preview="sakura" isDark={effectiveDark} />
                <ThemeCard label="Matcha" description="Tea ceremony" jpLabel="抹茶" isActive={settings.colorTheme === 'matcha'} onClick={() => handleColorThemeChange('matcha')} preview="matcha" isDark={effectiveDark} />
                <ThemeCard label="Fuji" description="Wisteria purple" jpLabel="藤" isActive={settings.colorTheme === 'fuji'} onClick={() => handleColorThemeChange('fuji')} preview="fuji" isDark={effectiveDark} />
                <ThemeCard label="Momiji" description="Autumn maple" jpLabel="紅葉" isActive={settings.colorTheme === 'momiji'} onClick={() => handleColorThemeChange('momiji')} preview="momiji" isDark={effectiveDark} />
                <ThemeCard label="Sora" description="Sky blue" jpLabel="空" isActive={settings.colorTheme === 'sora'} onClick={() => handleColorThemeChange('sora')} preview="sora" isDark={effectiveDark} />
              </div>
            );
          })()}
        </div>
      </SettingsSection>

      {/* Language Settings */}
      <SettingsSection title="Language" delay={0.2}>
        <SettingRow label="Source Language" description="Language for translations and explanations">
          <select
            value={settings.sourceLanguage}
            onChange={(e) => handleSettingChange({ sourceLanguage: e.target.value })}
            className="px-3 py-1.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm"
          >
            <option value="en">English</option>
            <option value="es" disabled>Spanish (coming soon)</option>
            <option value="fr" disabled>French (coming soon)</option>
            <option value="de" disabled>German (coming soon)</option>
            <option value="zh" disabled>Chinese (coming soon)</option>
            <option value="ko" disabled>Korean (coming soon)</option>
          </select>
        </SettingRow>
      </SettingsSection>

      {/* User Info */}
      {user && (
        <SettingsSection title="Account" delay={0.3}>
          <SettingRow label="Name" description="Your display name">
            <span className="text-sm text-text-primary">{user.name}</span>
          </SettingRow>
          <SettingRow label="Current Level" description="Your JLPT progress level">
            <span className="text-sm font-bold text-accent">N{user.currentLevel}</span>
          </SettingRow>
          <SettingRow label="Total XP" description="Experience points earned">
            <span className="text-sm text-text-primary">{user.xp.toLocaleString()}</span>
          </SettingRow>
        </SettingsSection>
      )}

      {/* Data Management */}
      <SettingsSection title="Data" delay={0.4}>
        <SettingRow label="Export Data" description="Download your progress as a backup file">
          <div className="flex items-center gap-2">
            {exportStatus && <span className="text-xs text-text-secondary">{exportStatus}</span>}
            <button onClick={handleExport} className="px-3 py-1.5 rounded-lg border border-border text-sm text-text-secondary hover:text-text-primary cursor-pointer transition-colors">
              Export
            </button>
          </div>
        </SettingRow>
        <SettingRow label="Import Data" description="Restore from a backup file">
          <div className="flex items-center gap-2">
            {importStatus && <span className="text-xs text-text-secondary">{importStatus}</span>}
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 rounded-lg border border-border text-sm text-text-secondary hover:text-text-primary cursor-pointer transition-colors">
              Import
            </button>
          </div>
        </SettingRow>
        <SettingRow label="Reset Progress" description="Clear all learning data (irreversible)">
          <div className="flex items-center gap-2">
            {resetStatus && <span className="text-xs text-text-secondary">{resetStatus}</span>}
            <button onClick={handleReset} className="px-3 py-1.5 rounded-lg border border-sakura-300 text-sm text-sakura-600 hover:bg-sakura-50 cursor-pointer transition-colors">
              Reset
            </button>
          </div>
        </SettingRow>
      </SettingsSection>

      {/* Version */}
      <p className="text-xs text-text-secondary text-center pt-4">
        NihongoMaster v0.2.0 | Built with Tauri + React
      </p>

      {/* Reset Confirmation Dialog */}
      <AnimatePresence>
        {showResetConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowResetConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-bg-secondary rounded-2xl border border-border shadow-2xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-feedback-error-bg)] flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-sakura-600" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 9v4M12 17h.01M4.93 4.93l14.14 14.14" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Reset All Progress?</h3>
              <p className="text-sm text-text-secondary mb-6">
                This will permanently delete all your SRS cards, review history, achievements, XP, and streak. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-bg-muted text-text-primary font-medium cursor-pointer hover:bg-bg-subtle transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 py-2.5 rounded-xl bg-sakura-500 text-white font-medium cursor-pointer hover:bg-sakura-600 transition-colors"
                >
                  Reset Everything
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

type ThemePreview = 'twilight' | 'sakura' | 'matcha' | 'fuji' | 'momiji' | 'sora';

interface PreviewColors { bg: string; sidebar: string; card: string; accent: string }

const THEME_PREVIEW_STYLES: Record<ThemePreview, { light: PreviewColors; dark: PreviewColors }> = {
  twilight: {
    light: { bg: '#F4F2FB', sidebar: '#0F0E1A', card: '#FFFFFF', accent: '#6C63FF' },
    dark:  { bg: '#0F0E1A', sidebar: '#0A0918', card: '#1A1830', accent: '#8B7AFF' },
  },
  sakura: {
    light: { bg: '#FFF5F7', sidebar: '#4A1028', card: '#FFFFFF', accent: '#D66B8A' },
    dark:  { bg: '#1A0F14', sidebar: '#140A10', card: '#241519', accent: '#E88DA8' },
  },
  matcha: {
    light: { bg: '#F4F9F2', sidebar: '#1A2E1A', card: '#FFFFFF', accent: '#38845A' },
    dark:  { bg: '#0E1A10', sidebar: '#081408', card: '#162018', accent: '#68D391' },
  },
  fuji: {
    light: { bg: '#F5F0FF', sidebar: '#1E1040', card: '#FFFFFF', accent: '#7C5CC4' },
    dark:  { bg: '#110D1E', sidebar: '#0A0814', card: '#1A1530', accent: '#A48AE0' },
  },
  momiji: {
    light: { bg: '#FDF6F0', sidebar: '#3A1808', card: '#FFFFFF', accent: '#C45A2A' },
    dark:  { bg: '#1A100A', sidebar: '#120A04', card: '#241810', accent: '#E88A5A' },
  },
  sora: {
    light: { bg: '#F0F7FF', sidebar: '#0C1A2E', card: '#FFFFFF', accent: '#3B82F6' },
    dark:  { bg: '#0C1220', sidebar: '#060D1C', card: '#131D30', accent: '#5A9AEE' },
  },
};

function ThemeCard({
  label,
  description,
  jpLabel,
  isActive,
  onClick,
  preview,
  isDark,
}: {
  label: string;
  description: string;
  jpLabel: string;
  isActive: boolean;
  onClick: () => void;
  preview: ThemePreview;
  isDark: boolean;
}) {
  const styles = THEME_PREVIEW_STYLES[preview][isDark ? 'dark' : 'light'];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'w-full rounded-xl border-2 p-2.5 text-left cursor-pointer transition-all duration-200',
        isActive
          ? 'border-accent shadow-md'
          : 'border-border hover:border-text-tertiary'
      )}
    >
      {/* Mini preview */}
      <div
        className="w-full h-12 rounded-lg mb-2 overflow-hidden relative"
        style={{ background: styles.bg }}
      >
        {/* Mini sidebar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-5 rounded-l-lg"
          style={{ background: styles.sidebar }}
        />
        {/* Mini card */}
        <div
          className="absolute right-1.5 top-1.5 bottom-1.5 left-7 rounded-sm"
          style={{ background: styles.card }}
        />
        {/* Accent dot */}
        <div
          className="absolute rounded-full"
          style={{
            width: 6, height: 6,
            top: 4, right: 4,
            background: styles.accent,
          }}
        />
      </div>

      {/* Label */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-bold text-text-tertiary jp-text">{jpLabel}</span>
        <span className="text-xs font-semibold text-text-primary">{label}</span>
        {isActive && (
          <span className="ml-auto w-3.5 h-3.5 rounded-full bg-accent flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
              <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </span>
        )}
      </div>
      <p className="text-[10px] text-text-tertiary mt-0.5">{description}</p>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────
// Voice Section (extracted so it can use hooks)
// ─────────────────────────────────────────────────────────────

function VoiceSection({
  settings,
  handleSettingChange,
}: {
  settings: AppSettings;
  handleSettingChange: (patch: Partial<AppSettings>) => void;
}) {
  const vvPhase = useVoicevoxStore((s) => s.phase);

  return (
    <SettingsSection title="Voice" delay={0.12}>
      <SettingRow label="TTS Provider" description="Choose how pronunciation audio is generated">
        <div className="flex gap-2 flex-wrap">
          {([
            { id: 'browser' as TtsProvider, label: 'Browser' },
            { id: 'openai' as TtsProvider, label: 'OpenAI' },
            { id: 'voicevox' as TtsProvider, label: 'VOICEVOX' },
          ]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => { handleSettingChange({ ttsProvider: id }); clearAudioCache(); }}
              className={cn(
                'px-3 py-1 rounded-lg text-sm cursor-pointer transition-colors',
                settings.ttsProvider === id
                  ? 'bg-accent text-white'
                  : 'bg-bg-primary border border-border text-text-secondary hover:text-text-primary'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </SettingRow>

      {/* ── OpenAI sub-settings ── */}
      {settings.ttsProvider === 'openai' && (
        <>
          <SettingRow label="OpenAI API Key" description="Your key stays on-device, never sent to our servers">
            <input
              type="password"
              value={settings.openaiApiKey}
              onChange={(e) => handleSettingChange({ openaiApiKey: e.target.value })}
              placeholder="sk-..."
              className="w-56 px-3 py-1.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm font-mono"
              autoComplete="off"
            />
          </SettingRow>

          <SettingRow label="Voice" description="Choose the OpenAI voice for pronunciation">
            <select
              value={settings.openaiTtsVoice}
              onChange={(e) => { handleSettingChange({ openaiTtsVoice: e.target.value as OpenAiTtsVoice }); clearAudioCache(); }}
              className="px-3 py-1.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm"
            >
              {OPENAI_TTS_VOICES.map((v) => (
                <option key={v.id} value={v.id}>{v.label} — {v.description}</option>
              ))}
            </select>
          </SettingRow>

          {!settings.openaiApiKey && (
            <div className="px-6 py-3 bg-[var(--color-feedback-warning-bg,#fef3cd)] text-[var(--color-feedback-warning-text,#856404)] text-xs rounded-b-lg">
              Enter your OpenAI API key to enable high-quality voice. Get one at{' '}
              <span className="font-semibold">platform.openai.com/api-keys</span>.
              Cost is ~$0.45/month for typical use.
            </div>
          )}
        </>
      )}

      {/* ── VOICEVOX sub-settings ── */}
      {settings.ttsProvider === 'voicevox' && (
        <div className="px-6 py-5 border-b border-border space-y-5">
          {/* In-app download/install/manage wizard */}
          <VoicevoxSetup />

          {/* Visual voice character picker — shown when engine is running */}
          {vvPhase === 'running' && (
            <VoicevoxVoicePicker
              baseUrl={settings.voicevoxBaseUrl}
              selectedSpeakerId={settings.voicevoxSpeakerId}
              onSelect={(id) => handleSettingChange({ voicevoxSpeakerId: id })}
            />
          )}
        </div>
      )}

      {/* Shared cache controls */}
      {settings.ttsProvider !== 'browser' && (
        <SettingRow label="Audio Cache" description={`${getAudioCacheSize()} pronunciations cached this session`}>
          <button
            onClick={() => { clearAudioCache(); handleSettingChange({}); }}
            className="px-3 py-1.5 rounded-lg border border-border text-sm text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
          >
            Clear Cache
          </button>
        </SettingRow>
      )}
    </SettingsSection>
  );
}

function SettingsSection({
  title,
  delay,
  children,
}: {
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-bg-secondary rounded-2xl border border-border overflow-hidden"
    >
      <div className="px-6 py-3 border-b border-border bg-bg-subtle">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </motion.div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer relative',
        checked ? 'bg-accent' : 'bg-bg-muted'
      )}
    >
      <div
        className={cn(
          'w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform duration-200',
          checked ? 'translate-x-5.5' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}
