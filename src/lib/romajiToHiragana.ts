/**
 * Romaji to Hiragana conversion utility.
 * Converts romaji input to hiragana for reading quiz validation.
 */

const ROMAJI_MAP: [string, string][] = [
  // Combination kana (must come before single chars to match greedily)
  ['sha', 'しゃ'], ['shi', 'し'], ['shu', 'しゅ'], ['sho', 'しょ'],
  ['chi', 'ち'], ['tchi', 'っち'], ['cha', 'ちゃ'], ['chu', 'ちゅ'], ['cho', 'ちょ'],
  ['tsu', 'つ'],
  ['kya', 'きゃ'], ['kyu', 'きゅ'], ['kyo', 'きょ'],
  ['nya', 'にゃ'], ['nyu', 'にゅ'], ['nyo', 'にょ'],
  ['hya', 'ひゃ'], ['hyu', 'ひゅ'], ['hyo', 'ひょ'],
  ['mya', 'みゃ'], ['myu', 'みゅ'], ['myo', 'みょ'],
  ['rya', 'りゃ'], ['ryu', 'りゅ'], ['ryo', 'りょ'],
  ['gya', 'ぎゃ'], ['gyu', 'ぎゅ'], ['gyo', 'ぎょ'],
  ['ja', 'じゃ'], ['ju', 'じゅ'], ['jo', 'じょ'],
  ['bya', 'びゃ'], ['byu', 'びゅ'], ['byo', 'びょ'],
  ['pya', 'ぴゃ'], ['pyu', 'ぴゅ'], ['pyo', 'ぴょ'],
  // Double consonants (っ)
  ['kk', 'っk'], ['ss', 'っs'], ['tt', 'っt'], ['pp', 'っp'],
  ['cc', 'っc'], ['mm', 'っm'],
  // Basic kana
  ['ka', 'か'], ['ki', 'き'], ['ku', 'く'], ['ke', 'け'], ['ko', 'こ'],
  ['sa', 'さ'], ['si', 'し'], ['su', 'す'], ['se', 'せ'], ['so', 'そ'],
  ['ta', 'た'], ['ti', 'ち'], ['tu', 'つ'], ['te', 'て'], ['to', 'と'],
  ['na', 'な'], ['ni', 'に'], ['nu', 'ぬ'], ['ne', 'ね'], ['no', 'の'],
  ['ha', 'は'], ['hi', 'ひ'], ['hu', 'ふ'], ['fu', 'ふ'], ['he', 'へ'], ['ho', 'ほ'],
  ['ma', 'ま'], ['mi', 'み'], ['mu', 'む'], ['me', 'め'], ['mo', 'も'],
  ['ya', 'や'], ['yu', 'ゆ'], ['yo', 'よ'],
  ['ra', 'ら'], ['ri', 'り'], ['ru', 'る'], ['re', 'れ'], ['ro', 'ろ'],
  ['wa', 'わ'], ['wi', 'ゐ'], ['we', 'ゑ'], ['wo', 'を'],
  ['nn', 'ん'], ['n\'', 'ん'],
  // Dakuten
  ['ga', 'が'], ['gi', 'ぎ'], ['gu', 'ぐ'], ['ge', 'げ'], ['go', 'ご'],
  ['za', 'ざ'], ['ji', 'じ'], ['zi', 'じ'], ['zu', 'ず'], ['ze', 'ぜ'], ['zo', 'ぞ'],
  ['da', 'だ'], ['di', 'ぢ'], ['du', 'づ'], ['de', 'で'], ['do', 'ど'],
  ['ba', 'ば'], ['bi', 'び'], ['bu', 'ぶ'], ['be', 'べ'], ['bo', 'ぼ'],
  // Handakuten
  ['pa', 'ぱ'], ['pi', 'ぴ'], ['pu', 'ぷ'], ['pe', 'ぺ'], ['po', 'ぽ'],
  // Vowels (must come last)
  ['a', 'あ'], ['i', 'い'], ['u', 'う'], ['e', 'え'], ['o', 'お'],
  // Standalone n before non-vowel or end of string is handled specially
];

/**
 * Convert romaji string to hiragana.
 * Examples: "nichi" → "にち", "yama" → "やま"
 */
export function romajiToHiragana(input: string): string {
  let result = '';
  let remaining = input.toLowerCase().trim();

  while (remaining.length > 0) {
    let matched = false;

    // Handle standalone 'n' before consonant or end of string
    if (remaining[0] === 'n' && remaining.length >= 1) {
      const next = remaining[1] || '';
      const isVowel = 'aiueoy'.includes(next);
      const isN = next === 'n';
      if (!isVowel && !isN && remaining[0] === 'n') {
        // Check if any longer match exists first
        let longerMatch = false;
        for (const [romaji] of ROMAJI_MAP) {
          if (remaining.startsWith(romaji) && romaji.length > 1) {
            longerMatch = true;
            break;
          }
        }
        if (!longerMatch) {
          result += 'ん';
          remaining = remaining.slice(1);
          matched = true;
          continue;
        }
      }
    }

    // Try matching from longest to shortest
    for (const [romaji, hiragana] of ROMAJI_MAP) {
      if (remaining.startsWith(romaji)) {
        result += hiragana;
        remaining = remaining.slice(romaji.length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Pass through unrecognized characters
      result += remaining[0];
      remaining = remaining.slice(1);
    }
  }

  return result;
}

/**
 * Normalize a Japanese reading for comparison.
 * Strips dots, dashes, and okurigana markers.
 * Examples: "ひと-" → "ひと", "ひと.つ" → "ひとつ"
 */
export function normalizeReading(reading: string): string {
  return reading.replace(/[-.・]/g, '');
}

/**
 * Convert katakana to hiragana.
 * Katakana range: U+30A1–U+30F6, offset from hiragana by 0x60.
 */
export function katakanaToHiragana(str: string): string {
  let result = '';
  for (const ch of str) {
    const code = ch.codePointAt(0) ?? 0;
    // Katakana range (ァ-ヶ): 0x30A1-0x30F6
    if (code >= 0x30A1 && code <= 0x30F6) {
      result += String.fromCodePoint(code - 0x60);
    } else {
      result += ch;
    }
  }
  return result;
}

/**
 * Check if user input matches any of the given readings.
 * Accepts hiragana, katakana, and romaji input.
 * On'yomi readings stored in katakana are compared as hiragana.
 */
export function matchesReading(input: string, readings: string[]): boolean {
  const trimmed = input.trim();
  if (trimmed.length === 0) return false;

  // Normalize all readings to hiragana (strips dots AND converts katakana → hiragana)
  const normalizedReadings = readings.map((r) => katakanaToHiragana(normalizeReading(r)));

  // Also normalize user input to hiragana (in case they typed katakana)
  const inputAsHiragana = katakanaToHiragana(trimmed);

  // Direct match (input is already hiragana or was katakana)
  if (normalizedReadings.includes(inputAsHiragana)) return true;

  // Convert romaji to hiragana and try
  const romajiAsHiragana = romajiToHiragana(trimmed);
  if (normalizedReadings.includes(romajiAsHiragana)) return true;

  // Partial matches
  for (const nr of normalizedReadings) {
    if (nr === romajiAsHiragana || nr === inputAsHiragana || nr === trimmed) return true;
  }

  return false;
}
