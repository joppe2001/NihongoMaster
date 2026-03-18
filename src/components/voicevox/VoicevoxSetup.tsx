/**
 * VoicevoxSetup — install/manage wizard.
 *
 * Flow:
 *   idle → voice picker (sample before download) → download → extract → installed → start → running
 *
 * State lives in useVoicevoxStore so navigation doesn't interrupt downloads.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useVoicevoxStore, type VoicevoxPhase } from '@/stores/voicevoxStore';
import { VoicevoxVoicePicker } from './VoicevoxVoicePicker';

export function VoicevoxSetup() {
  const store = useVoicevoxStore();
  const { phase, progress, error, status, selectedCharacters, toggleCharacter, setSelectedCharacters, install, start, stop, uninstall } = store;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const filesOnDisk = status?.dir_exists ?? false;

  const handleUninstall = async () => {
    setDeleting(true);
    await uninstall();
    setDeleting(false);
    setConfirmDelete(false);
  };

  const handleInstall = () => {
    if (selectedCharacters.length === 0) return;
    setShowPicker(false);
    install();
  };

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <StatusBanner phase={phase} />

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-[var(--color-feedback-error-bg)] border border-[var(--color-feedback-error-border)] rounded-xl text-xs text-[var(--color-feedback-error-text)]">
          {error}
        </div>
      )}

      {/* Progress bar */}
      <AnimatePresence>
        {progress && (phase === 'downloading' || phase === 'extracting') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>{progress.label}</span>
              {progress.percentage >= 0 && (
                <span className="tabular-nums font-mono">{progress.percentage.toFixed(1)}%</span>
              )}
            </div>
            <div className="h-2.5 bg-bg-subtle rounded-full overflow-hidden">
              {progress.percentage >= 0 ? (
                <motion.div className="h-full rounded-full bg-accent"
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              ) : (
                <motion.div className="h-full w-1/3 rounded-full bg-matcha-500"
                  animate={{ x: ['0%', '200%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </div>
            {phase === 'downloading' && (
              <p className="text-[10px] text-text-tertiary">
                One-time download. Runs entirely on your computer after this — no internet needed.
              </p>
            )}
            {phase === 'extracting' && (
              <p className="text-[10px] text-text-tertiary">
                Extracting selected voice models. Do not close the app.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {(phase === 'downloading' || phase === 'extracting') && (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <SpinnerIcon />
          {phase === 'downloading' ? 'Downloading…' : 'Installing…'}
          <span className="text-[10px] text-text-tertiary ml-1">
            You can safely navigate away — continues in background
          </span>
        </div>
      )}

      {/* ── IDLE: Voice picker for pre-download selection ── */}
      {phase === 'idle' && !showPicker && (
        <div className="space-y-3">
          <button
            onClick={() => setShowPicker(true)}
            className="w-full px-5 py-3 bg-accent text-white rounded-xl font-medium text-sm cursor-pointer hover:opacity-90 transition-opacity text-center"
          >
            Browse &amp; Preview Voices
          </button>
          <div className="bg-[var(--color-feedback-info-bg)] border border-[var(--color-feedback-info-border)] rounded-xl p-4 space-y-1.5">
            <p className="text-xs font-semibold text-[var(--color-feedback-info-text)]">About VOICEVOX Engine</p>
            <ul className="text-xs text-[var(--color-feedback-info-text)] space-y-1">
              <li>● 30+ natural Japanese voice characters — preview them before downloading</li>
              <li>● Created in Japan using real voice actors</li>
              <li>● Runs entirely on your computer — free forever</li>
              <li>● Pick only the voices you want — saves disk space</li>
            </ul>
          </div>
        </div>
      )}

      {/* Voice picker — selection mode */}
      {phase === 'idle' && showPicker && (
        <div className="space-y-3">
          <VoicevoxVoicePicker
            baseUrl=""
            selectedSpeakerId={-1}
            onSelect={() => {}}
            selectionMode
            selectedCharacters={selectedCharacters}
            onToggleCharacter={toggleCharacter}
            onClearAll={() => setSelectedCharacters([])}
          />

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPicker(false)}
              className="px-4 py-2.5 bg-bg-secondary border border-border text-text-secondary rounded-xl text-sm cursor-pointer hover:text-text-primary transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleInstall}
              disabled={selectedCharacters.length === 0}
              className={cn(
                'flex-1 px-5 py-2.5 rounded-xl font-medium text-sm text-center transition-opacity cursor-pointer',
                selectedCharacters.length > 0
                  ? 'bg-accent text-white hover:opacity-90'
                  : 'bg-bg-subtle text-text-tertiary cursor-not-allowed'
              )}
            >
              {selectedCharacters.length > 0
                ? `Download Engine + ${selectedCharacters.length} Voice${selectedCharacters.length > 1 ? 's' : ''}`
                : 'Select at least one voice'}
            </button>
          </div>
        </div>
      )}

      {/* ── INSTALLED: Start button ── */}
      {phase === 'installed' && (
        <button
          onClick={start}
          className="px-5 py-2.5 bg-matcha-500 text-white rounded-xl font-medium text-sm cursor-pointer hover:opacity-90 transition-opacity"
        >
          Start Engine
        </button>
      )}

      {/* ── STARTING ── */}
      {phase === 'starting' && (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <SpinnerIcon />
          Starting engine… (up to 30s)
        </div>
      )}

      {/* ── RUNNING: Stop ── */}
      {phase === 'running' && (
        <button
          onClick={stop}
          className="px-5 py-2.5 bg-bg-secondary border border-border text-text-primary rounded-xl font-medium text-sm cursor-pointer hover:bg-bg-subtle transition-colors"
        >
          Stop Engine
        </button>
      )}

      {/* ── ERROR: Retry ── */}
      {phase === 'error' && (
        <button
          onClick={() => setShowPicker(true)}
          className="px-5 py-2.5 bg-accent text-white rounded-xl font-medium text-sm cursor-pointer hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      )}

      {/* ── Delete ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {filesOnDisk && phase !== 'downloading' && phase !== 'extracting' && !deleting && !confirmDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-3 py-2 rounded-lg border border-[var(--color-feedback-error-border,#fca5a5)] text-[var(--color-feedback-error-text,#dc2626)] text-xs font-medium cursor-pointer hover:bg-[var(--color-feedback-error-bg)] transition-colors"
          >
            Delete Engine Files
          </button>
        )}
        {confirmDelete && !deleting && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-feedback-error-bg)] border border-[var(--color-feedback-error-border,#fca5a5)]">
            <span className="text-xs text-[var(--color-feedback-error-text)]">Delete engine files?</span>
            <button onClick={handleUninstall} className="px-3 py-1 rounded bg-[var(--color-feedback-error-text,#dc2626)] text-white text-xs font-bold cursor-pointer">Yes, delete</button>
            <button onClick={() => setConfirmDelete(false)} className="px-3 py-1 rounded border border-border text-xs text-text-secondary cursor-pointer">Cancel</button>
          </div>
        )}
        {deleting && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-feedback-error-text)]">
            <SpinnerIcon /> Deleting engine files…
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

const PHASE_CONFIG: Record<VoicevoxPhase, { dot: string; text: string; bg: string }> = {
  idle:        { dot: 'bg-text-tertiary',          text: 'VOICEVOX Engine not installed',           bg: 'bg-bg-subtle' },
  downloading: { dot: 'bg-accent animate-pulse',   text: 'Downloading VOICEVOX Engine…',            bg: 'bg-accent/5' },
  extracting:  { dot: 'bg-gold-500 animate-pulse',  text: 'Installing selected voices…',             bg: 'bg-bg-subtle' },
  installed:   { dot: 'bg-gold-500',                text: 'VOICEVOX Engine installed — not running', bg: 'bg-bg-subtle' },
  starting:    { dot: 'bg-matcha-400 animate-pulse', text: 'Starting VOICEVOX Engine…',               bg: 'bg-[var(--color-feedback-success-bg)]' },
  running:     { dot: 'bg-matcha-500',               text: 'VOICEVOX Engine is running',              bg: 'bg-[var(--color-feedback-success-bg)]' },
  error:       { dot: 'bg-sakura-500',               text: 'Something went wrong',                   bg: 'bg-[var(--color-feedback-error-bg)]' },
};

function StatusBanner({ phase }: { phase: VoicevoxPhase }) {
  const cfg = PHASE_CONFIG[phase];
  return (
    <div className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm', cfg.bg)}>
      <span className={cn('w-2 h-2 rounded-full shrink-0', cfg.dot)} />
      <span className="text-text-primary font-medium">{cfg.text}</span>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
