/**
 * Persistent VOICEVOX Engine state.
 *
 * All installation/runtime state lives here so it survives
 * navigation away from and back to the Settings page.
 * The Tauri download/extract runs in Rust — this store just tracks it.
 */
import { create } from 'zustand';
import {
  getVoicevoxStatus,
  downloadVoicevox,
  extractVoicevox,
  startVoicevox,
  stopVoicevox,
  uninstallVoicevox,
  onDownloadProgress,
  formatBytes,
  type VoicevoxStatus,
} from '@/services/voicevoxManager';

// ── Types ─────────────────────────────────────────────────────

export type VoicevoxPhase =
  | 'idle'
  | 'downloading'
  | 'extracting'
  | 'installed'
  | 'starting'
  | 'running'
  | 'error';

interface Progress {
  percentage: number;
  label: string;
}

interface VoicevoxStore {
  phase: VoicevoxPhase;
  progress: Progress | null;
  error: string | null;
  status: VoicevoxStatus | null;

  /** Character UUIDs the user picked. VVM files are derived from this at install time. */
  selectedCharacters: string[];

  // ── Actions ──
  /** Called once at app startup — fetches status from Tauri. */
  init: () => Promise<void>;
  /** Toggle a character in/out of the selection. */
  toggleCharacter: (uuid: string) => void;
  /** Replace the entire selection. */
  setSelectedCharacters: (uuids: string[]) => void;
  /** Full install: download → extract (only selected VVMs). */
  install: () => Promise<void>;
  /** Start the engine process. */
  start: () => Promise<void>;
  /** Stop the engine process. */
  stop: () => Promise<void>;
  /** Remove the installed engine files. */
  uninstall: () => Promise<void>;
  /** Re-fetch status from Tauri (e.g. after app regains focus). */
  refresh: () => Promise<void>;
}

// ── Store ─────────────────────────────────────────────────────

export const useVoicevoxStore = create<VoicevoxStore>((set, get) => ({
  phase: 'idle',
  progress: null,
  error: null,
  status: null,
  selectedCharacters: [],

  // ── init ─────────────────────────────────────────────────────
  init: async () => {
    try {
      const status = await getVoicevoxStatus();
      set({
        status,
        // Only set phase from status if we're not already mid-install.
        // If the store already has downloading/extracting, keep it.
        ...(get().phase === 'idle' || get().phase === 'installed' || get().phase === 'running'
          ? { phase: status.running ? 'running' : status.installed ? 'installed' : 'idle' }
          : {}),
      });
    } catch {
      // Tauri not available in browser dev mode — silently ignore
    }
  },

  // ── character selection ──────────────────────────────────────
  toggleCharacter: (uuid: string) => set((s) => ({
    selectedCharacters: s.selectedCharacters.includes(uuid)
      ? s.selectedCharacters.filter((u) => u !== uuid)
      : [...s.selectedCharacters, uuid],
  })),
  setSelectedCharacters: (uuids: string[]) => set({ selectedCharacters: uuids }),

  // ── install ───────────────────────────────────────────────────
  install: async () => {
    // Derive VVM files from selected characters FIRST (needed for download)
    let vvmFiles: string[] = [];
    try {
      const catalogRes = await fetch('/voicevox-samples/catalog.json');
      const catalog = await catalogRes.json();
      const selected = get().selectedCharacters;
      const neededFiles = new Set<string>();
      for (const speaker of catalog.speakers) {
        if (selected.includes(speaker.uuid)) {
          speaker.vvm_files.forEach((f: string) => neededFiles.add(f));
        }
      }
      vvmFiles = [...neededFiles];
    } catch {
      // If catalog can't be loaded, can't proceed
      set({ phase: 'error', error: 'Failed to load voice catalog', progress: null });
      return;
    }

    if (vvmFiles.length === 0) {
      set({ phase: 'error', error: 'No voices selected', progress: null });
      return;
    }

    set({ error: null, phase: 'downloading', progress: { percentage: 0, label: 'Starting download…' } });

    // ── Download engine core + selected VVMs ──
    const unlistenDownload = await onDownloadProgress((p) => {
      set({
        progress: {
          percentage: p.percentage,
          label: `${p.label}… ${formatBytes(p.downloaded_bytes)} / ${formatBytes(p.total_bytes)}`,
        },
      });
    });

    try {
      await downloadVoicevox(vvmFiles);
    } catch (e) {
      unlistenDownload();
      set({ phase: 'error', error: `Download failed: ${e}`, progress: null });
      return;
    }

    unlistenDownload();

    // ── Extract core + install VVMs ──
    set({ phase: 'extracting', progress: { percentage: -1, label: `Installing engine + ${vvmFiles.length} voice model(s)…` } });

    try {
      await extractVoicevox(vvmFiles);
    } catch (e) {
      set({ phase: 'error', error: `Extraction failed: ${e}`, progress: null });
      return;
    }
    set({ phase: 'installed', progress: null });
    await get().refresh();
  },

  // ── start ─────────────────────────────────────────────────────
  start: async () => {
    set({ phase: 'starting', error: null });
    try {
      await startVoicevox();
      set({ phase: 'running' });
      await get().refresh();
    } catch (e) {
      set({ phase: 'installed', error: `Failed to start engine: ${e}` });
    }
  },

  // ── stop ──────────────────────────────────────────────────────
  stop: async () => {
    try {
      await stopVoicevox();
      set({ phase: 'installed' });
      await get().refresh();
    } catch (e) {
      set({ error: `Failed to stop engine: ${e}` });
    }
  },

  // ── uninstall ─────────────────────────────────────────────────
  uninstall: async () => {
    try {
      set({ phase: 'idle', progress: { percentage: -1, label: 'Deleting engine files…' } });
      await uninstallVoicevox();
      // Re-fetch status so dir_exists updates and the button disappears
      const status = await getVoicevoxStatus();
      set({ phase: 'idle', progress: null, error: null, status });
    } catch (e) {
      set({ phase: 'error', progress: null, error: `Delete failed: ${e}` });
      // Still refresh so UI reflects reality
      try {
        const status = await getVoicevoxStatus();
        set({ status });
      } catch { /* ignore */ }
    }
  },

  // ── refresh ───────────────────────────────────────────────────
  refresh: async () => {
    try {
      const status = await getVoicevoxStatus();
      set({ status });
    } catch {
      // ignore
    }
  },
}));
