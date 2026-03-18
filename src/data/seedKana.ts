import { query, execute } from '@/lib/db';

interface KanaEntry {
  character: string;
  type: 'hiragana' | 'katakana';
  romaji: string;
  rowGroup: string;
  strokeCount: number;
  sortOrder: number;
}

const HIRAGANA_DATA: KanaEntry[] = [
  // Vowels
  { character: 'あ', type: 'hiragana', romaji: 'a', rowGroup: 'vowels', strokeCount: 3, sortOrder: 1 },
  { character: 'い', type: 'hiragana', romaji: 'i', rowGroup: 'vowels', strokeCount: 2, sortOrder: 2 },
  { character: 'う', type: 'hiragana', romaji: 'u', rowGroup: 'vowels', strokeCount: 2, sortOrder: 3 },
  { character: 'え', type: 'hiragana', romaji: 'e', rowGroup: 'vowels', strokeCount: 2, sortOrder: 4 },
  { character: 'お', type: 'hiragana', romaji: 'o', rowGroup: 'vowels', strokeCount: 3, sortOrder: 5 },
  // K-row
  { character: 'か', type: 'hiragana', romaji: 'ka', rowGroup: 'k-row', strokeCount: 3, sortOrder: 6 },
  { character: 'き', type: 'hiragana', romaji: 'ki', rowGroup: 'k-row', strokeCount: 4, sortOrder: 7 },
  { character: 'く', type: 'hiragana', romaji: 'ku', rowGroup: 'k-row', strokeCount: 1, sortOrder: 8 },
  { character: 'け', type: 'hiragana', romaji: 'ke', rowGroup: 'k-row', strokeCount: 3, sortOrder: 9 },
  { character: 'こ', type: 'hiragana', romaji: 'ko', rowGroup: 'k-row', strokeCount: 2, sortOrder: 10 },
  // S-row
  { character: 'さ', type: 'hiragana', romaji: 'sa', rowGroup: 's-row', strokeCount: 3, sortOrder: 11 },
  { character: 'し', type: 'hiragana', romaji: 'shi', rowGroup: 's-row', strokeCount: 1, sortOrder: 12 },
  { character: 'す', type: 'hiragana', romaji: 'su', rowGroup: 's-row', strokeCount: 2, sortOrder: 13 },
  { character: 'せ', type: 'hiragana', romaji: 'se', rowGroup: 's-row', strokeCount: 3, sortOrder: 14 },
  { character: 'そ', type: 'hiragana', romaji: 'so', rowGroup: 's-row', strokeCount: 1, sortOrder: 15 },
  // T-row
  { character: 'た', type: 'hiragana', romaji: 'ta', rowGroup: 't-row', strokeCount: 4, sortOrder: 16 },
  { character: 'ち', type: 'hiragana', romaji: 'chi', rowGroup: 't-row', strokeCount: 2, sortOrder: 17 },
  { character: 'つ', type: 'hiragana', romaji: 'tsu', rowGroup: 't-row', strokeCount: 1, sortOrder: 18 },
  { character: 'て', type: 'hiragana', romaji: 'te', rowGroup: 't-row', strokeCount: 1, sortOrder: 19 },
  { character: 'と', type: 'hiragana', romaji: 'to', rowGroup: 't-row', strokeCount: 2, sortOrder: 20 },
  // N-row
  { character: 'な', type: 'hiragana', romaji: 'na', rowGroup: 'n-row', strokeCount: 4, sortOrder: 21 },
  { character: 'に', type: 'hiragana', romaji: 'ni', rowGroup: 'n-row', strokeCount: 3, sortOrder: 22 },
  { character: 'ぬ', type: 'hiragana', romaji: 'nu', rowGroup: 'n-row', strokeCount: 2, sortOrder: 23 },
  { character: 'ね', type: 'hiragana', romaji: 'ne', rowGroup: 'n-row', strokeCount: 2, sortOrder: 24 },
  { character: 'の', type: 'hiragana', romaji: 'no', rowGroup: 'n-row', strokeCount: 1, sortOrder: 25 },
  // H-row
  { character: 'は', type: 'hiragana', romaji: 'ha', rowGroup: 'h-row', strokeCount: 3, sortOrder: 26 },
  { character: 'ひ', type: 'hiragana', romaji: 'hi', rowGroup: 'h-row', strokeCount: 1, sortOrder: 27 },
  { character: 'ふ', type: 'hiragana', romaji: 'fu', rowGroup: 'h-row', strokeCount: 4, sortOrder: 28 },
  { character: 'へ', type: 'hiragana', romaji: 'he', rowGroup: 'h-row', strokeCount: 1, sortOrder: 29 },
  { character: 'ほ', type: 'hiragana', romaji: 'ho', rowGroup: 'h-row', strokeCount: 4, sortOrder: 30 },
  // M-row
  { character: 'ま', type: 'hiragana', romaji: 'ma', rowGroup: 'm-row', strokeCount: 3, sortOrder: 31 },
  { character: 'み', type: 'hiragana', romaji: 'mi', rowGroup: 'm-row', strokeCount: 2, sortOrder: 32 },
  { character: 'む', type: 'hiragana', romaji: 'mu', rowGroup: 'm-row', strokeCount: 3, sortOrder: 33 },
  { character: 'め', type: 'hiragana', romaji: 'me', rowGroup: 'm-row', strokeCount: 2, sortOrder: 34 },
  { character: 'も', type: 'hiragana', romaji: 'mo', rowGroup: 'm-row', strokeCount: 3, sortOrder: 35 },
  // Y-row
  { character: 'や', type: 'hiragana', romaji: 'ya', rowGroup: 'y-row', strokeCount: 3, sortOrder: 36 },
  { character: 'ゆ', type: 'hiragana', romaji: 'yu', rowGroup: 'y-row', strokeCount: 2, sortOrder: 37 },
  { character: 'よ', type: 'hiragana', romaji: 'yo', rowGroup: 'y-row', strokeCount: 2, sortOrder: 38 },
  // R-row
  { character: 'ら', type: 'hiragana', romaji: 'ra', rowGroup: 'r-row', strokeCount: 2, sortOrder: 39 },
  { character: 'り', type: 'hiragana', romaji: 'ri', rowGroup: 'r-row', strokeCount: 2, sortOrder: 40 },
  { character: 'る', type: 'hiragana', romaji: 'ru', rowGroup: 'r-row', strokeCount: 1, sortOrder: 41 },
  { character: 'れ', type: 'hiragana', romaji: 're', rowGroup: 'r-row', strokeCount: 2, sortOrder: 42 },
  { character: 'ろ', type: 'hiragana', romaji: 'ro', rowGroup: 'r-row', strokeCount: 1, sortOrder: 43 },
  // W-row
  { character: 'わ', type: 'hiragana', romaji: 'wa', rowGroup: 'w-row', strokeCount: 2, sortOrder: 44 },
  { character: 'を', type: 'hiragana', romaji: 'wo', rowGroup: 'w-row', strokeCount: 3, sortOrder: 45 },
  // N
  { character: 'ん', type: 'hiragana', romaji: 'n', rowGroup: 'n-special', strokeCount: 1, sortOrder: 46 },
  // Dakuten
  { character: 'が', type: 'hiragana', romaji: 'ga', rowGroup: 'g-row', strokeCount: 4, sortOrder: 47 },
  { character: 'ぎ', type: 'hiragana', romaji: 'gi', rowGroup: 'g-row', strokeCount: 5, sortOrder: 48 },
  { character: 'ぐ', type: 'hiragana', romaji: 'gu', rowGroup: 'g-row', strokeCount: 2, sortOrder: 49 },
  { character: 'げ', type: 'hiragana', romaji: 'ge', rowGroup: 'g-row', strokeCount: 4, sortOrder: 50 },
  { character: 'ご', type: 'hiragana', romaji: 'go', rowGroup: 'g-row', strokeCount: 3, sortOrder: 51 },
  { character: 'ざ', type: 'hiragana', romaji: 'za', rowGroup: 'z-row', strokeCount: 4, sortOrder: 52 },
  { character: 'じ', type: 'hiragana', romaji: 'ji', rowGroup: 'z-row', strokeCount: 2, sortOrder: 53 },
  { character: 'ず', type: 'hiragana', romaji: 'zu', rowGroup: 'z-row', strokeCount: 3, sortOrder: 54 },
  { character: 'ぜ', type: 'hiragana', romaji: 'ze', rowGroup: 'z-row', strokeCount: 4, sortOrder: 55 },
  { character: 'ぞ', type: 'hiragana', romaji: 'zo', rowGroup: 'z-row', strokeCount: 2, sortOrder: 56 },
  { character: 'だ', type: 'hiragana', romaji: 'da', rowGroup: 'd-row', strokeCount: 5, sortOrder: 57 },
  { character: 'ぢ', type: 'hiragana', romaji: 'di', rowGroup: 'd-row', strokeCount: 3, sortOrder: 58 },
  { character: 'づ', type: 'hiragana', romaji: 'du', rowGroup: 'd-row', strokeCount: 2, sortOrder: 59 },
  { character: 'で', type: 'hiragana', romaji: 'de', rowGroup: 'd-row', strokeCount: 2, sortOrder: 60 },
  { character: 'ど', type: 'hiragana', romaji: 'do', rowGroup: 'd-row', strokeCount: 3, sortOrder: 61 },
  { character: 'ば', type: 'hiragana', romaji: 'ba', rowGroup: 'b-row', strokeCount: 4, sortOrder: 62 },
  { character: 'び', type: 'hiragana', romaji: 'bi', rowGroup: 'b-row', strokeCount: 2, sortOrder: 63 },
  { character: 'ぶ', type: 'hiragana', romaji: 'bu', rowGroup: 'b-row', strokeCount: 5, sortOrder: 64 },
  { character: 'べ', type: 'hiragana', romaji: 'be', rowGroup: 'b-row', strokeCount: 2, sortOrder: 65 },
  { character: 'ぼ', type: 'hiragana', romaji: 'bo', rowGroup: 'b-row', strokeCount: 5, sortOrder: 66 },
  // Handakuten
  { character: 'ぱ', type: 'hiragana', romaji: 'pa', rowGroup: 'p-row', strokeCount: 4, sortOrder: 67 },
  { character: 'ぴ', type: 'hiragana', romaji: 'pi', rowGroup: 'p-row', strokeCount: 2, sortOrder: 68 },
  { character: 'ぷ', type: 'hiragana', romaji: 'pu', rowGroup: 'p-row', strokeCount: 5, sortOrder: 69 },
  { character: 'ぺ', type: 'hiragana', romaji: 'pe', rowGroup: 'p-row', strokeCount: 2, sortOrder: 70 },
  { character: 'ぽ', type: 'hiragana', romaji: 'po', rowGroup: 'p-row', strokeCount: 5, sortOrder: 71 },
];

const KATAKANA_DATA: KanaEntry[] = [
  // Vowels
  { character: 'ア', type: 'katakana', romaji: 'a', rowGroup: 'vowels', strokeCount: 2, sortOrder: 1 },
  { character: 'イ', type: 'katakana', romaji: 'i', rowGroup: 'vowels', strokeCount: 2, sortOrder: 2 },
  { character: 'ウ', type: 'katakana', romaji: 'u', rowGroup: 'vowels', strokeCount: 3, sortOrder: 3 },
  { character: 'エ', type: 'katakana', romaji: 'e', rowGroup: 'vowels', strokeCount: 3, sortOrder: 4 },
  { character: 'オ', type: 'katakana', romaji: 'o', rowGroup: 'vowels', strokeCount: 3, sortOrder: 5 },
  // K-row
  { character: 'カ', type: 'katakana', romaji: 'ka', rowGroup: 'k-row', strokeCount: 2, sortOrder: 6 },
  { character: 'キ', type: 'katakana', romaji: 'ki', rowGroup: 'k-row', strokeCount: 3, sortOrder: 7 },
  { character: 'ク', type: 'katakana', romaji: 'ku', rowGroup: 'k-row', strokeCount: 2, sortOrder: 8 },
  { character: 'ケ', type: 'katakana', romaji: 'ke', rowGroup: 'k-row', strokeCount: 3, sortOrder: 9 },
  { character: 'コ', type: 'katakana', romaji: 'ko', rowGroup: 'k-row', strokeCount: 2, sortOrder: 10 },
  // S-row
  { character: 'サ', type: 'katakana', romaji: 'sa', rowGroup: 's-row', strokeCount: 3, sortOrder: 11 },
  { character: 'シ', type: 'katakana', romaji: 'shi', rowGroup: 's-row', strokeCount: 3, sortOrder: 12 },
  { character: 'ス', type: 'katakana', romaji: 'su', rowGroup: 's-row', strokeCount: 2, sortOrder: 13 },
  { character: 'セ', type: 'katakana', romaji: 'se', rowGroup: 's-row', strokeCount: 2, sortOrder: 14 },
  { character: 'ソ', type: 'katakana', romaji: 'so', rowGroup: 's-row', strokeCount: 2, sortOrder: 15 },
  // T-row
  { character: 'タ', type: 'katakana', romaji: 'ta', rowGroup: 't-row', strokeCount: 3, sortOrder: 16 },
  { character: 'チ', type: 'katakana', romaji: 'chi', rowGroup: 't-row', strokeCount: 3, sortOrder: 17 },
  { character: 'ツ', type: 'katakana', romaji: 'tsu', rowGroup: 't-row', strokeCount: 3, sortOrder: 18 },
  { character: 'テ', type: 'katakana', romaji: 'te', rowGroup: 't-row', strokeCount: 3, sortOrder: 19 },
  { character: 'ト', type: 'katakana', romaji: 'to', rowGroup: 't-row', strokeCount: 2, sortOrder: 20 },
  // N-row
  { character: 'ナ', type: 'katakana', romaji: 'na', rowGroup: 'n-row', strokeCount: 2, sortOrder: 21 },
  { character: 'ニ', type: 'katakana', romaji: 'ni', rowGroup: 'n-row', strokeCount: 2, sortOrder: 22 },
  { character: 'ヌ', type: 'katakana', romaji: 'nu', rowGroup: 'n-row', strokeCount: 2, sortOrder: 23 },
  { character: 'ネ', type: 'katakana', romaji: 'ne', rowGroup: 'n-row', strokeCount: 4, sortOrder: 24 },
  { character: 'ノ', type: 'katakana', romaji: 'no', rowGroup: 'n-row', strokeCount: 1, sortOrder: 25 },
  // H-row
  { character: 'ハ', type: 'katakana', romaji: 'ha', rowGroup: 'h-row', strokeCount: 2, sortOrder: 26 },
  { character: 'ヒ', type: 'katakana', romaji: 'hi', rowGroup: 'h-row', strokeCount: 2, sortOrder: 27 },
  { character: 'フ', type: 'katakana', romaji: 'fu', rowGroup: 'h-row', strokeCount: 1, sortOrder: 28 },
  { character: 'ヘ', type: 'katakana', romaji: 'he', rowGroup: 'h-row', strokeCount: 1, sortOrder: 29 },
  { character: 'ホ', type: 'katakana', romaji: 'ho', rowGroup: 'h-row', strokeCount: 4, sortOrder: 30 },
  // M-row
  { character: 'マ', type: 'katakana', romaji: 'ma', rowGroup: 'm-row', strokeCount: 2, sortOrder: 31 },
  { character: 'ミ', type: 'katakana', romaji: 'mi', rowGroup: 'm-row', strokeCount: 3, sortOrder: 32 },
  { character: 'ム', type: 'katakana', romaji: 'mu', rowGroup: 'm-row', strokeCount: 2, sortOrder: 33 },
  { character: 'メ', type: 'katakana', romaji: 'me', rowGroup: 'm-row', strokeCount: 2, sortOrder: 34 },
  { character: 'モ', type: 'katakana', romaji: 'mo', rowGroup: 'm-row', strokeCount: 3, sortOrder: 35 },
  // Y-row
  { character: 'ヤ', type: 'katakana', romaji: 'ya', rowGroup: 'y-row', strokeCount: 2, sortOrder: 36 },
  { character: 'ユ', type: 'katakana', romaji: 'yu', rowGroup: 'y-row', strokeCount: 2, sortOrder: 37 },
  { character: 'ヨ', type: 'katakana', romaji: 'yo', rowGroup: 'y-row', strokeCount: 3, sortOrder: 38 },
  // R-row
  { character: 'ラ', type: 'katakana', romaji: 'ra', rowGroup: 'r-row', strokeCount: 2, sortOrder: 39 },
  { character: 'リ', type: 'katakana', romaji: 'ri', rowGroup: 'r-row', strokeCount: 2, sortOrder: 40 },
  { character: 'ル', type: 'katakana', romaji: 'ru', rowGroup: 'r-row', strokeCount: 2, sortOrder: 41 },
  { character: 'レ', type: 'katakana', romaji: 're', rowGroup: 'r-row', strokeCount: 1, sortOrder: 42 },
  { character: 'ロ', type: 'katakana', romaji: 'ro', rowGroup: 'r-row', strokeCount: 3, sortOrder: 43 },
  // W-row
  { character: 'ワ', type: 'katakana', romaji: 'wa', rowGroup: 'w-row', strokeCount: 2, sortOrder: 44 },
  { character: 'ヲ', type: 'katakana', romaji: 'wo', rowGroup: 'w-row', strokeCount: 3, sortOrder: 45 },
  // N
  { character: 'ン', type: 'katakana', romaji: 'n', rowGroup: 'n-special', strokeCount: 2, sortOrder: 46 },
  // Dakuten
  { character: 'ガ', type: 'katakana', romaji: 'ga', rowGroup: 'g-row', strokeCount: 3, sortOrder: 47 },
  { character: 'ギ', type: 'katakana', romaji: 'gi', rowGroup: 'g-row', strokeCount: 4, sortOrder: 48 },
  { character: 'グ', type: 'katakana', romaji: 'gu', rowGroup: 'g-row', strokeCount: 3, sortOrder: 49 },
  { character: 'ゲ', type: 'katakana', romaji: 'ge', rowGroup: 'g-row', strokeCount: 4, sortOrder: 50 },
  { character: 'ゴ', type: 'katakana', romaji: 'go', rowGroup: 'g-row', strokeCount: 3, sortOrder: 51 },
  { character: 'ザ', type: 'katakana', romaji: 'za', rowGroup: 'z-row', strokeCount: 4, sortOrder: 52 },
  { character: 'ジ', type: 'katakana', romaji: 'ji', rowGroup: 'z-row', strokeCount: 4, sortOrder: 53 },
  { character: 'ズ', type: 'katakana', romaji: 'zu', rowGroup: 'z-row', strokeCount: 3, sortOrder: 54 },
  { character: 'ゼ', type: 'katakana', romaji: 'ze', rowGroup: 'z-row', strokeCount: 3, sortOrder: 55 },
  { character: 'ゾ', type: 'katakana', romaji: 'zo', rowGroup: 'z-row', strokeCount: 3, sortOrder: 56 },
  { character: 'ダ', type: 'katakana', romaji: 'da', rowGroup: 'd-row', strokeCount: 4, sortOrder: 57 },
  { character: 'ヂ', type: 'katakana', romaji: 'di', rowGroup: 'd-row', strokeCount: 4, sortOrder: 58 },
  { character: 'ヅ', type: 'katakana', romaji: 'du', rowGroup: 'd-row', strokeCount: 4, sortOrder: 59 },
  { character: 'デ', type: 'katakana', romaji: 'de', rowGroup: 'd-row', strokeCount: 4, sortOrder: 60 },
  { character: 'ド', type: 'katakana', romaji: 'do', rowGroup: 'd-row', strokeCount: 3, sortOrder: 61 },
  { character: 'バ', type: 'katakana', romaji: 'ba', rowGroup: 'b-row', strokeCount: 3, sortOrder: 62 },
  { character: 'ビ', type: 'katakana', romaji: 'bi', rowGroup: 'b-row', strokeCount: 3, sortOrder: 63 },
  { character: 'ブ', type: 'katakana', romaji: 'bu', rowGroup: 'b-row', strokeCount: 2, sortOrder: 64 },
  { character: 'ベ', type: 'katakana', romaji: 'be', rowGroup: 'b-row', strokeCount: 2, sortOrder: 65 },
  { character: 'ボ', type: 'katakana', romaji: 'bo', rowGroup: 'b-row', strokeCount: 5, sortOrder: 66 },
  { character: 'パ', type: 'katakana', romaji: 'pa', rowGroup: 'p-row', strokeCount: 3, sortOrder: 67 },
  { character: 'ピ', type: 'katakana', romaji: 'pi', rowGroup: 'p-row', strokeCount: 3, sortOrder: 68 },
  { character: 'プ', type: 'katakana', romaji: 'pu', rowGroup: 'p-row', strokeCount: 2, sortOrder: 69 },
  { character: 'ペ', type: 'katakana', romaji: 'pe', rowGroup: 'p-row', strokeCount: 2, sortOrder: 70 },
  { character: 'ポ', type: 'katakana', romaji: 'po', rowGroup: 'p-row', strokeCount: 5, sortOrder: 71 },
];

// ── Combination Kana (拗音) ──────────────────────────────────

const HIRAGANA_COMBOS: KanaEntry[] = [
  { character: 'きゃ', type: 'hiragana', romaji: 'kya', rowGroup: 'ky-combo', strokeCount: 6, sortOrder: 100 },
  { character: 'きゅ', type: 'hiragana', romaji: 'kyu', rowGroup: 'ky-combo', strokeCount: 5, sortOrder: 101 },
  { character: 'きょ', type: 'hiragana', romaji: 'kyo', rowGroup: 'ky-combo', strokeCount: 6, sortOrder: 102 },
  { character: 'しゃ', type: 'hiragana', romaji: 'sha', rowGroup: 'sh-combo', strokeCount: 4, sortOrder: 103 },
  { character: 'しゅ', type: 'hiragana', romaji: 'shu', rowGroup: 'sh-combo', strokeCount: 3, sortOrder: 104 },
  { character: 'しょ', type: 'hiragana', romaji: 'sho', rowGroup: 'sh-combo', strokeCount: 4, sortOrder: 105 },
  { character: 'ちゃ', type: 'hiragana', romaji: 'cha', rowGroup: 'ch-combo', strokeCount: 5, sortOrder: 106 },
  { character: 'ちゅ', type: 'hiragana', romaji: 'chu', rowGroup: 'ch-combo', strokeCount: 4, sortOrder: 107 },
  { character: 'ちょ', type: 'hiragana', romaji: 'cho', rowGroup: 'ch-combo', strokeCount: 5, sortOrder: 108 },
  { character: 'にゃ', type: 'hiragana', romaji: 'nya', rowGroup: 'ny-combo', strokeCount: 5, sortOrder: 109 },
  { character: 'にゅ', type: 'hiragana', romaji: 'nyu', rowGroup: 'ny-combo', strokeCount: 4, sortOrder: 110 },
  { character: 'にょ', type: 'hiragana', romaji: 'nyo', rowGroup: 'ny-combo', strokeCount: 5, sortOrder: 111 },
  { character: 'ひゃ', type: 'hiragana', romaji: 'hya', rowGroup: 'hy-combo', strokeCount: 5, sortOrder: 112 },
  { character: 'ひゅ', type: 'hiragana', romaji: 'hyu', rowGroup: 'hy-combo', strokeCount: 4, sortOrder: 113 },
  { character: 'ひょ', type: 'hiragana', romaji: 'hyo', rowGroup: 'hy-combo', strokeCount: 5, sortOrder: 114 },
  { character: 'みゃ', type: 'hiragana', romaji: 'mya', rowGroup: 'my-combo', strokeCount: 5, sortOrder: 115 },
  { character: 'みゅ', type: 'hiragana', romaji: 'myu', rowGroup: 'my-combo', strokeCount: 4, sortOrder: 116 },
  { character: 'みょ', type: 'hiragana', romaji: 'myo', rowGroup: 'my-combo', strokeCount: 5, sortOrder: 117 },
  { character: 'りゃ', type: 'hiragana', romaji: 'rya', rowGroup: 'ry-combo', strokeCount: 4, sortOrder: 118 },
  { character: 'りゅ', type: 'hiragana', romaji: 'ryu', rowGroup: 'ry-combo', strokeCount: 3, sortOrder: 119 },
  { character: 'りょ', type: 'hiragana', romaji: 'ryo', rowGroup: 'ry-combo', strokeCount: 4, sortOrder: 120 },
  // Dakuten combos
  { character: 'ぎゃ', type: 'hiragana', romaji: 'gya', rowGroup: 'gy-combo', strokeCount: 6, sortOrder: 121 },
  { character: 'ぎゅ', type: 'hiragana', romaji: 'gyu', rowGroup: 'gy-combo', strokeCount: 5, sortOrder: 122 },
  { character: 'ぎょ', type: 'hiragana', romaji: 'gyo', rowGroup: 'gy-combo', strokeCount: 6, sortOrder: 123 },
  { character: 'じゃ', type: 'hiragana', romaji: 'ja', rowGroup: 'j-combo', strokeCount: 4, sortOrder: 124 },
  { character: 'じゅ', type: 'hiragana', romaji: 'ju', rowGroup: 'j-combo', strokeCount: 3, sortOrder: 125 },
  { character: 'じょ', type: 'hiragana', romaji: 'jo', rowGroup: 'j-combo', strokeCount: 4, sortOrder: 126 },
  { character: 'びゃ', type: 'hiragana', romaji: 'bya', rowGroup: 'by-combo', strokeCount: 6, sortOrder: 127 },
  { character: 'びゅ', type: 'hiragana', romaji: 'byu', rowGroup: 'by-combo', strokeCount: 5, sortOrder: 128 },
  { character: 'びょ', type: 'hiragana', romaji: 'byo', rowGroup: 'by-combo', strokeCount: 6, sortOrder: 129 },
  { character: 'ぴゃ', type: 'hiragana', romaji: 'pya', rowGroup: 'py-combo', strokeCount: 6, sortOrder: 130 },
  { character: 'ぴゅ', type: 'hiragana', romaji: 'pyu', rowGroup: 'py-combo', strokeCount: 5, sortOrder: 131 },
  { character: 'ぴょ', type: 'hiragana', romaji: 'pyo', rowGroup: 'py-combo', strokeCount: 6, sortOrder: 132 },
];

const KATAKANA_COMBOS: KanaEntry[] = [
  { character: 'キャ', type: 'katakana', romaji: 'kya', rowGroup: 'ky-combo', strokeCount: 5, sortOrder: 100 },
  { character: 'キュ', type: 'katakana', romaji: 'kyu', rowGroup: 'ky-combo', strokeCount: 5, sortOrder: 101 },
  { character: 'キョ', type: 'katakana', romaji: 'kyo', rowGroup: 'ky-combo', strokeCount: 5, sortOrder: 102 },
  { character: 'シャ', type: 'katakana', romaji: 'sha', rowGroup: 'sh-combo', strokeCount: 5, sortOrder: 103 },
  { character: 'シュ', type: 'katakana', romaji: 'shu', rowGroup: 'sh-combo', strokeCount: 5, sortOrder: 104 },
  { character: 'ショ', type: 'katakana', romaji: 'sho', rowGroup: 'sh-combo', strokeCount: 5, sortOrder: 105 },
  { character: 'チャ', type: 'katakana', romaji: 'cha', rowGroup: 'ch-combo', strokeCount: 5, sortOrder: 106 },
  { character: 'チュ', type: 'katakana', romaji: 'chu', rowGroup: 'ch-combo', strokeCount: 5, sortOrder: 107 },
  { character: 'チョ', type: 'katakana', romaji: 'cho', rowGroup: 'ch-combo', strokeCount: 5, sortOrder: 108 },
  { character: 'ニャ', type: 'katakana', romaji: 'nya', rowGroup: 'ny-combo', strokeCount: 5, sortOrder: 109 },
  { character: 'ニュ', type: 'katakana', romaji: 'nyu', rowGroup: 'ny-combo', strokeCount: 5, sortOrder: 110 },
  { character: 'ニョ', type: 'katakana', romaji: 'nyo', rowGroup: 'ny-combo', strokeCount: 5, sortOrder: 111 },
  { character: 'ヒャ', type: 'katakana', romaji: 'hya', rowGroup: 'hy-combo', strokeCount: 4, sortOrder: 112 },
  { character: 'ヒュ', type: 'katakana', romaji: 'hyu', rowGroup: 'hy-combo', strokeCount: 4, sortOrder: 113 },
  { character: 'ヒョ', type: 'katakana', romaji: 'hyo', rowGroup: 'hy-combo', strokeCount: 4, sortOrder: 114 },
  { character: 'ミャ', type: 'katakana', romaji: 'mya', rowGroup: 'my-combo', strokeCount: 5, sortOrder: 115 },
  { character: 'ミュ', type: 'katakana', romaji: 'myu', rowGroup: 'my-combo', strokeCount: 5, sortOrder: 116 },
  { character: 'ミョ', type: 'katakana', romaji: 'myo', rowGroup: 'my-combo', strokeCount: 5, sortOrder: 117 },
  { character: 'リャ', type: 'katakana', romaji: 'rya', rowGroup: 'ry-combo', strokeCount: 4, sortOrder: 118 },
  { character: 'リュ', type: 'katakana', romaji: 'ryu', rowGroup: 'ry-combo', strokeCount: 4, sortOrder: 119 },
  { character: 'リョ', type: 'katakana', romaji: 'ryo', rowGroup: 'ry-combo', strokeCount: 4, sortOrder: 120 },
  { character: 'ギャ', type: 'katakana', romaji: 'gya', rowGroup: 'gy-combo', strokeCount: 5, sortOrder: 121 },
  { character: 'ギュ', type: 'katakana', romaji: 'gyu', rowGroup: 'gy-combo', strokeCount: 5, sortOrder: 122 },
  { character: 'ギョ', type: 'katakana', romaji: 'gyo', rowGroup: 'gy-combo', strokeCount: 5, sortOrder: 123 },
  { character: 'ジャ', type: 'katakana', romaji: 'ja', rowGroup: 'j-combo', strokeCount: 5, sortOrder: 124 },
  { character: 'ジュ', type: 'katakana', romaji: 'ju', rowGroup: 'j-combo', strokeCount: 5, sortOrder: 125 },
  { character: 'ジョ', type: 'katakana', romaji: 'jo', rowGroup: 'j-combo', strokeCount: 5, sortOrder: 126 },
  { character: 'ビャ', type: 'katakana', romaji: 'bya', rowGroup: 'by-combo', strokeCount: 5, sortOrder: 127 },
  { character: 'ビュ', type: 'katakana', romaji: 'byu', rowGroup: 'by-combo', strokeCount: 5, sortOrder: 128 },
  { character: 'ビョ', type: 'katakana', romaji: 'byo', rowGroup: 'by-combo', strokeCount: 5, sortOrder: 129 },
  { character: 'ピャ', type: 'katakana', romaji: 'pya', rowGroup: 'py-combo', strokeCount: 5, sortOrder: 130 },
  { character: 'ピュ', type: 'katakana', romaji: 'pyu', rowGroup: 'py-combo', strokeCount: 5, sortOrder: 131 },
  { character: 'ピョ', type: 'katakana', romaji: 'pyo', rowGroup: 'py-combo', strokeCount: 5, sortOrder: 132 },
];

let seedPromise: Promise<void> | null = null;

/**
 * Seed kana data into the database if not already present.
 * Uses INSERT OR IGNORE with the unique index to prevent duplicates.
 * Singleton promise prevents race conditions under React StrictMode.
 */
export async function seedKanaData(): Promise<void> {
  if (!seedPromise) {
    seedPromise = doSeed();
  }
  return seedPromise;
}

async function doSeed(): Promise<void> {
  const allKana = [
    ...HIRAGANA_DATA,
    ...KATAKANA_DATA,
    ...HIRAGANA_COMBOS,
    ...KATAKANA_COMBOS,
  ];

  const existing = await query<{ count: number }>('SELECT COUNT(*) as count FROM kana');
  if ((existing[0]?.count ?? 0) >= allKana.length) {
    return; // Already fully seeded
  }

  for (const kana of allKana) {
    await execute(
      `INSERT OR IGNORE INTO kana (character, type, romaji, row_group, stroke_count, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [kana.character, kana.type, kana.romaji, kana.rowGroup, kana.strokeCount, kana.sortOrder]
    );
  }
}
