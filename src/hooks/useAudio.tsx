import { useCallback, useState, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useHighlightStore } from '@/stores/highlightStore';
import { synthesizeOpenAI, synthesizeVoicevox, type SynthResult } from '@/services/ttsService';
import { estimateTimings, type WordTiming } from '@/services/wordTimingService';

/**
 * Hook for Japanese pronunciation with karaoke-style word highlighting.
 *
 * Provider strategy (based on user settings):
 *   - 'voicevox': Uses VOICEVOX Engine (local, free, native Japanese voices)
 *   - 'openai':   Uses OpenAI gpt-4o-mini-tts voice LLM (requires API key)
 *   - 'browser':  Uses Web Speech API (free, no setup, final fallback)
 *
 * Falls back to browser TTS if the selected provider fails.
 * Drives the highlightStore when timing data is available.
 */
export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const soundEnabled = useUserStore((s) => s.settings.soundEnabled);

  /** Stop the highlight animation timer. */
  const stopHighlightTimer = useCallback(() => {
    if (highlightTimerRef.current !== null) {
      cancelAnimationFrame(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
    useHighlightStore.getState().stop();
  }, []);

  /**
   * Start a requestAnimationFrame loop that updates the highlight store
   * based on audio.currentTime vs word timings.
   */
  const startHighlightTimer = useCallback((
    audio: HTMLAudioElement,
    instanceId: string,
    timings: WordTiming[],
  ) => {
    const store = useHighlightStore.getState();
    store.start(instanceId, timings);

    const tick = () => {
      if (audio.paused || audio.ended) {
        useHighlightStore.getState().stop();
        highlightTimerRef.current = null;
        return;
      }

      const currentMs = audio.currentTime * 1000;

      // Find the timing segment that contains currentMs.
      // Use <= for endMs so the last word stays highlighted until the next one starts.
      // If we're in a gap (pause between words), keep the last highlighted word.
      let newIndex = -1;
      for (let i = timings.length - 1; i >= 0; i--) {
        if (currentMs >= timings[i].startMs) {
          newIndex = i;
          break;
        }
      }

      // Clamp to valid range
      if (newIndex >= timings.length) newIndex = timings.length - 1;

      if (newIndex >= 0 && newIndex !== useHighlightStore.getState().currentIndex) {
        useHighlightStore.getState().setCurrent(newIndex);
      }

      highlightTimerRef.current = requestAnimationFrame(tick);
    };

    highlightTimerRef.current = requestAnimationFrame(tick);
  }, []);

  /**
   * Play pronunciation for the given text.
   *
   * @param text - Japanese text to pronounce
   * @param options.rate - Playback rate for browser TTS (default 0.85)
   * @param options.slow - If true, use slow/teacher mode
   * @param options.lang - Language code (default 'ja-JP')
   * @param options.highlightId - Unique ID to match with HighlightableText
   */
  const play = useCallback(async (
    text: string,
    options?: { rate?: number; slow?: boolean; lang?: string; highlightId?: string }
  ) => {
    if (!useUserStore.getState().settings.soundEnabled) return;
    const { rate, slow = false, lang = 'ja-JP', highlightId } = options ?? {};
    const settings = useUserStore.getState().settings;

    // Stop any currently playing audio + highlight
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    window.speechSynthesis?.cancel();
    stopHighlightTimer();

    /** Helper: play an audio object URL, optionally with highlighting. */
    const playResult = async (result: SynthResult): Promise<boolean> => {
      try {
        const audio = new Audio(result.url);
        audio.playbackRate = rate ?? 1.0;
        currentAudioRef.current = audio;
        setIsPlaying(true);
        audio.onended = () => { setIsPlaying(false); stopHighlightTimer(); };
        audio.onerror = () => { setIsPlaying(false); stopHighlightTimer(); };

        await audio.play();

        // Start highlight timer if we have timings and an instanceId
        if (highlightId && result.timings && result.timings.length > 1) {
          startHighlightTimer(audio, highlightId, result.timings);
        }

        return true;
      } catch {
        setIsPlaying(false);
        stopHighlightTimer();
        return false;
      }
    };

    // Strategy 1: VOICEVOX Engine (local, native JP)
    if (settings.ttsProvider === 'voicevox') {
      try {
        const result = await synthesizeVoicevox(
          text,
          settings.voicevoxBaseUrl,
          settings.voicevoxSpeakerId,
          slow,
        );
        if (await playResult(result)) return;
      } catch {
        setIsPlaying(false);
      }
    }

    // Strategy 2: OpenAI gpt-4o-mini-tts
    if (settings.ttsProvider === 'openai' && settings.openaiApiKey) {
      try {
        const result = await synthesizeOpenAI(
          text,
          settings.openaiApiKey,
          settings.openaiTtsVoice,
          slow,
        );
        if (await playResult(result)) return;
      } catch {
        setIsPlaying(false);
      }
    }

    // Strategy 3: Web Speech API (free fallback) — uses onboundary for highlighting
    playBrowserTTS(text, lang, slow ? 0.6 : (rate ?? 0.85), highlightId);
  }, [stopHighlightTimer, startHighlightTimer]);

  /** Web Speech API fallback with boundary-based highlighting. */
  const playBrowserTTS = useCallback((text: string, lang: string, rate: number, highlightId?: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find((v) => v.lang.startsWith('ja'));
    if (jaVoice) utterance.voice = jaVoice;

    // For highlighting: estimate timings and drive via boundary events
    if (highlightId) {
      // Estimate ~4 seconds per sentence as rough duration for estimation
      const estimatedDuration = text.length * 120; // ~120ms per char
      const timings = estimateTimings(text, estimatedDuration);
      if (timings.length > 1) {
        useHighlightStore.getState().start(highlightId, timings);
        utterance.onboundary = (e) => {
          if (e.name === 'word') {
            // Find which timing segment this charIndex falls into
            let cumLen = 0;
            for (let i = 0; i < timings.length; i++) {
              cumLen += timings[i].text.length;
              if (e.charIndex < cumLen) {
                useHighlightStore.getState().setCurrent(i);
                break;
              }
            }
          }
        };
      }
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => { setIsPlaying(false); stopHighlightTimer(); };
    utterance.onerror = () => { setIsPlaying(false); stopHighlightTimer(); };

    window.speechSynthesis.speak(utterance);
  }, [stopHighlightTimer]);

  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    stopHighlightTimer();
  }, [stopHighlightTimer]);

  return { play, stop, isPlaying, soundEnabled };
}

// ── Unique ID counter for highlight instances ─────────────────
let _highlightIdCounter = 0;
export function generateHighlightId(): string {
  return `hl_${++_highlightIdCounter}`;
}

/**
 * Speaker button for inline pronunciation playback.
 * Supports optional word highlighting via highlightId.
 */
export function AudioButton({
  text,
  showSlow = false,
  className = '',
  highlightId,
}: {
  text: string;
  showSlow?: boolean;
  className?: string;
  /** Pass a highlightId to enable karaoke-style word highlighting on a nearby HighlightableText. */
  highlightId?: string;
}) {
  const { play, isPlaying } = useAudio();
  const [slowMode, setSlowMode] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    play(text, { slow: slowMode, highlightId });
  };

  const handleToggleSlow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlowMode((s) => !s);
  };

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      <button
        onClick={handlePlay}
        className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors cursor-pointer shrink-0"
        title={slowMode ? 'Play pronunciation (slow)' : 'Play pronunciation'}
      >
        {isPlaying ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="2" y="2" width="3" height="8" rx="0.5" />
            <rect x="7" y="2" width="3" height="8" rx="0.5" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 4v4h2.5l3 2.5V1.5L4.5 4H2z" />
            <path d="M8.5 3.5c.6.5 1 1.4 1 2.5s-.4 2-1 2.5" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {showSlow && (
        <button
          onClick={handleToggleSlow}
          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[8px] font-bold transition-colors cursor-pointer shrink-0 ${
            slowMode
              ? 'bg-accent text-white'
              : 'bg-accent/10 text-accent hover:bg-accent/20'
          }`}
          title={slowMode ? 'Switch to normal speed' : 'Switch to slow speed'}
        >
          {slowMode ? '0.7' : '1x'}
        </button>
      )}
    </span>
  );
}
