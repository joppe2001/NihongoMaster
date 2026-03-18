import type { OpenAiTtsVoice } from '@/lib/types';
import type { WordTiming } from '@/services/wordTimingService';
import { timingsFromVoicevoxQuery, estimateTimings, getAudioDurationMs } from '@/services/wordTimingService';

/** Synthesis result: audio URL + optional timing data for highlighting. */
export interface SynthResult {
  url: string;
  timings?: WordTiming[];
}

/**
 * TTS Service — handles OpenAI gpt-4o-mini-tts API calls with in-memory caching.
 *
 * Audio blobs are cached by (text + voice) so repeated plays of the same word
 * don't hit the API again. Cache is session-scoped (cleared on app restart).
 */

// ── In-memory cache: stores full SynthResult (URL + timings) ──
const audioCache = new Map<string, SynthResult>();

function cacheKey(text: string, voice: string): string {
  return `${voice}::${text}`;
}

/**
 * Synthesize speech via OpenAI gpt-4o-mini-tts.
 * Returns an object URL pointing to the audio blob.
 */
export async function synthesizeOpenAI(
  text: string,
  apiKey: string,
  voice: OpenAiTtsVoice = 'nova',
  slow = false,
): Promise<SynthResult> {
  const key = cacheKey(text, `${voice}${slow ? '_slow' : ''}`);

  // Return cached result if available (includes timings)
  const cached = audioCache.get(key);
  if (cached) return cached;

  const instructions = slow
    ? 'You are a Japanese language teacher. Pronounce this slowly and very clearly, enunciating each mora distinctly. Pause briefly between syllables.'
    : 'You are a native Japanese speaker. Pronounce this naturally and clearly at a normal conversational pace.';

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      input: text,
      voice,
      instructions,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`OpenAI TTS failed (${response.status}): ${errorBody}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  // Estimate timings from audio duration
  const durationMs = await getAudioDurationMs(objectUrl).catch(() => 0);
  const timings = durationMs > 0 ? estimateTimings(text, durationMs) : undefined;

  // Cache the full result (URL + timings)
  const result: SynthResult = { url: objectUrl, timings };
  audioCache.set(key, result);

  return result;
}

/**
 * Clear the entire audio cache (e.g., when user changes voice).
 */
export function clearAudioCache(): void {
  for (const result of audioCache.values()) {
    URL.revokeObjectURL(result.url);
  }
  audioCache.clear();
}

/**
 * Get cache stats for debugging / settings display.
 */
export function getAudioCacheSize(): number {
  return audioCache.size;
}

// ─────────────────────────────────────────────────────────────
// VOICEVOX
// ─────────────────────────────────────────────────────────────

export interface VoicevoxSpeaker {
  name: string;
  speaker_uuid: string;
  styles: { name: string; id: number }[];
}

/**
 * Fetch available speakers from a running VOICEVOX Engine.
 * Returns an empty array if the engine is not reachable.
 */
export async function fetchVoicevoxSpeakers(baseUrl: string): Promise<VoicevoxSpeaker[]> {
  try {
    const res = await fetch(`${baseUrl}/speakers`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Check whether VOICEVOX Engine is reachable.
 */
export async function checkVoicevoxConnection(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/version`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

export interface VoicevoxSpeakerInfo {
  /** Base64-encoded PNG portrait of the character. */
  portrait: string;
  /** Per-style icons (base64 PNG), indexed in the same order as styles. */
  style_infos: { id: number; icon: string; portrait?: string }[];
}

/**
 * Fetch detailed info (portrait images) for a single speaker.
 */
export async function fetchVoicevoxSpeakerInfo(
  baseUrl: string,
  speakerUuid: string,
): Promise<VoicevoxSpeakerInfo | null> {
  try {
    const res = await fetch(
      `${baseUrl}/speaker_info?speaker_uuid=${encodeURIComponent(speakerUuid)}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Quick preview — synthesize text with a given speaker style.
 * Falls back to a default sample phrase if no custom text is provided.
 * Returns an object URL that can be played immediately.
 */
export async function previewVoicevoxVoice(
  baseUrl: string,
  speakerId: number,
  customText?: string,
): Promise<string> {
  const text = customText?.trim() || 'こんにちは、日本語の勉強を始めましょう。';

  const queryRes = await fetch(
    `${baseUrl}/audio_query?${new URLSearchParams({ text, speaker: String(speakerId) })}`,
    { method: 'POST' },
  );
  if (!queryRes.ok) throw new Error('audio_query failed');
  const query = await queryRes.json();

  const synthRes = await fetch(
    `${baseUrl}/synthesis?${new URLSearchParams({ speaker: String(speakerId) })}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    },
  );
  if (!synthRes.ok) throw new Error('synthesis failed');

  const blob = await synthRes.blob();
  return URL.createObjectURL(blob);
}

/**
 * Synthesize speech via VOICEVOX Engine (local REST API).
 *
 * Flow:
 *   1. POST /audio_query?text=...&speaker=... → gets query JSON
 *   2. Optionally set speedScale for slow mode
 *   3. POST /synthesis?speaker=... (body = query JSON) → WAV blob
 *
 * Returns an object URL for the WAV audio.
 */
export async function synthesizeVoicevox(
  text: string,
  baseUrl: string,
  speakerId: number,
  slow = false,
): Promise<SynthResult> {
  const key = cacheKey(text, `voicevox:${speakerId}${slow ? '_slow' : ''}`);

  const cached = audioCache.get(key);
  if (cached) return cached;

  // Step 1: audio_query
  const queryRes = await fetch(
    `${baseUrl}/audio_query?${new URLSearchParams({ text, speaker: String(speakerId) })}`,
    { method: 'POST' },
  );

  if (!queryRes.ok) {
    throw new Error(`VOICEVOX audio_query failed (${queryRes.status})`);
  }

  const query = await queryRes.json();

  // Adjust speed for slow mode
  if (slow) {
    query.speedScale = 0.75;
    query.pauseLengthScale = 1.5;
  }

  // Step 2: synthesis
  const synthRes = await fetch(
    `${baseUrl}/synthesis?${new URLSearchParams({ speaker: String(speakerId) })}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    },
  );

  if (!synthRes.ok) {
    throw new Error(`VOICEVOX synthesis failed (${synthRes.status})`);
  }

  const blob = await synthRes.blob();
  const objectUrl = URL.createObjectURL(blob);

  // Extract precise timings from the VOICEVOX query data
  const timings = timingsFromVoicevoxQuery(query, text);

  // Cache the full result (URL + timings)
  const result: SynthResult = { url: objectUrl, timings };
  audioCache.set(key, result);

  return result;
}
