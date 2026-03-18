/**
 * VoicevoxVoicePicker — visual voice character selector.
 *
 * Works in TWO modes:
 *   1. **Offline** (before engine installed): uses bundled catalog.json + MP3 samples
 *   2. **Live** (engine running): uses live API for synthesis + portraits
 *
 * In offline mode, users pick voices to download. In live mode, users switch active voice.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  fetchVoicevoxSpeakers,
  fetchVoicevoxSpeakerInfo,
  previewVoicevoxVoice,
  type VoicevoxSpeaker,
  type VoicevoxSpeakerInfo,
} from '@/services/ttsService';
import { clearAudioCache } from '@/services/ttsService';

// ── Types ─────────────────────────────────────────────────────

interface CatalogSpeaker {
  name: string;
  uuid: string;
  styles: { id: number; name: string }[];
  sample_id: number;
  vvm_files: string[];
  total_size_bytes: number;
}

interface Catalog {
  version: string;
  speakers: CatalogSpeaker[];
  vvm_files: Record<string, { size_bytes: number }>;
}

// ── Props ─────────────────────────────────────────────────────

interface VoicevoxVoicePickerProps {
  baseUrl: string;
  selectedSpeakerId: number;
  onSelect: (speakerId: number) => void;
  /** Offline mode: user is picking voices to download, not switching active voice. */
  selectionMode?: boolean;
  /** In selection mode: currently selected character UUIDs. */
  selectedCharacters?: string[];
  /** In selection mode: toggle a character in/out. */
  onToggleCharacter?: (uuid: string) => void;
  /** In selection mode: clear all. */
  onClearAll?: () => void;
}

// Cache portraits
const infoCache = new Map<string, VoicevoxSpeakerInfo>();

export function VoicevoxVoicePicker({
  baseUrl,
  selectedSpeakerId,
  onSelect,
  selectionMode = false,
  selectedCharacters = [],
  onToggleCharacter,
  onClearAll,
}: VoicevoxVoicePickerProps) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [liveSpeakers, setLiveSpeakers] = useState<VoicevoxSpeaker[]>([]);
  const [search, setSearch] = useState('');
  const [expandedSpeaker, setExpandedSpeaker] = useState<string | null>(null);
  const [portraits, setPortraits] = useState<Map<string, string>>(new Map());
  const [styleIcons, setStyleIcons] = useState<Map<number, string>>(new Map());
  const [previewingId, setPreviewingId] = useState<number | null>(null);
  const [customText, setCustomText] = useState('');
  const [isSaying, setIsSaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load catalog (always — works offline)
  useEffect(() => {
    fetch('/voicevox-samples/catalog.json')
      .then((r) => r.json())
      .then((c: Catalog) => setCatalog(c))
      .catch(() => {});
  }, []);

  // Load live speakers if engine is running (for portrait loading)
  useEffect(() => {
    if (selectionMode) return; // Don't need live data in selection mode
    fetchVoicevoxSpeakers(baseUrl).then((s) => {
      setLiveSpeakers(s);
      for (const speaker of s) {
        if (speaker.styles.some((st) => st.id === selectedSpeakerId)) {
          setExpandedSpeaker(speaker.speaker_uuid);
          break;
        }
      }
    });
  }, [baseUrl, selectedSpeakerId, selectionMode]);

  // Load portraits from live engine
  useEffect(() => {
    if (liveSpeakers.length === 0) return;
    liveSpeakers.forEach(async (speaker) => {
      if (infoCache.has(speaker.speaker_uuid)) {
        const info = infoCache.get(speaker.speaker_uuid)!;
        setPortraits((prev) => new Map(prev).set(speaker.speaker_uuid, info.portrait));
        info.style_infos.forEach((si) => {
          setStyleIcons((prev) => new Map(prev).set(si.id, si.icon));
        });
        return;
      }
      const info = await fetchVoicevoxSpeakerInfo(baseUrl, speaker.speaker_uuid);
      if (info) {
        infoCache.set(speaker.speaker_uuid, info);
        setPortraits((prev) => new Map(prev).set(speaker.speaker_uuid, info.portrait));
        info.style_infos.forEach((si) => {
          setStyleIcons((prev) => new Map(prev).set(si.id, si.icon));
        });
      }
    });
  }, [liveSpeakers, baseUrl]);

  // Use catalog speakers in selection mode, live speakers otherwise
  type SpeakerLike = { name: string; uuid: string; styles: { id: number; name: string }[] };
  const speakers: SpeakerLike[] =
    selectionMode && catalog
      ? catalog.speakers.map((s) => ({ name: s.name, uuid: s.uuid, styles: s.styles }))
      : liveSpeakers.map((s) => ({ name: s.name, uuid: s.speaker_uuid, styles: s.styles }));

  // ── Audio ─────────────────────────────────────────────────

  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPreviewingId(null);
    setIsSaying(false);
  }, []);

  const handlePreview = useCallback(async (styleId: number) => {
    stopAudio();
    if (previewingId === styleId) return;
    setPreviewingId(styleId);

    try {
      let url: string;
      if (selectionMode) {
        // Offline: play bundled sample MP3
        url = `/voicevox-samples/${styleId}.mp3`;
      } else {
        // Live: synthesize with engine
        url = await previewVoicevoxVoice(baseUrl, styleId, customText || undefined);
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setPreviewingId(null); audioRef.current = null; };
      audio.onerror = () => {
        // In selection mode, sample might not exist for this style — try the speaker's sample_id
        if (selectionMode && catalog) {
          const speaker = catalog.speakers.find((s) => s.styles.some((st) => st.id === styleId));
          if (speaker && speaker.sample_id !== styleId) {
            const fallback = new Audio(`/voicevox-samples/${speaker.sample_id}.mp3`);
            audioRef.current = fallback;
            fallback.onended = () => { setPreviewingId(null); audioRef.current = null; };
            fallback.onerror = () => { setPreviewingId(null); audioRef.current = null; };
            fallback.play().catch(() => setPreviewingId(null));
            return;
          }
        }
        setPreviewingId(null); audioRef.current = null;
      };
      await audio.play();
    } catch {
      setPreviewingId(null);
    }
  }, [baseUrl, previewingId, customText, stopAudio, selectionMode, catalog]);

  const handleSayIt = useCallback(async () => {
    if (!customText.trim() || selectionMode) return;
    stopAudio();
    setIsSaying(true);
    try {
      const url = await previewVoicevoxVoice(baseUrl, selectedSpeakerId, customText);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsSaying(false); audioRef.current = null; };
      audio.onerror = () => { setIsSaying(false); audioRef.current = null; };
      await audio.play();
    } catch {
      setIsSaying(false);
    }
  }, [baseUrl, selectedSpeakerId, customText, stopAudio, selectionMode]);

  // ── Character selection (for selection mode) ────────────────

  const isCharacterSelected = (uuid: string) => selectedCharacters.includes(uuid);

  // ── Helpers ─────────────────────────────────────────────────

  const handleSelectVoice = (styleId: number) => {
    onSelect(styleId);
    clearAudioCache();
  };

  const filtered = search.trim()
    ? speakers.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.styles.some((st) => st.name.toLowerCase().includes(search.toLowerCase()))
      )
    : speakers;

  const selectedSpeakerUuid = speakers.find((s) => s.styles.some((st) => st.id === selectedSpeakerId))?.uuid;
  const selectedStyleName = speakers.flatMap((s) => s.styles).find((st) => st.id === selectedSpeakerId)?.name;
  const selectedSpeakerName = speakers.find((s) => s.styles.some((st) => st.id === selectedSpeakerId))?.name;

  // Total download size for selection mode (derive VVM files from selected characters)
  const totalDownloadSize = (() => {
    if (!selectionMode || !catalog) return 0;
    const neededVvms = new Set<string>();
    catalog.speakers.forEach((s) => {
      if (selectedCharacters.includes(s.uuid)) {
        s.vvm_files.forEach((f) => neededVvms.add(f));
      }
    });
    return [...neededVvms].reduce((sum, f) => sum + (catalog.vvm_files[f]?.size_bytes ?? 0), 0);
  })();

  if (speakers.length === 0 && !catalog) {
    return <div className="py-4 text-center text-sm text-text-tertiary">Loading voice catalog…</div>;
  }
  if (speakers.length === 0) {
    return <div className="py-4 text-center text-sm text-text-tertiary">No voices available</div>;
  }

  return (
    <div className="space-y-3">
      {/* Selection mode header */}
      {selectionMode && (
        <div className="flex items-center justify-between px-3 py-2 bg-accent/5 rounded-xl border border-accent/20">
          <div>
            <p className="text-sm font-semibold text-text-primary">
              {selectedCharacters.length > 0
                ? `${selectedCharacters.length} voice${selectedCharacters.length > 1 ? 's' : ''} selected`
                : 'Pick voices to download'}
            </p>
            {totalDownloadSize > 0 && (
              <p className="text-xs text-accent mt-0.5">
                +{formatSize(totalDownloadSize)} model data (on top of ~170 MB engine)
              </p>
            )}
          </div>
          {selectedCharacters.length > 0 && (
            <button
              onClick={() => onClearAll?.()}
              className="text-xs text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Active voice summary (live mode only) */}
      {!selectionMode && (
        <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-xl border border-accent/20">
          {selectedSpeakerUuid && portraits.get(selectedSpeakerUuid) && (
            <img
              src={`data:image/png;base64,${portraits.get(selectedSpeakerUuid)}`}
              alt="" className="w-12 h-12 rounded-lg object-cover object-top"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{selectedSpeakerName ?? 'No voice selected'}</p>
            {selectedStyleName && <p className="text-xs text-accent">{selectedStyleName}</p>}
          </div>
          <span className="text-[10px] text-accent font-medium uppercase tracking-wider shrink-0">Active</span>
        </div>
      )}

      {/* Type bar (live mode only) */}
      {!selectionMode && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSayIt(); }}
            placeholder="Type anything in Japanese to hear it…"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm jp-text"
          />
          <button
            onClick={handleSayIt}
            disabled={!customText.trim() || isSaying}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium shrink-0 cursor-pointer transition-colors',
              isSaying ? 'bg-accent text-white' :
              customText.trim() ? 'bg-accent text-white hover:opacity-90' :
              'bg-bg-subtle text-text-tertiary cursor-not-allowed'
            )}
          >
            {isSaying ? 'Speaking…' : 'Say it'}
          </button>
        </div>
      )}

      {/* Search */}
      <input
        type="text" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search voices…"
        className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm"
      />

      {/* Voice grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
        {filtered.map((speaker) => {
          const portrait = portraits.get(speaker.uuid);
          const isExpanded = expandedSpeaker === speaker.uuid;
          const catalogSpeaker = catalog?.speakers.find((s) => s.uuid === speaker.uuid);
          const isChecked = selectionMode && isCharacterSelected(speaker.uuid);
          const ownsSelected = !selectionMode && speaker.styles.some((st) => st.id === selectedSpeakerId);

          return (
            <motion.div
              key={speaker.uuid}
              layout
              className={cn(
                'rounded-xl border overflow-hidden transition-colors',
                isChecked ? 'border-accent bg-accent/5' :
                ownsSelected ? 'border-accent bg-accent/5' :
                'border-border bg-bg-secondary hover:border-accent/40',
                isExpanded && 'col-span-2 sm:col-span-3'
              )}
            >
              {/* Card header */}
              <div
                className="flex items-center gap-2.5 p-2.5 cursor-pointer"
                onClick={() => setExpandedSpeaker(isExpanded ? null : speaker.uuid)}
              >
                {/* Checkbox in selection mode */}
                {selectionMode && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleCharacter?.(speaker.uuid); }}
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer',
                      isChecked ? 'bg-accent border-accent' : 'border-border hover:border-accent/50'
                    )}
                  >
                    {isChecked && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                )}

                {/* Portrait */}
                <div className="w-12 h-12 rounded-lg bg-bg-subtle shrink-0 overflow-hidden">
                  {portrait ? (
                    <img src={`data:image/png;base64,${portrait}`} alt={speaker.name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg text-text-tertiary">{speaker.name.charAt(0)}</div>
                  )}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{speaker.name}</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">
                    {speaker.styles.length} style{speaker.styles.length > 1 ? 's' : ''}
                    {selectionMode && catalogSpeaker && (
                      <span> · {formatSize(catalogSpeaker.total_size_bytes)}</span>
                    )}
                  </p>
                </div>

                {/* Preview button (plays default sample) */}
                <button
                  onClick={(e) => { e.stopPropagation(); handlePreview(speaker.styles[0].id); }}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer',
                    previewingId === speaker.styles[0].id
                      ? 'bg-accent text-white'
                      : 'bg-bg-subtle text-text-secondary hover:text-accent hover:bg-accent/10'
                  )}
                  title="Preview voice"
                >
                  {previewingId === speaker.styles[0].id ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                      <rect x="1" y="1" width="3" height="8" rx="0.5" />
                      <rect x="6" y="1" width="3" height="8" rx="0.5" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                      <path d="M2 1v8l7-4z" />
                    </svg>
                  )}
                </button>

                {ownsSelected && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
              </div>

              {/* Expanded styles */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border"
                  >
                    <div className="p-2.5 grid gap-1.5">
                      {speaker.styles.map((style) => {
                        const icon = styleIcons.get(style.id);
                        const isActive = style.id === selectedSpeakerId;
                        const isPreviewing = previewingId === style.id;

                        return (
                          <div
                            key={style.id}
                            className={cn('flex items-center gap-2.5 p-2 rounded-lg transition-colors', isActive ? 'bg-accent/10' : 'hover:bg-bg-subtle')}
                          >
                            <div className="w-8 h-8 rounded-md bg-bg-subtle shrink-0 overflow-hidden">
                              {icon ? (
                                <img src={`data:image/png;base64,${icon}`} alt="" className="w-full h-full object-cover object-top" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-text-tertiary">{style.name.charAt(0)}</div>
                              )}
                            </div>
                            <span className={cn('text-sm flex-1', isActive ? 'font-semibold text-accent' : 'text-text-primary')}>
                              {style.name}
                              {isActive && <span className="text-[10px] ml-1.5 opacity-60">active</span>}
                            </span>
                            {/* Preview */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handlePreview(style.id); }}
                              className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer',
                                isPreviewing ? 'bg-accent text-white' : 'bg-bg-subtle text-text-secondary hover:text-accent hover:bg-accent/10'
                              )}
                            >
                              {isPreviewing ? (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="1" y="1" width="3" height="8" rx="0.5" /><rect x="6" y="1" width="3" height="8" rx="0.5" /></svg>
                              ) : (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1v8l7-4z" /></svg>
                              )}
                            </button>
                            {/* Use button (live mode only) */}
                            {!selectionMode && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSelectVoice(style.id); }}
                                disabled={isActive}
                                className={cn(
                                  'px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0',
                                  isActive ? 'bg-accent text-white cursor-default' : 'bg-bg-primary border border-border text-text-secondary hover:border-accent hover:text-accent'
                                )}
                              >
                                {isActive ? 'Selected' : 'Use'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[10px] text-text-tertiary text-center">
        {speakers.length} characters, {speakers.reduce((a, s) => a + s.styles.length, 0)} total voices
      </p>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}
