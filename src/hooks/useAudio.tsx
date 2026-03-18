import { useCallback, useState, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { synthesizeOpenAI, synthesizeVoicevox } from '@/services/ttsService';

/**
 * Hook for Japanese pronunciation.
 *
 * Provider strategy (based on user settings):
 *   - 'voicevox': Uses VOICEVOX Engine (local, free, native Japanese voices)
 *   - 'openai':   Uses OpenAI gpt-4o-mini-tts voice LLM (requires API key)
 *   - 'browser':  Uses Web Speech API (free, no setup, final fallback)
 *
 * Falls back to browser TTS if the selected provider fails.
 */
export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const soundEnabled = useUserStore((s) => s.settings.soundEnabled);

  /**
   * Play pronunciation for the given text.
   *
   * @param text - Japanese text to pronounce
   * @param options.rate - Playback rate for browser TTS (default 0.85)
   * @param options.slow - If true, use slow/teacher mode
   * @param options.lang - Language code (default 'ja-JP')
   */
  const play = useCallback(async (
    text: string,
    options?: { rate?: number; slow?: boolean; lang?: string }
  ) => {
    if (!useUserStore.getState().settings.soundEnabled) return;
    const { rate, slow = false, lang = 'ja-JP' } = options ?? {};
    const settings = useUserStore.getState().settings;

    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    window.speechSynthesis?.cancel();

    /** Helper: play an audio object URL and manage state. */
    const playUrl = async (url: string): Promise<boolean> => {
      try {
        const audio = new Audio(url);
        audio.playbackRate = rate ?? 1.0;
        currentAudioRef.current = audio;
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        await audio.play();
        return true;
      } catch {
        setIsPlaying(false);
        return false;
      }
    };

    // Strategy 1: VOICEVOX Engine (local, native JP)
    if (settings.ttsProvider === 'voicevox') {
      try {
        const url = await synthesizeVoicevox(
          text,
          settings.voicevoxBaseUrl,
          settings.voicevoxSpeakerId,
          slow,
        );
        if (await playUrl(url)) return;
      } catch {
        setIsPlaying(false);
      }
    }

    // Strategy 2: OpenAI gpt-4o-mini-tts
    if (settings.ttsProvider === 'openai' && settings.openaiApiKey) {
      try {
        const url = await synthesizeOpenAI(
          text,
          settings.openaiApiKey,
          settings.openaiTtsVoice,
          slow,
        );
        if (await playUrl(url)) return;
      } catch {
        setIsPlaying(false);
      }
    }

    // Strategy 3: Web Speech API (free fallback)
    playBrowserTTS(text, lang, slow ? 0.6 : (rate ?? 0.85));
  }, []);

  /** Web Speech API fallback. */
  const playBrowserTTS = useCallback((text: string, lang: string, rate: number) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find((v) => v.lang.startsWith('ja'));
    if (jaVoice) utterance.voice = jaVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  }, []);

  return { play, stop, isPlaying, soundEnabled };
}

/**
 * Speaker button for inline pronunciation playback.
 * No audioPath needed — uses the configured TTS provider automatically.
 */
export function AudioButton({
  text,
  showSlow = false,
  className = '',
}: {
  text: string;
  showSlow?: boolean;
  className?: string;
}) {
  const { play, isPlaying } = useAudio();
  const [slowMode, setSlowMode] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    play(text, { slow: slowMode });
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
