import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { StrokeAnimation } from './StrokeAnimation';
import { getStrokeData } from '@/data/strokeData';
import { AudioButton } from '@/hooks/useAudio';
import { KANA_MNEMONICS } from '@/data/kanaMnemonics';
import { useUserStore } from '@/stores/userStore';

interface KanaItem {
  id: number;
  character: string;
  romaji: string;
  row_group: string;
  stroke_count: number;
}

interface KanaDetailModalProps {
  kana: KanaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStudy?: (kana: KanaItem) => void;
  type: 'hiragana' | 'katakana';
}

export function KanaDetailModal({
  kana,
  isOpen,
  onClose,
  onStudy,
  type,
}: KanaDetailModalProps) {
  if (!kana) return null;

  const hasStrokeData = getStrokeData(kana.character) !== null;
  const typeLabel = type === 'hiragana' ? 'Hiragana' : 'Katakana';

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            {/* Overlay */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            {/* Content */}
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-bg-secondary rounded-2xl border border-border shadow-2xl p-8 focus:outline-none"
              >
                {/* Close button */}
                <Dialog.Close asChild>
                  <button
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 1l12 12M13 1L1 13" />
                    </svg>
                  </button>
                </Dialog.Close>

                {/* Type badge */}
                <div className="flex justify-center mb-4">
                  <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                    {typeLabel}
                  </span>
                </div>

                {/* Character display / Stroke animation */}
                <div className="flex justify-center">
                  {hasStrokeData ? (
                    <StrokeAnimation
                      character={kana.character}
                      size={180}
                      speed={0.7}
                      loop={true}
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-[140px] character-display text-text-primary leading-none">
                        {kana.character}
                      </span>
                      <p className="text-xs text-text-secondary mt-2">
                        Stroke animation coming soon
                      </p>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="text-center mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-3xl font-bold text-accent">
                      {kana.romaji}
                    </p>
                    <AudioButton text={kana.character} showSlow />
                  </div>
                  <p className="text-sm text-text-secondary">
                    {kana.stroke_count} stroke{kana.stroke_count !== 1 ? 's' : ''} | {kana.row_group.replace('-', ' ')}
                  </p>
                </div>

                {/* Mnemonic */}
                {KANA_MNEMONICS[kana.character] && (
                  <div className="bg-[var(--color-feedback-info-bg)] border border-[var(--color-feedback-info-border)] rounded-xl p-3 mt-4">
                    <p className="text-xs text-[var(--color-feedback-info-text)] font-semibold mb-1">Memory trick</p>
                    <p className="text-sm text-[var(--color-feedback-info-text)]">
                      {KANA_MNEMONICS[kana.character]}
                    </p>
                  </div>
                )}

                {/* User mnemonic */}
                <UserKanaMnemonic kanaId={kana.id} />

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  {onStudy && (
                    <button
                      onClick={() => onStudy(kana)}
                      className="flex-1 py-2.5 bg-accent text-white rounded-xl font-medium cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      Study in detail
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 bg-bg-muted text-text-primary rounded-xl font-medium cursor-pointer hover:bg-bg-subtle transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function UserKanaMnemonic({ kanaId }: { kanaId: number }) {
  const { user } = useUserStore();
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    import('@/services/mnemonicService').then(({ getUserMnemonic }) => {
      getUserMnemonic(user.id, 'kana', kanaId).then((m) => setText(m ?? ''));
    });
  }, [user, kanaId]);

  const handleSave = async () => {
    if (!user) return;
    const { saveUserMnemonic, deleteUserMnemonic } = await import('@/services/mnemonicService');
    if (text.trim()) {
      await saveUserMnemonic(user.id, 'kana', kanaId, text.trim());
    } else {
      await deleteUserMnemonic(user.id, 'kana', kanaId);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] text-text-secondary font-semibold">Your note</p>
        {saved && <span className="text-[10px] text-matcha-500">Saved!</span>}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
        placeholder="Add your own memory trick..."
        className="w-full text-xs bg-bg-primary border border-border rounded-lg p-2 outline-none focus:border-accent resize-none text-text-primary placeholder:text-text-secondary/40"
        rows={2}
      />
    </div>
  );
}
