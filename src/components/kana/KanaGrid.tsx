import { cn } from '@/lib/utils';
import { MasteryIndicator } from './MasteryIndicator';
import { Star } from '@/lib/icons';
import type { KanaMastery } from '@/services/kanaMasteryService';

interface KanaItem {
  id: number;
  character: string;
  romaji: string;
  row_group: string;
  stroke_count: number;
}

interface KanaGridProps {
  kanaList: KanaItem[];
  onSelectKana: (kana: KanaItem) => void;
  type: 'hiragana' | 'katakana';
  mastery?: Map<number, KanaMastery>;
  /** IDs of kana items the user has starred in flashcard mode */
  starredIds?: Set<string>;
}

const ROW_LABELS_HIRAGANA: Record<string, string> = {
  'vowels': 'Vowels (母音)',
  'k-row': 'K Row (か行)',
  's-row': 'S Row (さ行)',
  't-row': 'T Row (た行)',
  'n-row': 'N Row (な行)',
  'h-row': 'H Row (は行)',
  'm-row': 'M Row (ま行)',
  'y-row': 'Y Row (や行)',
  'r-row': 'R Row (ら行)',
  'w-row': 'W Row (わ行)',
  'n-special': 'N (ん)',
  'g-row': 'G Row (が行)',
  'z-row': 'Z Row (ざ行)',
  'd-row': 'D Row (だ行)',
  'b-row': 'B Row (ば行)',
  'p-row': 'P Row (ぱ行)',
};

const ROW_LABELS_KATAKANA: Record<string, string> = {
  'vowels': 'Vowels (母音)',
  'k-row': 'K Row (カ行)',
  's-row': 'S Row (サ行)',
  't-row': 'T Row (タ行)',
  'n-row': 'N Row (ナ行)',
  'h-row': 'H Row (ハ行)',
  'm-row': 'M Row (マ行)',
  'y-row': 'Y Row (ヤ行)',
  'r-row': 'R Row (ラ行)',
  'w-row': 'W Row (ワ行)',
  'n-special': 'N (ン)',
  'g-row': 'G Row (ガ行)',
  'z-row': 'Z Row (ザ行)',
  'd-row': 'D Row (ダ行)',
  'b-row': 'B Row (バ行)',
  'p-row': 'P Row (パ行)',
};

const BASIC_ROWS = ['vowels', 'k-row', 's-row', 't-row', 'n-row', 'h-row', 'm-row', 'y-row', 'r-row', 'w-row', 'n-special'];
const DAKUTEN_ROWS = ['g-row', 'z-row', 'd-row', 'b-row', 'p-row'];
const COMBO_ROWS = ['ky-combo', 'sh-combo', 'ch-combo', 'ny-combo', 'hy-combo', 'my-combo', 'ry-combo', 'gy-combo', 'j-combo', 'by-combo', 'py-combo'];

const COMBO_LABELS: Record<string, string> = {
  'ky-combo': 'KY Combo (きゃ行)',
  'sh-combo': 'SH Combo (しゃ行)',
  'ch-combo': 'CH Combo (ちゃ行)',
  'ny-combo': 'NY Combo (にゃ行)',
  'hy-combo': 'HY Combo (ひゃ行)',
  'my-combo': 'MY Combo (みゃ行)',
  'ry-combo': 'RY Combo (りゃ行)',
  'gy-combo': 'GY Combo (ぎゃ行)',
  'j-combo': 'J Combo (じゃ行)',
  'by-combo': 'BY Combo (びゃ行)',
  'py-combo': 'PY Combo (ぴゃ行)',
};

export function KanaGrid({ kanaList, onSelectKana, type, mastery, starredIds }: KanaGridProps) {
  const rowLabels = { ...(type === 'hiragana' ? ROW_LABELS_HIRAGANA : ROW_LABELS_KATAKANA), ...COMBO_LABELS };

  const groupedKana = kanaList.reduce<Record<string, KanaItem[]>>((acc, kana) => {
    const group = acc[kana.row_group] ?? [];
    return { ...acc, [kana.row_group]: [...group, kana] };
  }, {});

  const renderRow = (rowKey: string) => {
    const row = groupedKana[rowKey];
    if (!row) return null;
    return (
      <div key={rowKey} className="flex items-center gap-3">
        <div className="w-28 text-xs text-text-secondary font-medium shrink-0">
          {rowLabels[rowKey] ?? rowKey}
        </div>
        <div className="flex gap-2">
          {row.map((kana) => {
            const m = mastery?.get(kana.id);
            return (
              <button
                key={kana.id}
                onClick={() => onSelectKana(kana)}
                className={cn(
                  'w-14 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer group relative',
                  'bg-bg-secondary border border-border text-text-primary',
                  'hover:shadow-lg hover:scale-110 hover:border-accent hover:bg-accent/5',
                  'active:scale-100',
                  m ? 'h-[68px] pb-1' : 'h-14'
                )}
              >
                {/* Starred indicator */}
                {starredIds?.has(String(kana.id)) && (
                  <Star size={8} className="absolute top-1 left-1 text-gold-500 fill-gold-500" />
                )}
                <span className="text-xl character-display leading-none group-hover:text-accent transition-colors">
                  {kana.character}
                </span>
                <span className="text-[9px] text-text-secondary mt-0.5 group-hover:text-accent/70 transition-colors">
                  {kana.romaji}
                </span>
                {/* Mastery dots */}
                {m && (
                  <div className="mt-0.5">
                    <MasteryIndicator level={m.masteryLevel} size="sm" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Instruction hint */}
      <p className="text-xs text-text-secondary italic">
        Click any character to see stroke order and details
      </p>

      <div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Basic (基本)
        </h3>
        <div className="space-y-3">
          {BASIC_ROWS.map(renderRow)}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Dakuten & Handakuten (濁点・半濁点)
        </h3>
        <div className="space-y-3">
          {DAKUTEN_ROWS.map(renderRow)}
        </div>
      </div>

      {/* Combination kana — only show if they exist in data */}
      {COMBO_ROWS.some((r) => groupedKana[r]) && (
        <div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Combinations (拗音)
          </h3>
          <div className="space-y-3">
            {COMBO_ROWS.map(renderRow)}
          </div>
        </div>
      )}
    </div>
  );
}

export function getRowLabel(rowGroup: string, type: 'hiragana' | 'katakana'): string {
  const labels = type === 'hiragana' ? ROW_LABELS_HIRAGANA : ROW_LABELS_KATAKANA;
  return labels[rowGroup] ?? rowGroup;
}
