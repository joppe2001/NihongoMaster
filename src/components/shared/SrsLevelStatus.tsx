import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle, Trash2, X, RefreshCw } from '@/lib/icons';
import {
  getCardCountForLevel,
  removeCardsForLevel,
} from '@/services/srsService';

interface SrsLevelStatusProps {
  userId: number | undefined;
  contentType: 'kanji' | 'vocab' | 'grammar';
  /** Human-readable label shown in button text, e.g. "kanji" or "vocabulary" */
  contentLabel: string;
  level: number;
  /** Called when the user confirms "Add to SRS". Should call the appropriate startStudying* service. */
  onAdd: () => Promise<void>;
}

type UIState =
  | 'loading'       // initial fetch in progress
  | 'empty'         // 0 cards enrolled
  | 'adding'        // add in progress
  | 'just-added'    // brief success confirmation before settling into 'enrolled'
  | 'enrolled'      // cards exist, idle
  | 'confirm-remove'// user clicked Remove, showing confirmation
  | 'removing';     // remove in progress

export function SrsLevelStatus({
  userId,
  contentType,
  contentLabel,
  level,
  onAdd,
}: SrsLevelStatusProps) {
  const [cardCount, setCardCount] = useState<number>(0);
  const [uiState, setUiState] = useState<UIState>('loading');

  const refresh = useCallback(async () => {
    if (!userId) return;
    const count = await getCardCountForLevel(userId, contentType, level);
    setCardCount(count);
    setUiState(count > 0 ? 'enrolled' : 'empty');
  }, [userId, contentType, level]);

  // Re-fetch whenever the level or content type changes
  useEffect(() => {
    setUiState('loading');
    refresh();
  }, [refresh]);

  const handleAdd = async () => {
    setUiState('adding');
    try {
      await onAdd();
      const count = await getCardCountForLevel(userId!, contentType, level);
      setCardCount(count);
      setUiState('just-added');
      // After 2.5 s settle into the enrolled view
      setTimeout(() => setUiState('enrolled'), 2500);
    } catch {
      setUiState('empty');
    }
  };

  const handleRemove = async () => {
    setUiState('removing');
    try {
      await removeCardsForLevel(userId!, contentType, level);
      setCardCount(0);
      setUiState('empty');
    } catch {
      setUiState('enrolled');
    }
  };

  if (!userId) return null;

  return (
    <AnimatePresence mode="wait">
      {/* ── Loading ── */}
      {uiState === 'loading' && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 text-xs text-text-tertiary"
        >
          <RefreshCw size={12} className="animate-spin" />
          Checking SRS…
        </motion.div>
      )}

      {/* ── Add button (no cards enrolled) ── */}
      {(uiState === 'empty') && (
        <motion.button
          key="add"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Add N{level} {contentLabel} to SRS
        </motion.button>
      )}

      {/* ── Adding in progress ── */}
      {uiState === 'adding' && (
        <motion.div
          key="adding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 text-sm text-text-secondary"
        >
          <RefreshCw size={14} className="animate-spin text-accent" />
          Adding to SRS…
        </motion.div>
      )}

      {/* ── Just added — brief success toast ── */}
      {uiState === 'just-added' && (
        <motion.div
          key="just-added"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-feedback-success-bg)] border border-[var(--color-feedback-success-border)]"
        >
          <CheckCircle size={14} className="text-matcha-500 shrink-0" />
          <span className="text-sm font-medium text-[var(--color-feedback-success-text)]">
            {cardCount} cards added to SRS
          </span>
        </motion.div>
      )}

      {/* ── Enrolled (idle) ── */}
      {uiState === 'enrolled' && (
        <motion.div
          key="enrolled"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex items-center gap-2"
        >
          {/* Status pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-feedback-success-bg)] border border-[var(--color-feedback-success-border)]">
            <CheckCircle size={13} className="text-matcha-500 shrink-0" />
            <span className="text-xs font-medium text-[var(--color-feedback-success-text)]">
              {cardCount} N{level} {contentLabel} in SRS
            </span>
          </div>
          {/* Remove trigger */}
          <button
            onClick={() => setUiState('confirm-remove')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:text-sakura-600 hover:bg-[var(--color-feedback-error-bg)] border border-transparent hover:border-[var(--color-feedback-error-border)] transition-all cursor-pointer"
          >
            <Trash2 size={12} />
            Remove
          </button>
        </motion.div>
      )}

      {/* ── Confirm removal ── */}
      {uiState === 'confirm-remove' && (
        <motion.div
          key="confirm"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-[var(--color-feedback-error-border)] bg-[var(--color-feedback-error-bg)]"
        >
          <Trash2 size={14} className="text-sakura-500 shrink-0" />
          <span className="text-xs text-[var(--color-feedback-error-text)] flex-1">
            Remove {cardCount} cards and all review history? This cannot be undone.
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setUiState('enrolled')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-bg-primary border border-border text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={11} />
              Cancel
            </button>
            <button
              onClick={handleRemove}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-sakura-500 text-white hover:bg-sakura-600 transition-colors cursor-pointer"
            >
              <Trash2 size={11} />
              Remove
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Removing in progress ── */}
      {uiState === 'removing' && (
        <motion.div
          key="removing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 text-sm text-text-secondary"
        >
          <RefreshCw size={14} className="animate-spin text-sakura-500" />
          Removing from SRS…
        </motion.div>
      )}
    </AnimatePresence>
  );
}
