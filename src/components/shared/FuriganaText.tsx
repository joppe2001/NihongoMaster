import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/userStore';

// ─── Inline markup parser ────────────────────────────────────
// Handles {漢字|かんじ} syntax already used in some data fields.

interface Segment {
  type: 'text' | 'ruby';
  content: string;
  reading?: string;
}

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /\{([^|]+)\|([^}]+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'ruby', content: match[1], reading: match[2] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments;
}

/** Renders text that may contain {漢字|かんじ} inline markup. Respects global showFurigana setting. */
export function FuriganaText({ text, className = '' }: { text: string; className?: string }) {
  const showFurigana = useUserStore((s) => s.settings.showFurigana);
  const segments = parseSegments(text);

  return (
    <span className={`jp-text ${className}`}>
      {segments.map((seg, i) =>
        seg.type === 'ruby' ? (
          showFurigana ? (
            <ruby key={i}>
              {seg.content}
              <rt className="text-[0.55em] text-text-secondary/70">{seg.reading}</rt>
            </ruby>
          ) : (
            <span key={i}>{seg.content}</span>
          )
        ) : (
          <span key={i}>{seg.content}</span>
        )
      )}
    </span>
  );
}

// ─── Per-kanji alignment ─────────────────────────────────────
// Given a Japanese sentence and its full kana reading, figures out
// which kana belong to which kanji so each kanji gets its own <rt>.
//
// Algorithm:
//   1. Split the sentence into alternating "kanji runs" and "kana runs".
//   2. Kana runs must appear verbatim inside the reading string, so use
//      them as anchors to extract the reading that falls between them.
//   3. Each kanji run gets the reading slice between two kana anchors.
//
// Examples:
//   私は学生です。/ わたしはがくせいです。
//   → [{私,わたし}, {は}, {学生,がくせい}, {です。}]
//
//   写真を撮っても / しゃしんをとっても
//   → [{写真,しゃしん}, {を}, {撮,と}, {っても}]

const KANJI_RE = /[\u4e00-\u9faf\u3400-\u4dbf\u{20000}-\u{2a6df}]/u;

function isKanjiChar(ch: string): boolean {
  return KANJI_RE.test(ch);
}

interface AlignedSegment {
  text: string;
  reading?: string; // only set for kanji runs
}

function alignFurigana(japanese: string, reading: string): AlignedSegment[] {
  // Bail out if there's nothing to annotate
  if (!reading || japanese === reading) return [{ text: japanese }];
  if (!/[\u4e00-\u9faf\u3400-\u4dbf]/u.test(japanese)) return [{ text: japanese }];

  // Split into runs of kanji vs kana/punctuation
  const runs: { text: string; isKanji: boolean }[] = [];
  let i = 0;
  while (i < japanese.length) {
    const kanji = isKanjiChar(japanese[i]);
    let run = japanese[i++];
    while (i < japanese.length && isKanjiChar(japanese[i]) === kanji) {
      run += japanese[i++];
    }
    runs.push({ text: run, isKanji: kanji });
  }

  const segments: AlignedSegment[] = [];
  let readingPos = 0;

  for (let ri = 0; ri < runs.length; ri++) {
    const run = runs[ri];

    if (!run.isKanji) {
      // Non-kanji run: advance reading pointer by its character count.
      // The kana must appear identically in the reading at this position.
      readingPos += run.text.length;
      segments.push({ text: run.text });
    } else {
      // Kanji run: find where the reading for this run ends by locating
      // the NEXT non-kanji run as an anchor inside the remaining reading.
      const nextKana = runs.slice(ri + 1).find((r) => !r.isKanji);

      let readingEnd: number;
      if (nextKana) {
        const anchorIdx = reading.indexOf(nextKana.text, readingPos);
        readingEnd = anchorIdx !== -1 ? anchorIdx : reading.length;
      } else {
        readingEnd = reading.length;
      }

      const kanjiReading = reading.slice(readingPos, readingEnd);
      readingPos = readingEnd;
      segments.push({ text: run.text, reading: kanjiReading || undefined });
    }
  }

  return segments;
}

// ─── FuriganaLine ────────────────────────────────────────────
// The main component for lesson text. Aligns readings per-kanji.

interface FuriganaLineProps {
  /** Japanese sentence or word */
  japanese: string;
  /** Full kana reading of the sentence/word */
  reading?: string;
  /** Show or hide the furigana annotations. Defaults to global showFurigana setting. */
  show?: boolean;
  className?: string;
}

/**
 * Renders Japanese text with per-kanji furigana annotations.
 *
 * When `show=false`, renders as a plain span (no reading shown).
 * When `show=true` and a reading is available, each kanji run gets
 * its own <ruby>/<rt> annotation derived by aligning the reading.
 *
 * Pure-kana text is always rendered without annotation.
 */
export function FuriganaLine({ japanese, reading, show: showProp, className }: FuriganaLineProps) {
  const globalShow = useUserStore((s) => s.settings.showFurigana);
  const show = showProp ?? globalShow;
  if (!show || !reading) {
    return <span className={cn('jp-text', className)}>{japanese}</span>;
  }

  const segments = alignFurigana(japanese, reading);

  // If alignment produced no kanji segments, nothing to annotate
  const anyRuby = segments.some((s) => s.reading);
  if (!anyRuby) {
    return <span className={cn('jp-text', className)}>{japanese}</span>;
  }

  return (
    <span className={cn('jp-text', className)}>
      {segments.map((seg, i) =>
        seg.reading ? (
          <ruby key={i}>
            {seg.text}
            <rt style={{ fontSize: '0.5em', color: 'var(--color-accent)', opacity: 0.85 }}>
              {seg.reading}
            </rt>
          </ruby>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </span>
  );
}

// Keep FuriganaWord as a convenience alias — single words go through
// the same alignment logic, which handles compound kanji correctly.
export function FuriganaWord(props: FuriganaLineProps) {
  return <FuriganaLine {...props} />;
}

// ─── Toggle button ───────────────────────────────────────────

export function FuriganaToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={show ? 'Hide furigana' : 'Show furigana'}
      className={cn(
        'flex items-center px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none shrink-0',
        show
          ? 'bg-accent/15 text-accent'
          : 'bg-bg-subtle text-text-tertiary hover:text-text-secondary'
      )}
    >
      <ruby style={{ fontSize: '1em', lineHeight: 1.9 }}>
        字
        <rt style={{ fontSize: '0.6em', opacity: show ? 1 : 0.4 }}>ふり</rt>
      </ruby>
    </button>
  );
}
