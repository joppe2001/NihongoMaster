import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

// ── Types ─────────────────────────────────────────────────────

export interface VoicevoxStatus {
  installed: boolean;
  /** True if the engine directory exists on disk, even if the install is broken. */
  dir_exists: boolean;
  running: boolean;
  pid: number | null;
  version: string;
  platform: string;
  download_url: string;
  download_size_bytes: number;
}

export interface DownloadProgress {
  downloaded_bytes: number;
  total_bytes: number;
  percentage: number;
}

export interface ExtractProgress {
  extracted_files: number;
  total_files: number;
  percentage: number;
}

// ── Commands ──────────────────────────────────────────────────

export async function getVoicevoxStatus(): Promise<VoicevoxStatus> {
  return invoke<VoicevoxStatus>('voicevox_get_status');
}

/**
 * Start the download. Listen to progress via onDownloadProgress().
 * This is a long-running async command (~1.7 GB download).
 */
export async function downloadVoicevox(): Promise<void> {
  return invoke('voicevox_download');
}

/**
 * Extract the downloaded archive.
 * If selectedVvmFiles is provided, only those model files are kept after extraction.
 * Pass an empty array to keep all models (legacy behaviour).
 */
export async function extractVoicevox(selectedVvmFiles: string[] = []): Promise<void> {
  return invoke('voicevox_extract', { selectedVvmFiles });
}

/**
 * Start the VOICEVOX Engine process.
 * Resolves when the engine is responsive (up to 30s) or rejects on failure.
 */
export async function startVoicevox(): Promise<void> {
  return invoke('voicevox_start');
}

export async function stopVoicevox(): Promise<void> {
  return invoke('voicevox_stop');
}

export async function uninstallVoicevox(): Promise<void> {
  return invoke('voicevox_uninstall');
}

// ── Event listeners ───────────────────────────────────────────

export function onDownloadProgress(
  callback: (progress: DownloadProgress) => void,
): Promise<UnlistenFn> {
  return listen<DownloadProgress>('voicevox://download-progress', (e) =>
    callback(e.payload),
  );
}

export function onExtractProgress(
  callback: (progress: ExtractProgress) => void,
): Promise<UnlistenFn> {
  return listen<ExtractProgress>('voicevox://extract-progress', (e) =>
    callback(e.payload),
  );
}

export function onEngineStarted(callback: () => void): Promise<UnlistenFn> {
  return listen('voicevox://engine-started', () => callback());
}

// ── Helpers ───────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}
