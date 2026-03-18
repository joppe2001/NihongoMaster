/**
 * Word Timing Service — computes per-word timing for karaoke-style highlighting.
 *
 * Three strategies:
 *   1. VOICEVOX: precise timing from accent_phrases[].moras[] (near-perfect)
 *   2. Estimation: proportional to mora count (for OpenAI / fallback)
 *   3. Browser: driven by SpeechSynthesisUtterance.onboundary events
 */

export interface WordTiming {
  /** The word/segment text. */
  text: string;
  /** Start time in milliseconds from audio start. */
  startMs: number;
  /** End time in milliseconds. */
  endMs: number;
  /** Index in the words array. */
  index: number;
}

// ── Japanese text segmentation ────────────────────────────────

/**
 * Split Japanese text into segments suitable for highlighting.
 *
 * Strategy: split on character class boundaries —
 *   - Kanji runs (CJK Unified Ideographs)
 *   - Hiragana runs
 *   - Katakana runs
 *   - Punctuation (individual)
 *   - Latin/number runs
 *
 * This isn't perfect morphological analysis, but it's good enough for
 * visual highlighting and matches how most text is naturally read.
 */
export function segmentJapanese(text: string): string[] {
  if (!text) return [];

  const segments: string[] = [];
  // Regex: group consecutive chars of the same class
  const regex = /[\u4E00-\u9FFF\u3400-\u4DBF]+|[\u3040-\u309F]+|[\u30A0-\u30FF]+|[\uFF66-\uFF9F]+|[a-zA-Za-zA-Z0-9０-９]+|[。、！？「」『』（）…ー～・\s]+|./g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const seg = match[0].trim();
    if (seg) segments.push(seg);
  }

  return segments;
}

/**
 * Count morae (timing units) in Japanese text.
 * Each kana = 1 mora. Each kanji ≈ 2 morae (rough estimate).
 * Punctuation = 0.5 mora (pause).
 */
function countMorae(text: string): number {
  let count = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0x3040 && code <= 0x309F) count += 1;       // Hiragana
    else if (code >= 0x30A0 && code <= 0x30FF) count += 1;  // Katakana
    else if (code >= 0x4E00 && code <= 0x9FFF) count += 2;  // Kanji
    else if (code >= 0x3400 && code <= 0x4DBF) count += 2;  // Kanji ext
    else if ('。、！？…'.includes(char)) count += 0.5;       // Punctuation pause
    else count += 0.5;                                       // Other
  }
  return Math.max(count, 0.5);
}

// ── VOICEVOX timing extraction ────────────────────────────────

interface VoicevoxMora {
  text: string;
  consonant?: string;
  consonant_length?: number;
  vowel: string;
  vowel_length: number;
  pitch: number;
}

interface VoicevoxAccentPhrase {
  moras: VoicevoxMora[];
  accent: number;
  pause_mora?: VoicevoxMora | null;
}

/**
 * Extract word timings from a VOICEVOX audio_query response.
 *
 * Uses VOICEVOX accent phrases directly as highlight segments —
 * they represent natural word/phrase boundaries in Japanese and
 * have precise per-mora timing built in. No alignment needed.
 */
export function timingsFromVoicevoxQuery(
  query: { accent_phrases: VoicevoxAccentPhrase[]; speedScale?: number },
  _originalText: string,
): WordTiming[] {
  if (!query.accent_phrases || query.accent_phrases.length === 0) return [];

  const speed = query.speedScale ?? 1.0;
  const timings: WordTiming[] = [];
  let currentMs = 0;

  for (let i = 0; i < query.accent_phrases.length; i++) {
    const phrase = query.accent_phrases[i];

    // Compute phrase text and duration from moras
    let phraseText = '';
    let phraseDurationSec = 0;

    for (const mora of phrase.moras) {
      phraseDurationSec += (mora.consonant_length ?? 0) + mora.vowel_length;
      phraseText += mora.text;
    }

    // Scale by speed
    const durationMs = (phraseDurationSec / speed) * 1000;

    if (phraseText) {
      timings.push({
        text: phraseText,
        startMs: currentMs,
        endMs: currentMs + durationMs,
        index: timings.length,
      });
    }

    currentMs += durationMs;

    // Pause mora (silence between phrases) — advance time but don't add a highlight segment
    if (phrase.pause_mora) {
      const pauseMs = (phrase.pause_mora.vowel_length / speed) * 1000;
      currentMs += pauseMs;
    }
  }

  return timings;
}

// ── Duration-based estimation ─────────────────────────────────

/**
 * Estimate word timings based on total audio duration and mora counts.
 * Used for OpenAI TTS and any provider without native timing data.
 */
export function estimateTimings(
  text: string,
  totalDurationMs: number,
): WordTiming[] {
  const segments = segmentJapanese(text);
  if (segments.length === 0) return [];

  // Single segment — highlight the whole thing
  if (segments.length === 1) {
    return [{ text: segments[0], startMs: 0, endMs: totalDurationMs, index: 0 }];
  }

  // Count total morae for proportional distribution
  const moraeCounts = segments.map(countMorae);
  const totalMorae = moraeCounts.reduce((a, b) => a + b, 0);

  const timings: WordTiming[] = [];
  let currentMs = 0;

  for (let i = 0; i < segments.length; i++) {
    const proportion = moraeCounts[i] / totalMorae;
    const durationMs = proportion * totalDurationMs;
    timings.push({
      text: segments[i],
      startMs: currentMs,
      endMs: currentMs + durationMs,
      index: i,
    });
    currentMs += durationMs;
  }

  return timings;
}

/**
 * Get audio duration from a blob URL by decoding it.
 * Returns duration in milliseconds.
 */
export async function getAudioDurationMs(url: string): Promise<number> {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const audioCtx = new AudioContext();
    const decoded = await audioCtx.decodeAudioData(buffer);
    const durationMs = decoded.duration * 1000;
    audioCtx.close();
    return durationMs;
  } catch {
    return 0;
  }
}
